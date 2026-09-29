/// <reference path="../pb_data/types.d.ts" />

/**
 * Mazad Alfursya — initial schema.
 * users: add phone (identity) + role; create horses, sale_requests,
 * listings, bids, deals.
 */

migrate((app) => {
  // ---------- users ----------
  const users = app.findCollectionByNameOrId("users");

  users.fields.add(
    new TextField({
      name: "phone",
      required: true,
      min: 9,
      max: 15,
      pattern: "^(\\+9665|9665|05)\\d{8}$",
    }),
  );
  users.fields.add(
    new SelectField({
      name: "role",
      required: true,
      maxSelect: 1,
      values: ["client", "admin"],
    }),
  );

  users.passwordAuth.identityFields = ["phone"];
  users.indexes = [
    "CREATE UNIQUE INDEX `idx_users_phone` ON `users` (`phone`)",
  ];
  users.listRule =
    "@request.auth.role = 'admin' || id = @request.auth.id";
  users.viewRule = "@request.auth.id != ''";
  users.createRule = "";
  users.updateRule =
    "id = @request.auth.id || @request.auth.role = 'admin'";
  users.deleteRule = "@request.auth.role = 'admin'";
  app.save(users);

  // ---------- horses ----------
  const horses = new Collection({
    id: "mazad_horses01",
    type: "base",
    name: "horses",
    fields: [
      { type: "text", name: "name", required: true, min: 2, max: 120 },
      { type: "text", name: "breed", required: true, max: 60 },
      {
        type: "select",
        name: "gender",
        required: true,
        maxSelect: 1,
        values: ["male", "female"],
      },
      { type: "number", name: "age_years" },
      { type: "text", name: "color", max: 60 },
      { type: "number", name: "height_cm" },
      { type: "text", name: "lineage", max: 300 },
      { type: "text", name: "description", max: 4000 },
      {
        type: "file",
        name: "images",
        maxSelect: 6,
        maxSize: 8388608,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        type: "relation",
        name: "owner",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: [
          "pending_review",
          "owned_by_admin",
          "listed",
          "in_auction",
          "sold",
          "rejected",
        ],
      },
      { type: "bool", name: "is_featured" },
      {
        type: "autodate",
        name: "created",
        onCreate: true,
      },
      {
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_horses_status` ON `horses` (`status`)",
    ],
    listRule:
      'status != "pending_review" && status != "rejected" || owner = @request.auth.id || @request.auth.role = "admin"',
    viewRule:
      'status != "pending_review" && status != "rejected" || owner = @request.auth.id || @request.auth.role = "admin"',
    createRule: "@request.auth.id != ''",
    updateRule:
      '@request.auth.role = "admin" || (owner = @request.auth.id && status = "pending_review")',
    deleteRule: '@request.auth.role = "admin"',
  });
  app.save(horses);

  // ---------- sale_requests ----------
  const saleRequests = new Collection({
    id: "mazad_salereqs1",
    type: "base",
    name: "sale_requests",
    fields: [
      {
        type: "relation",
        name: "horse",
        required: true,
        collectionId: horses.id,
        maxSelect: 1,
      },
      {
        type: "relation",
        name: "seller",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      { type: "number", name: "asking_price", required: true, min: 1 },
      { type: "text", name: "note", max: 1000 },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: ["pending", "accepted", "rejected", "purchased", "cancelled"],
      },
      { type: "text", name: "admin_note", max: 1000 },
      {
        type: "autodate",
        name: "created",
        onCreate: true,
      },
      {
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_salereq_seller` ON `sale_requests` (`seller`)",
    ],
    listRule:
      'seller = @request.auth.id || @request.auth.role = "admin"',
    viewRule:
      'seller = @request.auth.id || @request.auth.role = "admin"',
    createRule: '@request.auth.role = "client"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule:
      '@request.auth.role = "admin" || (seller = @request.auth.id && status = "pending")',
  });
  app.save(saleRequests);

  // ---------- listings ----------
  const listings = new Collection({
    id: "mazad_listings01",
    type: "base",
    name: "listings",
    fields: [
      {
        type: "relation",
        name: "horse",
        required: true,
        collectionId: horses.id,
        maxSelect: 1,
      },
      {
        type: "select",
        name: "type",
        required: true,
        maxSelect: 1,
        values: ["direct_sale", "auction"],
      },
      { type: "number", name: "price", min: 0 },
      { type: "number", name: "start_price", min: 0 },
      { type: "number", name: "min_increment", min: 0 },
      { type: "date", name: "starts_at" },
      { type: "date", name: "ends_at" },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: [
          "scheduled",
          "live",
          "active",
          "reserved",
          "ended",
          "sold",
          "cancelled",
        ],
      },
      { type: "number", name: "current_top_bid" },
      {
        type: "relation",
        name: "top_bidder",
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      {
        type: "autodate",
        name: "created",
        onCreate: true,
      },
      {
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_listings_horse` ON `listings` (`horse`)",
      "CREATE INDEX `idx_listings_status` ON `listings` (`type`, `status`)",
    ],
    listRule: 'status != "cancelled"',
    viewRule: 'status != "cancelled"',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
  });
  app.save(listings);

  // ---------- bids ----------
  const bids = new Collection({
    id: "mazad_bids000001",
    type: "base",
    name: "bids",
    fields: [
      {
        type: "relation",
        name: "listing",
        required: true,
        collectionId: listings.id,
        maxSelect: 1,
      },
      {
        type: "relation",
        name: "bidder",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      { type: "number", name: "amount", required: true, min: 1 },
      {
        type: "autodate",
        name: "created",
        onCreate: true,
      },
      {
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_bids_listing` ON `bids` (`listing`)",
    ],
    listRule: "",
    viewRule: "",
    createRule: '@request.auth.role = "client"',
    updateRule: null,
    deleteRule: null,
  });
  app.save(bids);

  // ---------- deals ----------
  const deals = new Collection({
    id: "mazad_deals00001",
    type: "base",
    name: "deals",
    fields: [
      {
        type: "relation",
        name: "horse",
        required: true,
        collectionId: horses.id,
        maxSelect: 1,
      },
      {
        type: "relation",
        name: "seller",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      {
        type: "relation",
        name: "buyer",
        required: true,
        collectionId: "_pb_users_auth_",
        maxSelect: 1,
      },
      {
        type: "relation",
        name: "listing",
        collectionId: listings.id,
        maxSelect: 1,
      },
      {
        type: "select",
        name: "type",
        required: true,
        maxSelect: 1,
        values: ["admin_buys_from_client", "direct_sale", "auction_win"],
      },
      { type: "number", name: "amount", required: true, min: 1 },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: ["pending", "confirmed", "completed", "cancelled"],
      },
      { type: "text", name: "payment_note", max: 1000 },
      {
        type: "autodate",
        name: "created",
        onCreate: true,
      },
      {
        type: "autodate",
        name: "updated",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_deals_horse` ON `deals` (`horse`)",
    ],
    listRule:
      'buyer = @request.auth.id || seller = @request.auth.id || @request.auth.role = "admin"',
    viewRule:
      'buyer = @request.auth.id || seller = @request.auth.id || @request.auth.role = "admin"',
    createRule:
      '@request.auth.role = "admin" || @request.auth.role = "client"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: null,
  });
  app.save(deals);
}, (app) => {
  // revert
  for (const name of ["deals", "bids", "listings", "sale_requests", "horses"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch (e) {}
  }
  try {
    const users = app.findCollectionByNameOrId("users");
    users.identityFields = ["email"];
    users.indexes = [];
    app.save(users);
  } catch (e) {}
});
