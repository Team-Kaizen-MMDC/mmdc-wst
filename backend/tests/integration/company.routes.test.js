const request = require("supertest");
const {
  createAuthHeader,
  createCompany,
  createIntegrationContext,
  createUser,
  destroyIntegrationContext,
  resetDatabase,
} = require("../helpers/integrationTestUtils");

describe("Company API integration", () => {
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

  test("GET /api/v1/companies returns active companies", async () => {
    const owner = await createUser(context, { role: "employer" });
    await createCompany(context, owner, { name: "Atlas Fabrication" });

    const response = await request(context.app)
      .get("/api/v1/companies")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.companies).toHaveLength(1);
    expect(response.body.data.companies[0].name).toBe("Atlas Fabrication");
  });

  test("POST /api/v1/companies lets an employer create a company", async () => {
    const employer = await createUser(context, { role: "employer" });

    const response = await request(context.app)
      .post("/api/v1/companies")
      .set("Authorization", createAuthHeader(employer))
      .send({
        name: "Kaizen Works",
        industry: "Manufacturing",
        description: "Precision manufacturing employer",
        location: { prefecture: "Osaka", city: "Osaka" },
        contact: { email: "hr@kaizen-works.example.com", phone: "+81-6-1111-2222" },
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.company.name).toBe("Kaizen Works");
    expect(String(response.body.data.company.owner._id || response.body.data.company.owner)).toBe(
      employer._id.toString(),
    );
  });

  test("POST /api/v1/companies rejects jobseekers", async () => {
    const jobseeker = await createUser(context, { role: "jobseeker" });

    const response = await request(context.app)
      .post("/api/v1/companies")
      .set("Authorization", createAuthHeader(jobseeker))
      .send({
        name: "Forbidden Co",
        industry: "Manufacturing",
        description: "Should not be created",
        location: { prefecture: "Tokyo", city: "Tokyo" },
        contact: { email: "nope@example.com", phone: "+81-3-1111-2222" },
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("not authorized");
  });

  test("PUT /api/v1/companies/:id lets the owner update the company", async () => {
    const employer = await createUser(context, { role: "employer" });
    const company = await createCompany(context, employer, { name: "Update Me Co" });

    const response = await request(context.app)
      .put(`/api/v1/companies/${company._id}`)
      .set("Authorization", createAuthHeader(employer))
      .send({ description: "Updated company description" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.company.description).toBe("Updated company description");
  });
});
