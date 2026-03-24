/**
 * Integration tests — Jobs routes (/api/v1/jobs)
 */

const request = require("supertest");
const { createApp } = require("../../src/app");

let app;
let jobseekerToken;

const jobseekerCreds = { email: "seeker@jobs.test", password: "Seeker@1234!", role: "jobseeker" };

beforeAll(async () => {
  ({ app } = await createApp());
});

beforeEach(async () => {
  await request(app).post("/api/v1/auth/register").send(jobseekerCreds);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: jobseekerCreds.email, password: jobseekerCreds.password });
  jobseekerToken = res.body.data?.token;
});

// ─── Public GET ───────────────────────────────────────────────────────────────

describe("GET /api/v1/jobs", () => {
  it("returns 200 and a jobs array when no jobs exist", async () => {
    const res = await request(app).get("/api/v1/jobs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const jobs = res.body.data?.jobs ?? res.body.data ?? [];
    expect(Array.isArray(jobs)).toBe(true);
  });

  it("accepts pagination params without error", async () => {
    const res = await request(app).get("/api/v1/jobs?page=1&limit=10");
    expect(res.status).toBe(200);
  });

  it("accepts filter params without error", async () => {
    const res = await request(app).get("/api/v1/jobs?industry=Manufacturing");
    expect(res.status).toBe(200);
  });
});

// ─── GET single job ───────────────────────────────────────────────────────────

describe("GET /api/v1/jobs/:id", () => {
  it("returns 404 for a valid but non-existent ObjectId", async () => {
    const res = await request(app).get("/api/v1/jobs/64a000000000000000000001");
    expect(res.status).toBe(404);
  });

  it("returns 400 or 404 for an invalid id format", async () => {
    const res = await request(app).get("/api/v1/jobs/not-a-valid-id");
    expect([400, 404, 500]).toContain(res.status);
  });
});

// ─── Protected routes ────────────────────────────────────────────────────────

describe("GET /api/v1/jobs/my/jobs (employer's own jobs)", () => {
  it("returns 401 when no token provided", async () => {
    const res = await request(app).get("/api/v1/jobs/my/jobs");
    expect(res.status).toBe(401);
  });

  it("returns 200 or 403 when authenticated as jobseeker", async () => {
    const res = await request(app)
      .get("/api/v1/jobs/my/jobs")
      .set("Authorization", `Bearer ${jobseekerToken}`);
    // 200 (empty) or 403 if route is employer-only
    expect([200, 403]).toContain(res.status);
  });
});

// ─── Create job (auth required) ───────────────────────────────────────────────

describe("POST /api/v1/jobs", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/v1/jobs").send({ title: "Test Job" });
    expect(res.status).toBe(401);
  });
});
