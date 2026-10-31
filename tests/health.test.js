import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("GET /health returns service status without a database connection", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "flagforge-api");
});

test("admin routes reject requests without a bearer token", async () => {
  const response = await request(app).get("/api/v1/projects");
  assert.equal(response.status, 401);
  assert.equal(response.body.error, "ADMIN_AUTH_REQUIRED");
});

test("SDK route rejects requests without an SDK key", async () => {
  const response = await request(app).get("/api/v1/sdk/whoami");
  assert.equal(response.status, 401);
  assert.equal(response.body.error, "SDK_KEY_REQUIRED");
});
