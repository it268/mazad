/// <reference path="../pb_data/types.d.ts" />

/** Email is optional — phone is the auth identity for this app. */
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.getByName("email").required = false;
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.getByName("email").required = true;
  app.save(users);
});
