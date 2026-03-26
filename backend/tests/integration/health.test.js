/**
 * Integration tests — Health & misc routes
 */

const request = require("supertest");
const { createApp } = require("../../src/app");

let app;

beforeAll(async () => {
  ({ app } = await createApp());
});

describe("GET /health", () => {
  it("returns 200 with status success", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

describe("GET /api/health (legacy)", () => {
  it("returns 200 ok:true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("404 handler", () => {
  it("returns 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
  });
});
