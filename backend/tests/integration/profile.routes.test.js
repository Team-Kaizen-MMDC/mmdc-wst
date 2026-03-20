const request = require("supertest");
const {
  createAuthHeader,
  createIntegrationContext,
  createUser,
  destroyIntegrationContext,
  resetDatabase,
} = require("../helpers/integrationTestUtils");

describe("Profile API integration", () => {
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

  test("POST /api/v1/profile creates a profile for the authenticated user", async () => {
    const user = await createUser(context, { role: "jobseeker" });

    const response = await request(context.app)
      .post("/api/v1/profile")
      .set("Authorization", createAuthHeader(user))
      .send({
        firstName: "Juan",
        lastName: "Dela Cruz",
        dateOfBirth: "1994-02-10",
        nationality: "Philippines",
        japaneseLevel: "N4",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.firstName).toBe("Juan");
  });

  test("GET /api/v1/profile returns the current profile", async () => {
    const user = await createUser(context, { role: "jobseeker" });
    await context.models.UserProfile.create({
      user: user._id,
      firstName: "Ana",
      lastName: "Santos",
      dateOfBirth: new Date("1996-04-20"),
      nationality: "Philippines",
      japaneseLevel: "N3",
    });

    const response = await request(context.app)
      .get("/api/v1/profile")
      .set("Authorization", createAuthHeader(user))
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.lastName).toBe("Santos");
  });

  test("PUT /api/v1/profile updates an existing profile", async () => {
    const user = await createUser(context, { role: "jobseeker" });
    await context.models.UserProfile.create({
      user: user._id,
      firstName: "Ana",
      lastName: "Santos",
      dateOfBirth: new Date("1996-04-20"),
      nationality: "Philippines",
      japaneseLevel: "N3",
    });

    const response = await request(context.app)
      .put("/api/v1/profile")
      .set("Authorization", createAuthHeader(user))
      .send({ city: "Yokohama", bio: "Updated profile summary" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.city).toBe("Yokohama");
    expect(response.body.data.profile.bio).toBe("Updated profile summary");
  });

  test("DELETE /api/v1/profile removes the user profile", async () => {
    const user = await createUser(context, { role: "jobseeker" });
    await context.models.UserProfile.create({
      user: user._id,
      firstName: "Delete",
      lastName: "Me",
      dateOfBirth: new Date("1996-04-20"),
      nationality: "Philippines",
      japaneseLevel: "N3",
    });

    const response = await request(context.app)
      .delete("/api/v1/profile")
      .set("Authorization", createAuthHeader(user))
      .expect(200);

    expect(response.body.success).toBe(true);

    const remainingProfile = await context.models.UserProfile.findOne({ user: user._id });
    expect(remainingProfile).toBeNull();
  });
});
