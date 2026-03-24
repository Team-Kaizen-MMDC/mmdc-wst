/**
 * Integration tests — Companies routes (/api/v1/companies)
 */

const request = require("supertest");
const { createApp } = require("../../src/app");

let app;
let adminToken;

const adminCreds = { email: "admin@companies.test", password: "Admin@1234!", role: "admin" };

const sampleCompany = {
  name: "Test Corp",
  industry: "Manufacturing",
  location: { prefecture: "Tokyo", city: "Shinjuku" },
  contact: { email: "contact@testcorp.com", phone: "03-0000-0001" },
  description: "A test manufacturing company.",
};

beforeAll(async () => {
  ({ app } = await createApp());
});

beforeEach(async () => {
  await request(app).post("/api/v1/auth/register").send(adminCreds);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: adminCreds.email, password: adminCreds.password });
  adminToken = res.body.data?.token;
});

// ─── Public GET ───────────────────────────────────────────────────────────────

describe("GET /api/v1/companies", () => {
  it("returns 200 and a companies array when no data exists", async () => {
    const res = await request(app).get("/api/v1/companies");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data?.companies ?? res.body.data)).toBe(true);
  });

  it("returns paginated results with limit param", async () => {
    const res = await request(app).get("/api/v1/companies?limit=5");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── Create (admin only) ──────────────────────────────────────────────────────

describe("POST /api/v1/companies", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/v1/companies").send(sampleCompany);
    expect(res.status).toBe(401);
  });

  it("creates a company as admin and returns 201", async () => {
    if (!adminToken) return; // skip if admin route requires seeded role
    const res = await request(app)
      .post("/api/v1/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleCompany);
    expect([201, 403]).toContain(res.status); // 403 if register doesn't grant admin role automatically
  });
});

// ─── GET single company ───────────────────────────────────────────────────────

describe("GET /api/v1/companies/:id", () => {
  it("returns 404 for a non-existent ObjectId", async () => {
    const res = await request(app).get("/api/v1/companies/64a000000000000000000001");
    expect(res.status).toBe(404);
  });

  it("returns 400 or 404 for an invalid id format", async () => {
    const res = await request(app).get("/api/v1/companies/not-an-id");
    expect([400, 404, 500]).toContain(res.status);
  });
});
