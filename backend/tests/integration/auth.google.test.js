// Integration test for Google auth controller
// Uses mongodb-memory-server and supertest. Mocks google-auth-library.

jest.setTimeout(20000);

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn(),
}));

const request = require("supertest");

// Try to load mongodb-memory-server; if missing, skip this suite so CI or
// environments without the optional dev dependency don't fail.
let MongoMemoryServer;
let haveMemoryServer = true;
try {
  // prefer the modern package entry
  MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
} catch (err) {
  try {
    MongoMemoryServer = require("mongodb-memory-server-core").MongoMemoryServer;
  } catch (err2) {
    // Not available — skip integration tests
    // eslint-disable-next-line no-console
    console.warn(
      "Skipping integration tests: mongodb-memory-server not installed",
    );
    haveMemoryServer = false;
  }
}

const maybeDescribe = haveMemoryServer ? describe : describe.skip;

maybeDescribe("Google auth integration", () => {
  let mongoServer;
  let app;
  let OAuth2Client;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.USE_MONGOOSE = "true";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
    process.env.GOOGLE_CLIENT_ID =
      process.env.GOOGLE_CLIENT_ID || "test-client";

    // Reset modules so that our env and mocks take effect when app is required
    jest.resetModules();

    // Grab mocked constructor so tests can configure it per-case
    OAuth2Client = require("google-auth-library").OAuth2Client;

    // Default implementation: verifyIdToken throws
    OAuth2Client.mockImplementation(() => ({
      verifyIdToken: jest
        .fn()
        .mockRejectedValue(new Error("No mock configured")),
    }));

    // Require app after mocks are in place
    const { createApp } = require("../../src/app");
    const created = await createApp();
    app = created.app;
  });

  afterAll(async () => {
    if (app && app.locals && app.locals.mongoose) {
      await app.locals.mongoose.connection.dropDatabase();
      await app.locals.mongoose.connection.close();
    }
    if (mongoServer) await mongoServer.stop();
  });

  test("POST /api/v1/auth/google - creates a new user and returns JWT", async () => {
    const fakePayload = {
      sub: "google-12345",
      email: "itest@example.com",
      name: "Integration Test",
      given_name: "Integration",
      family_name: "Test",
      picture: "https://example.com/avatar.png",
      locale: "en",
    };

    // Configure mock to return a ticket with getPayload
    const mockVerify = jest
      .fn()
      .mockResolvedValue({ getPayload: () => fakePayload });
    OAuth2Client.mockImplementation(() => ({ verifyIdToken: mockVerify }));

    const res = await request(app)
      .post("/api/v1/auth/google")
      .send({ googleToken: "valid-token" })
      .expect(200);

    expect(res.body).toHaveProperty("data.token");
    expect(res.body.data.user.email).toBe(fakePayload.email);

    // Ensure verify was called with the expected audience
    expect(mockVerify).toHaveBeenCalledWith({
      idToken: "valid-token",
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  });

  test("POST /api/v1/auth/google - invalid token returns 401", async () => {
    // Configure mock to reject
    const mockVerify = jest.fn().mockRejectedValue(new Error("invalid token"));
    OAuth2Client.mockImplementation(() => ({ verifyIdToken: mockVerify }));

    const res = await request(app)
      .post("/api/v1/auth/google")
      .send({ googleToken: "bad-token" })
      .expect(401);

    expect(res.body).toHaveProperty("message");
  });
});
