/// <reference path="../pb_data/types.d.ts" />

/**
 * Seeds the app admin user (role=admin) from PB_ADMIN_PHONE /
 * PB_ADMIN_PASSWORD env vars. No-op when the vars are missing or the
 * user already exists.
 */
migrate((app) => {
  var phone = "";
  var password = "";
  try {
    phone = $os.getenv("PB_ADMIN_PHONE") || "";
    password = $os.getenv("PB_ADMIN_PASSWORD") || "";
  } catch (e) {
    // std binds unavailable — skip
  }
  if (!phone || !password) {
    console.log("mazad: PB_ADMIN_PHONE/PB_ADMIN_PASSWORD not set — skipping admin seed");
    return;
  }

  var users = app.findCollectionByNameOrId("users");
  var existing = null;
  try {
    existing = app.findFirstRecordByFilter(users, 'phone="' + phone + '"');
  } catch (e) {}

  if (existing) {
    console.log("mazad: admin user already exists");
    return;
  }

  var record = new Record(users);
  record.set("name", "إدارة مزاد الفروسية");
  record.set("phone", phone);
  record.set("role", "admin");
  record.set("password", password);
  record.set("passwordConfirm", password);
  app.save(record);
  console.log("mazad: admin user created");
}, (app) => {
  // revert: remove the seeded admin
  try {
    var users = app.findCollectionByNameOrId("users");
    var rec = app.findFirstRecordByFilter(users, 'phone="' + $os.getenv("PB_ADMIN_PHONE") + '"');
    app.delete(rec);
  } catch (e) {}
});
