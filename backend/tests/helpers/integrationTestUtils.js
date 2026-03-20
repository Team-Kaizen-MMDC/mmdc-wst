const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

let uniqueCounter = 0;

function nextId(prefix = "test") {
  uniqueCounter += 1;
  return `${prefix}-${Date.now()}-${uniqueCounter}`;
}

function applyTestEnv() {
  process.env.NODE_ENV = "test";
  process.env.USE_MONGOOSE = "true";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.JWT_EXPIRE = "7d";
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.RATE_LIMIT_MAX_REQUESTS = "10000";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RESUME_S3_BUCKET = "test-resume-bucket";
}

async function createIntegrationContext() {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  applyTestEnv();

  jest.resetModules();

  const { createApp } = require("../../src/app");
  const { app } = await createApp();

  return {
    mongoServer,
    app,
    models: {
      User: require("../../src/models/User"),
      UserProfile: require("../../src/models/UserProfile"),
      Company: require("../../src/models/Company"),
      Job: require("../../src/models/Job"),
      Application: require("../../src/models/Application"),
    },
  };
}

async function resetDatabase(context) {
  await context.app.locals.mongoose.connection.dropDatabase();
}

async function destroyIntegrationContext(context) {
  if (context?.app?.locals?.mongoose) {
    await context.app.locals.mongoose.connection.dropDatabase();
    await context.app.locals.mongoose.connection.close();
  }

  if (context?.mongoServer) {
    await context.mongoServer.stop();
  }
}

function createAuthHeader(user) {
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );

  return `Bearer ${token}`;
}

async function createUser(context, overrides = {}) {
  const payload = {
    email: `${nextId("user")}@example.com`,
    password: "Password123!",
    role: "jobseeker",
    ...overrides,
  };

  return context.models.User.create(payload);
}

async function createCompany(context, owner, overrides = {}) {
  const name = overrides.name || `Test Company ${nextId("company")}`;
  const payload = {
    name,
    industry: "Manufacturing",
    size: "11-50",
    description: "A test company used for backend API coverage.",
    website: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example.com`,
    location: {
      prefecture: "Tokyo",
      city: "Chiyoda",
      ...(overrides.location || {}),
    },
    contact: {
      email: `${nextId("company-contact")}@example.com`,
      phone: "+81-3-1234-5678",
      ...(overrides.contact || {}),
    },
    owner: owner._id,
    ...overrides,
  };

  return context.models.Company.create(payload);
}

async function createJob(context, company, postedBy, overrides = {}) {
  const now = Date.now();
  const payload = {
    company: company._id,
    postedBy: postedBy._id,
    title: `Test Job ${nextId("job")}`,
    industry: company.industry || "Manufacturing",
    summary: "A test job summary.",
    responsibilities: "Inspect products and maintain line quality.",
    requirements: "Attention to detail and willingness to learn.",
    compensation: {
      salaryMin: 180000,
      salaryMax: 220000,
      currency: "JPY",
      period: "monthly",
    },
    location: {
      prefecture: "Tokyo",
      city: "Chiyoda",
      remote: false,
    },
    applicationInfo: {
      deadline: new Date(now + 7 * 24 * 60 * 60 * 1000),
      startDate: new Date(now + 21 * 24 * 60 * 60 * 1000),
      contactEmail: "jobs@example.com",
      applicationMethod: "Platform",
    },
    ...overrides,
  };

  return context.models.Job.create(payload);
}

async function createProfile(context, user, overrides = {}) {
  return context.models.UserProfile.create({
    user: user._id,
    firstName: "Test",
    lastName: "User",
    dateOfBirth: new Date("1995-05-15"),
    nationality: "Philippines",
    japaneseLevel: "N4",
    ...overrides,
  });
}

module.exports = {
  applyTestEnv,
  createAuthHeader,
  createCompany,
  createIntegrationContext,
  createJob,
  createProfile,
  createUser,
  destroyIntegrationContext,
  resetDatabase,
};
