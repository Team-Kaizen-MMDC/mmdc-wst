const request = require("supertest");
const {
  createAuthHeader,
  createCompany,
  createIntegrationContext,
  createJob,
  createUser,
  destroyIntegrationContext,
  resetDatabase,
} = require("../helpers/integrationTestUtils");

describe("Job API integration", () => {
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

  test("GET /api/v1/jobs returns only active public jobs", async () => {
    const employer = await createUser(context, { role: "employer" });
    const company = await createCompany(context, employer, { name: "Public Jobs Co" });

    await createJob(context, company, employer, {
      title: "Assembly Technician",
      location: { prefecture: "Aichi", city: "Nagoya", remote: false },
    });
    await createJob(context, company, employer, {
      title: "Archived Role",
      status: "archived",
      visibility: "public",
    });

    const response = await request(context.app)
      .get("/api/v1/jobs?prefecture=Aichi")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.jobs).toHaveLength(1);
    expect(response.body.data.jobs[0].title).toBe("Assembly Technician");
  });

  test("POST /api/v1/jobs lets the company owner create a job", async () => {
    const employer = await createUser(context, { role: "employer" });
    const company = await createCompany(context, employer, { name: "Hiring Co" });

    const response = await request(context.app)
      .post("/api/v1/jobs")
      .set("Authorization", createAuthHeader(employer))
      .send({
        company: company._id.toString(),
        title: "Quality Inspector",
        industry: "Manufacturing",
        summary: "Inspect outgoing products.",
        responsibilities: "Inspect, document, and report quality findings.",
        requirements: "Attention to detail.",
        compensation: {
          salaryMin: 190000,
          salaryMax: 230000,
          currency: "JPY",
          period: "monthly",
        },
        location: { prefecture: "Tokyo", city: "Chiyoda", remote: false },
        applicationInfo: {
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          contactEmail: "jobs@hiring.example.com",
          applicationMethod: "Platform",
        },
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.job.title).toBe("Quality Inspector");
    expect(response.body.data.job.company.name).toBe("Hiring Co");
  });

  test("POST /api/v1/jobs rejects employers that do not own the company", async () => {
    const owner = await createUser(context, { role: "employer" });
    const outsider = await createUser(context, { role: "employer" });
    const company = await createCompany(context, owner, { name: "Private Employer Co" });

    const response = await request(context.app)
      .post("/api/v1/jobs")
      .set("Authorization", createAuthHeader(outsider))
      .send({
        company: company._id.toString(),
        title: "Unauthorized Job",
        industry: "Manufacturing",
        summary: "Should be rejected.",
        responsibilities: "None",
        compensation: {
          salaryMin: 190000,
          salaryMax: 210000,
        },
        location: { prefecture: "Tokyo", city: "Tokyo", remote: false },
        applicationInfo: {
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          contactEmail: "jobs@example.com",
          applicationMethod: "Platform",
        },
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("permission");
  });

  test("DELETE /api/v1/jobs/:id soft deletes the job for its owner", async () => {
    const employer = await createUser(context, { role: "employer" });
    const company = await createCompany(context, employer, { name: "Archive Co" });
    const job = await createJob(context, company, employer, { title: "Delete Me" });

    const response = await request(context.app)
      .delete(`/api/v1/jobs/${job._id}`)
      .set("Authorization", createAuthHeader(employer))
      .expect(200);

    expect(response.body.success).toBe(true);

    const deletedJob = await context.models.Job.findById(job._id);
    expect(deletedJob.isDeleted).toBe(true);
    expect(deletedJob.status).toBe("archived");
  });
});
