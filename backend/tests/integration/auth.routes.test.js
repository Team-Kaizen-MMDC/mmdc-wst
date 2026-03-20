const request = require("supertest");
const {
  createAuthHeader,
  createIntegrationContext,
  createUser,
  destroyIntegrationContext,
  resetDatabase,
} = require("../helpers/integrationTestUtils");

describe("Authentication API integration", () => {
  let context;

  beforeAll(async () => {
    context = await createIntegrationContext();
  });

  afterEach(async () => {
    await resetDatabase(context);
  });

  afterAll(async () => {
    await destroyIntegrationContext(context);
  });

  test("POST /api/v1/auth/register creates a new user and returns a token", async () => {
    const response = await request(context.app)
      .post("/api/v1/auth/register")
      .send({
        email: "register@example.com",
        password: "Password123!",
        role: "jobseeker",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.data.user.email).toBe("register@example.com");
    expect(response.body.data).toHaveProperty("token");

    const createdUser = await context.models.User.findOne({
      email: "register@example.com",
    }).select("+password");

    expect(createdUser).toBeTruthy();
    expect(createdUser.password).not.toBe("Password123!");
  });

  test("POST /api/v1/auth/login returns a JWT for valid credentials", async () => {
    await createUser(context, {
      email: "login@example.com",
      password: "Password123!",
      role: "employer",
    });

    const response = await request(context.app)
      .post("/api/v1/auth/login")
      .send({ email: "login@example.com", password: "Password123!" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.data.user.role).toBe("employer");
    expect(response.body.data).toHaveProperty("token");
  });

  test("POST /api/v1/auth/login rejects invalid credentials", async () => {
    await createUser(context, {
      email: "wrongpass@example.com",
      password: "Password123!",
    });

    const response = await request(context.app)
      .post("/api/v1/auth/login")
      .send({ email: "wrongpass@example.com", password: "WrongPassword!" })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid credentials");
  });

  test("GET /api/v1/auth/me requires authentication", async () => {
    const response = await request(context.app).get("/api/v1/auth/me").expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized to access this route");
  });

  test("GET /api/v1/auth/me returns the current user and redirect target", async () => {
    const user = await createUser(context, {
      email: "me@example.com",
      password: "Password123!",
      role: "jobseeker",
    });

    const response = await request(context.app)
      .get("/api/v1/auth/me")
      .set("Authorization", createAuthHeader(user))
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("me@example.com");
    expect(response.body.redirectTo).toBe("/pages/profileDashboard.html");
  });
});
