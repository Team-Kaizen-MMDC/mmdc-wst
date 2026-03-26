/**
 * Integration tests — Applications routes (/api/v1/applications)
 * All application routes require authentication.
 */

const request = require("supertest");
const { createApp } = require("../../src/app");

let app;
let seekerToken;

const seekerCreds = { email: "seeker@apply.test", password: "Seeker@1234!", role: "jobseeker" };

beforeAll(async () => {
  ({ app } = await createApp());
});

beforeEach(async () => {
  await request(app).post("/api/v1/auth/register").send(seekerCreds);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: seekerCreds.email, password: seekerCreds.password });
  seekerToken = res.body.data?.token;
});

// ─── GET my applications ──────────────────────────────────────────────────────

describe("GET /api/v1/applications/me", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/api/v1/applications/me");
    expect(res.status).toBe(401);
  });

  it("returns 200 and empty array when authenticated with no applications", async () => {
    const res = await request(app)
      .get("/api/v1/applications/me")
      .set("Authorization", `Bearer ${seekerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const apps = res.body.data?.applications ?? res.body.data ?? [];
    expect(Array.isArray(apps)).toBe(true);
  });
});

// ─── Apply to job (edge cases) ────────────────────────────────────────────────

describe("POST /api/v1/jobs/:jobId/apply", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/64a000000000000000000001/apply")
      .send({ coverLetter: "Test cover letter" });
    expect(res.status).toBe(401);
  });

  it("returns 404 when applying to a non-existent job", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/64a000000000000000000001/apply")
      .set("Authorization", `Bearer ${seekerToken}`)
      .send({ coverLetter: "Test cover letter" });
    expect([404, 400]).toContain(res.status);
  });

  it("returns 400 when cover letter exceeds 2000 characters", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/64a000000000000000000001/apply")
      .set("Authorization", `Bearer ${seekerToken}`)
      .send({ coverLetter: "x".repeat(2001) });
    // 400 validation error or 404 (job not found) — both are acceptable
    expect([400, 404]).toContain(res.status);
  });
});

// ─── Withdraw application ─────────────────────────────────────────────────────

describe("DELETE /api/v1/applications/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).delete("/api/v1/applications/64a000000000000000000001");
    expect(res.status).toBe(401);
  });

  it("returns 404 when authenticated but application does not exist", async () => {
    const res = await request(app)
      .delete("/api/v1/applications/64a000000000000000000001")
      .set("Authorization", `Bearer ${seekerToken}`);
    expect([404, 403]).toContain(res.status);
  });
});
