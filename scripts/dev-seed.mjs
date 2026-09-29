/**
 * Dev seed + E2E flow test against a local PocketBase (127.0.0.1:8090).
 * Usage: node scripts/dev-seed.mjs
 */
const PB = "http://127.0.0.1:8090";
const SU = { identity: "admin@mazad.local", password: "MazadAdmin2026!" };

const log = (...a) => console.log(...a);
const ok = (cond, label) => {
  console.log(`${cond ? "PASS" : "FAIL"} — ${label}`);
  if (!cond) process.exitCode = 1;
};

async function api(path, opts = {}, token) {
  const res = await fetch(PB + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && !opts.allowFail) {
    throw new Error(`${path} → ${res.status} ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

const main = async () => {
  // superuser
  const su = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: SU,
  });
  const suToken = su.json.token;
  ok(!!suToken, "superuser auth");

  // clean previous seed
  for (const col of ["deals", "bids", "listings", "sale_requests", "horses"]) {
    const { json } = await api(
      `/api/collections/${col}/records?perPage=200`,
      {},
      suToken,
    );
    for (const item of json.items || []) {
      await api(`/api/collections/${col}/records/${item.id}`, { method: "DELETE" }, suToken);
    }
  }
  const { json: oldUsers } = await api(
    `/api/collections/users/records?filter=phone~"05"`,
    {},
    suToken,
  );
  for (const u of oldUsers.items || []) {
    await api(`/api/collections/users/records/${u.id}`, { method: "DELETE" }, suToken);
  }
  log("cleaned old data");

  // app admin + client
  const { json: adminUser } = await api("/api/collections/users/records", {
    method: "POST",
    body: { name: "إدارة المزاد", phone: "0500000001", password: "Mazad1234", passwordConfirm: "Mazad1234", role: "admin" },
  }, suToken);
  ok(adminUser.role === "admin", "admin user created (role=admin via superuser)");

  const anonRole = await api("/api/collections/users/records", {
    method: "POST",
    allowFail: true,
    body: { name: "هاكر", phone: "0500000099", password: "Hack1234", passwordConfirm: "Hack1234", role: "admin" },
  });
  ok(
    (anonRole.status === 400 && !!anonRole.json.data?.role) ||
      (anonRole.status === 200 && anonRole.json.role === "client"),
    "public signup cannot self-assign admin",
  );

  const { json: client } = await api("/api/collections/users/records", {
    method: "POST",
    body: { name: "عبدالله المطيري", phone: "0500000002", password: "Client123", passwordConfirm: "Client123" },
  });
  ok(client.role === "client", `client user created (${client.phone})`);

  const adminAuth = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: { identity: "0500000001", password: "Mazad1234" },
  });
  const clientAuth = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: { identity: "0500000002", password: "Client123" },
  });
  ok(!!adminAuth.json.token, "admin login with PHONE identity");
  ok(!!clientAuth.json.token, "client login with PHONE identity");
  const adminTok = adminAuth.json.token;
  const clientTok = clientAuth.json.token;

  // client submits horse + sale request
  const { json: horse1 } = await api("/api/collections/horses/records", {
    method: "POST",
    body: { name: "سهم الفرسان", breed: "عربي أصيل", gender: "male", age_years: 5, color: "خمري", description: "حصان سباقات مدرّب" },
  }, clientTok);
  ok(horse1.status === "pending_review" && horse1.owner === client.id, "client horse → pending_review + owner=client");

  const { json: req1 } = await api("/api/collections/sale_requests/records", {
    method: "POST",
    body: { horse: horse1.id, asking_price: 85000, note: "معاينة بعد العصر" },
  }, clientTok);
  ok(req1.seller === client.id && req1.status === "pending", "sale request → seller auto + pending");

  // admin buys it
  const { json: deal1 } = await api("/api/collections/deals/records", {
    method: "POST",
    body: { type: "admin_buys_from_client", horse: horse1.id, seller: client.id, amount: 80000 },
  }, adminTok);
  ok(deal1.buyer === adminUser.id && deal1.status === "pending", "admin created purchase deal");

  const { json: horse1b } = await api(`/api/collections/horses/records/${horse1.id}`, {}, suToken);
  ok(horse1b.owner === adminUser.id && horse1b.status === "owned_by_admin", "horse ownership transferred to admin");
  const { json: req1b } = await api(`/api/collections/sale_requests/records/${req1.id}`, {}, suToken);
  ok(req1b.status === "purchased", "sale request auto → purchased");

  // direct sale listing
  const { json: listing1 } = await api("/api/collections/listings/records", {
    method: "POST",
    body: { type: "direct_sale", horse: horse1.id, price: 120000 },
  }, adminTok);
  ok(listing1.status === "active", "direct listing → active");

  const { json: horse1c } = await api(`/api/collections/horses/records/${horse1.id}`, {}, suToken);
  ok(horse1c.status === "listed", "horse → listed");

  // duplicate listing blocked
  const dup = await api("/api/collections/listings/records", {
    method: "POST",
    allowFail: true,
    body: { type: "auction", horse: horse1.id, start_price: 90000, min_increment: 2000, ends_at: new Date(Date.now() + 3600e3).toISOString() },
  }, adminTok);
  ok(dup.status === 400, "second active listing for same horse blocked");

  // client tries to create a listing → denied by rule
  const rogue = await api("/api/collections/listings/records", {
    method: "POST",
    allowFail: true,
    body: { type: "direct_sale", horse: horse1.id, price: 1 },
  }, clientTok);
  ok(rogue.status === 403 || rogue.status === 400, "client cannot create listings");

  // client buys direct
  const { json: deal2 } = await api("/api/collections/deals/records", {
    method: "POST",
    body: { type: "direct_sale", listing: listing1.id },
  }, clientTok);
  ok(deal2.buyer === client.id && deal2.seller === adminUser.id && deal2.amount === 120000 && deal2.status === "pending", "client buy → deal auto-filled + pending");

  const { json: listing1b } = await api(`/api/collections/listings/records/${listing1.id}`, {}, suToken);
  ok(listing1b.status === "reserved", "listing → reserved");

  // cancel deal → listing back to active
  await api(`/api/collections/deals/records/${deal2.id}`, { method: "PATCH", body: { status: "cancelled" } }, adminTok);
  const { json: listing1c } = await api(`/api/collections/listings/records/${listing1.id}`, {}, suToken);
  ok(listing1c.status === "active", "cancelled deal → listing back to active");

  // admin withdraws the direct listing before auctioning the horse
  await api(`/api/collections/listings/records/${listing1.id}`, { method: "PATCH", body: { status: "cancelled" } }, adminTok);
  const { json: horse1e } = await api(`/api/collections/horses/records/${horse1.id}`, {}, suToken);
  ok(horse1e.status === "owned_by_admin", "cancelled listing → horse back to admin inventory");

  // auction flow
  const { json: listing2 } = await api("/api/collections/listings/records", {
    method: "POST",
    body: {
      type: "auction",
      horse: horse1.id,
      start_price: 100000,
      min_increment: 5000,
      starts_at: new Date(Date.now() - 10e3).toISOString(),
      ends_at: new Date(Date.now() + 150e3).toISOString(),
    },
  }, adminTok);
  ok(listing2.status === "live", "auction created → live (starts in past)");

  const low = await api("/api/collections/bids/records", {
    method: "POST",
    allowFail: true,
    body: { listing: listing2.id, amount: 101000 },
  }, clientTok);
  ok(low.status === 400, `low bid rejected (${low.json.message || ""})`);

  const { json: bid1 } = await api("/api/collections/bids/records", {
    method: "POST",
    body: { listing: listing2.id, amount: 105000 },
  }, clientTok);
  ok(bid1.amount === 105000 && bid1.bidder === client.id, "valid bid accepted");

  const { json: listing2b } = await api(`/api/collections/listings/records/${listing2.id}`, {}, suToken);
  ok(listing2b.current_top_bid === 105000 && listing2b.top_bidder === client.id, "listing top bid denormalized");

  const adminBid = await api("/api/collections/bids/records", {
    method: "POST",
    allowFail: true,
    body: { listing: listing2.id, amount: 110000 },
  }, adminTok);
  ok(adminBid.status === 403 || adminBid.status === 400, "admin cannot bid");

  // end auction now (admin force-end; also what cron does)
  await api(`/api/collections/listings/records/${listing2.id}`, { method: "PATCH", body: { status: "ended" } }, adminTok);
  const deals = await api("/api/collections/deals/records?filter=type='auction_win'", {}, suToken);
  const winDeal = (deals.json.items || [])[0];
  ok(!!winDeal && winDeal.buyer === client.id && winDeal.amount === 105000, "auction ended → auction_win deal for top bidder");

  // confirm deal → horse sold
  await api(`/api/collections/deals/records/${winDeal.id}`, { method: "PATCH", body: { status: "confirmed", payment_note: "تحويل بنكي - الراجحي" } }, adminTok);
  const { json: horse1d } = await api(`/api/collections/horses/records/${horse1.id}`, {}, suToken);
  ok(horse1d.status === "sold", "confirmed deal → horse sold");

  log("\nDone. Seed accounts: admin 0500000001 / Mazad1234 — client 0500000002 / Client123");
};

main().catch((e) => {
  console.error("E2E ERROR:", e.message);
  process.exit(1);
});
