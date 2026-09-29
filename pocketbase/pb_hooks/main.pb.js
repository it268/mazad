/// <reference path="../pb_data/types.d.ts" />

/**
 * Mazad Alfursya — business logic hooks.
 *
 * IMPORTANT (PocketBase >= 0.40): each handler body is re-compiled and
 * executed in an isolated executor VM — it does NOT see this file's
 * top-level scope. Every handler must therefore be fully self-contained.
 *
 * Internal saves via e.app / $app bypass API rules, so these hooks are
 * the enforcement layer.
 */

// ---------------------------------------------------------------- users
// Public signup is always a client; only admins/superusers may create or
// assign the admin role.
onRecordCreateRequest((e) => {
  var privileged =
    !!e.auth &&
    (e.auth.collection().name === "_superusers" ||
      e.auth.get("role") === "admin");
  if (!privileged) {
    e.record.set("role", "client");
  }
  e.next();
}, "users");

// Clients editing their own profile can never change their role.
onRecordUpdateRequest((e) => {
  var privileged =
    !!e.auth &&
    (e.auth.collection().name === "_superusers" ||
      e.auth.get("role") === "admin");
  if (!privileged) {
    var orig = e.app.findRecordById("users", e.record.id);
    e.record.set("role", orig.get("role"));
  }
  e.next();
}, "users");

// ---------------------------------------------------------------- horses
onRecordCreateRequest((e) => {
  if (!e.auth) {
    e.next();
    return;
  }
  e.record.set("owner", e.auth.id);
  e.record.set(
    "status",
    e.auth.get("role") === "admin" ? "owned_by_admin" : "pending_review",
  );
  e.next();
}, "horses");

// ------------------------------------------------------------ sale_requests
onRecordCreateRequest((e) => {
  e.record.set("seller", e.auth.id);
  e.record.set("status", "pending");
  e.next();
}, "sale_requests");

// ---------------------------------------------------------------- listings
onRecordCreateRequest((e) => {
  var type = e.record.get("type");
  var horse = e.app.findRecordById("horses", e.record.get("horse"));

  var existing = e.app.findRecordsByFilter(
    "listings",
    'horse="' + horse.id + '" && (status="active" || status="reserved" || status="scheduled" || status="live")',
    "",
    1,
    0,
  );
  if (existing.length > 0) {
    throw new BadRequestError("يوجد عرض نشط آخر لنفس الحصان");
  }

  if (type === "direct_sale") {
    if (!e.record.get("price")) {
      throw new BadRequestError("أدخل سعر البيع");
    }
    e.record.set("status", "active");
    horse.set("status", "listed");
  } else if (type === "auction") {
    if (!e.record.get("start_price") || !e.record.get("ends_at")) {
      throw new BadRequestError("أدخل سعر البداية ووقت النهاية");
    }
    var starts = e.record.get("starts_at");
    e.record.set(
      "status",
      starts && new Date(starts).getTime() <= Date.now() ? "live" : "scheduled",
    );
    if (!e.record.get("min_increment")) {
      e.record.set("min_increment", 1000);
    }
    horse.set("status", "in_auction");
  } else {
    throw new BadRequestError("نوع عرض غير معروف");
  }

  e.app.save(horse);
  e.next();
}, "listings");

// listings: admin actions (end/cancel) with their side effects
onRecordUpdateRequest((e) => {
  var orig = e.app.findRecordById("listings", e.record.id);
  var oldStatus = orig.get("status");
  var newStatus = e.record.get("status");

  if (newStatus === "ended" && oldStatus !== "ended") {
    var top = e.record.get("current_top_bid") || 0;
    var horse = e.app.findRecordById("horses", e.record.get("horse"));
    if (top > 0 && e.record.get("top_bidder")) {
      var dealsCol = e.app.findCollectionByNameOrId("deals");
      var deal = new Record(dealsCol);
      deal.set("type", "auction_win");
      deal.set("horse", horse.id);
      deal.set("seller", horse.get("owner"));
      deal.set("buyer", e.record.get("top_bidder"));
      deal.set("listing", e.record.id);
      deal.set("amount", top);
      deal.set("status", "pending");
      e.app.save(deal);
    } else {
      horse.set("status", "owned_by_admin");
      e.app.save(horse);
    }
  }

  if (newStatus === "cancelled" && oldStatus !== "cancelled") {
    var horse2 = e.app.findRecordById("horses", e.record.get("horse"));
    if (["listed", "in_auction", "reserved"].includes(horse2.get("status"))) {
      horse2.set("status", "owned_by_admin");
      e.app.save(horse2);
    }
  }

  e.next();
}, "listings");

// ---------------------------------------------------------------- bids
onRecordCreateRequest((e) => {
  var listing = e.app.findRecordById("listings", e.record.get("listing"));

  if (listing.get("type") !== "auction") {
    throw new BadRequestError("هذا العرض ليس مزاداً");
  }
  if (listing.get("status") !== "live") {
    throw new BadRequestError("المزاد غير مباشر حالياً");
  }
  var ends = listing.get("ends_at");
  if (ends && new Date(ends).getTime() <= Date.now()) {
    throw new BadRequestError("انتهى وقت هذا المزاد");
  }

  var amount = e.record.get("amount") || 0;
  var increment = listing.get("min_increment") || 1;
  var floor =
    (listing.get("current_top_bid") || listing.get("start_price") || 0) +
    increment;
  if (amount < floor) {
    throw new BadRequestError("أقل مزايدة مقبولة هي " + floor + " ريال");
  }

  e.record.set("bidder", e.auth.id);
  e.next();
}, "bids");

onRecordAfterCreateSuccess((e) => {
  var listing = e.app.findRecordById("listings", e.record.get("listing"));
  listing.set("current_top_bid", e.record.get("amount"));
  listing.set("top_bidder", e.record.get("bidder"));

  // anti-snipe: extend by one minute when bidding inside the last minute
  var ends = listing.get("ends_at");
  if (ends) {
    var remain = new Date(ends).getTime() - Date.now();
    if (remain > 0 && remain < 60000) {
      listing.set(
        "ends_at",
        new Date(Date.now() + 60000).toISOString().replace("T", " "),
      );
    }
  }
  e.app.save(listing);
  e.next();
}, "bids");

// ---------------------------------------------------------------- deals
onRecordCreateRequest((e) => {
  try {
    var role = e.auth.get("role");
    var isSuperuser = e.auth.collection().name === "_superusers";
    var type = e.record.get("type");

    if (role === "admin" || isSuperuser) {
      // admin buys a client horse
      if (type !== "admin_buys_from_client") {
        throw new BadRequestError("نوع صفقة غير صالح للإدارة");
      }
      var horse = e.app.findRecordById("horses", e.record.get("horse"));
      if (
        !["pending_review", "accepted", "rejected"].includes(horse.get("status"))
      ) {
        throw new BadRequestError("حالة الحصان لا تسمح بالشراء");
      }
      var adminId =
        isSuperuser ? e.record.get("buyer") : e.auth.id;
      if (!adminId) {
        throw new BadRequestError("حدد المشتري (الإدارة)");
      }
      e.record.set("buyer", adminId);
      e.record.set("status", "pending");

      horse.set("owner", adminId);
      horse.set("status", "owned_by_admin");
      e.app.save(horse);

      // close any pending/accepted sale request for this horse
      var reqs = e.app.findRecordsByFilter(
        "sale_requests",
        'horse="' + horse.id + '" && seller="' + e.record.get("seller") + '" && (status="pending" || status="accepted")',
        "",
        1,
        0,
      );
      if (reqs.length > 0) {
        reqs[0].set("status", "purchased");
        e.app.save(reqs[0]);
      }
    } else {
      // client buys a direct-sale listing
      if (type !== "direct_sale") {
        throw new BadRequestError("غير مسموح");
      }
      var listing = e.app.findRecordById("listings", e.record.get("listing"));
      if (
        listing.get("type") !== "direct_sale" ||
        listing.get("status") !== "active"
      ) {
        throw new BadRequestError("هذا العرض غير متاح حالياً");
      }
      var horseB = e.app.findRecordById("horses", listing.get("horse"));

      e.record.set("buyer", e.auth.id);
      e.record.set("seller", horseB.get("owner"));
      e.record.set("horse", horseB.id);
      e.record.set("amount", listing.get("price"));
      e.record.set("status", "pending");

      listing.set("status", "reserved");
      e.app.save(listing);
    }

    e.next();
  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    console.log("DEALS CREATE HOOK ERROR: " + (err && err.stack ? err.stack : err));
    throw new BadRequestError("خطأ داخلي: " + err);
  }
}, "deals");

onRecordUpdateRequest((e) => {
  var orig = e.app.findRecordById("deals", e.record.id);
  var oldStatus = orig.get("status");
  var newStatus = e.record.get("status");
  if (newStatus === oldStatus) {
    e.next();
    return;
  }

  var listingId = e.record.get("listing");
  var listing = listingId ? e.app.findRecordById("listings", listingId) : null;
  var horse = e.app.findRecordById("horses", e.record.get("horse"));

  if (newStatus === "confirmed" || newStatus === "completed") {
    horse.set("status", "sold");
    e.app.save(horse);
    if (listing) {
      listing.set("status", "sold");
      e.app.save(listing);
    }
  }
  if (newStatus === "cancelled") {
    if (listing && listing.get("status") === "reserved") {
      listing.set("status", "active");
      e.app.save(listing);
    }
  }

  e.next();
}, "deals");

// ---------------------------------------------------------------- cron
// public aggregate stats for the home page counters
routerAdd("GET", "/api/mazad/stats", (e) => {
  var count = function (col, filter) {
    // small scale: fine to list ids only via findRecordsByFilter
    return $app.findRecordsByFilter(col, filter || "", "", 0, 0).length;
  };
  e.json(200, {
    soldHorses: count("horses", 'status="sold"'),
    auctions: count("listings", 'type="auction"'),
    clients: count("users", 'role="client"'),
  });
});

// TEMP debug: which env vars exist inside the container (names only)
routerAdd("GET", "/api/mazad/debug-env", (e) => {
  var names = ["PB_SUPERUSER_EMAIL", "PB_SUPERUSER_PASSWORD", "PB_ADMIN_PHONE", "PB_ADMIN_PASSWORD", "VITE_PB_URL"];
  var out = {};
  for (var i = 0; i < names.length; i++) {
    try {
      out[names[i]] = !!std.getenv(names[i]);
    } catch (err) {
      out[names[i]] = "std error: " + err;
    }
  }
  e.json(200, out);
});

cronAdd("mazadAuctionClock", "* * * * *", () => {
  var now = new Date().toISOString().replace("T", " ");

  // start scheduled auctions
  var toStart = $app.findRecordsByFilter(
    "listings",
    'type="auction" && status="scheduled" && starts_at != "" && starts_at <= "' + now + '"',
    "",
    0,
    0,
  );
  for (var i = 0; i < toStart.length; i++) {
    toStart[i].set("status", "live");
    $app.save(toStart[i]);
  }

  // end finished auctions (same side effects as the request hook above)
  var toEnd = $app.findRecordsByFilter(
    "listings",
    'type="auction" && status="live" && ends_at != "" && ends_at <= "' + now + '"',
    "",
    0,
    0,
  );
  for (var j = 0; j < toEnd.length; j++) {
    var l = toEnd[j];
    l.set("status", "ended");

    var top = l.get("current_top_bid") || 0;
    var horse = $app.findRecordById("horses", l.get("horse"));
    if (top > 0 && l.get("top_bidder")) {
      var dealsCol = $app.findCollectionByNameOrId("deals");
      var deal = new Record(dealsCol);
      deal.set("type", "auction_win");
      deal.set("horse", horse.id);
      deal.set("seller", horse.get("owner"));
      deal.set("buyer", l.get("top_bidder"));
      deal.set("listing", l.id);
      deal.set("amount", top);
      deal.set("status", "pending");
      $app.save(deal);
    } else {
      horse.set("status", "owned_by_admin");
      $app.save(horse);
    }

    $app.save(l);
  }
});
