/**
 * Integration tests — Auth routes (/api/v1/auth)
 * Uses mongodb-memory-server; no real Atlas connection required.
 */

const request = require("supertest");
const { createApp } = require("../../src/app");

let app;

beforeAll(async () => {
  ({ app } = await createApp());
});

// ─── Registration ─────────────────────────────────────────────────────────────

describe("POST /api/v1/auth/register", () => {
  const validUser = {
    email: "jobseeker@test.com",
    password: "Password@123",
    role: "jobseeker",
  };

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ password: "Password@123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "short@test.com", password: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 409 when email is already registered", async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);
    const res = await request(app).post("/api/v1/auth/register").send(validUser);
    expect([400, 409]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe("POST /api/v1/auth/login", () => {
  const creds = { email: "logintest@test.com", password: "Password@123" };

  beforeEach(async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ ...creds, role: "jobseeker" });
  });

  it("logs in with valid credentials and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send(creds);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: creds.email, password: "WrongPass@999" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@test.com", password: "Password@123" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Get Me (protected) ───────────────────────────────────────────────────────

describe("GET /api/v1/auth/me", () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "me@test.com", password: "Password@123", role: "jobseeker" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "me@test.com", password: "Password@123" });
    token = res.body.data.token;
  });

  it("returns current user when authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("me@test.com");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid.token.value");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
