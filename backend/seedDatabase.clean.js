#!/usr/bin/env node

/**
 * seedDatabase.clean.js
 * Clean, single-purpose seeder that won't conflict with existing seedDatabase.js
 * Usage: node seedDatabase.clean.js [--clear]
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./src/models/User");
const UserProfile = require("./src/models/UserProfile");
const Company = require("./src/models/Company");
const Job = require("./src/models/Job");
const Application = require("./src/models/Application");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mmdc-wst-seed";

async function connect() {
  // Do not pass legacy options to mongoose.connect; the current MongoDB driver
  // rejects 'useNewUrlParser' / 'useUnifiedTopology'. Call with URI only.
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB:", MONGODB_URI);
}

function nowISO(deltaDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

async function clearAll() {
  console.log(
    "Clearing collections: Application, Job, Company, UserProfile, User",
  );
  await Application.deleteMany({}).catch((e) =>
    console.warn("Application clear error", e.message),
  );
  await Job.deleteMany({}).catch((e) =>
    console.warn("Job clear error", e.message),
  );
  await Company.deleteMany({}).catch((e) =>
    console.warn("Company clear error", e.message),
  );
  await UserProfile.deleteMany({}).catch((e) =>
    console.warn("UserProfile clear error", e.message),
  );
  await User.deleteMany({}).catch((e) =>
    console.warn("User clear error", e.message),
  );
}

async function seed() {
  console.log("Seeding database...");

  const employerData = {
    email: "employer+seed@example.com",
    password: "Test123!",
    role: "employer",
  };
  const jobseekerData = {
    email: "jobseeker+seed@example.com",
    password: "Test123!",
    role: "jobseeker",
  };

  const employer =
    (await User.findOne({ email: employerData.email })) ||
    (await User.create(employerData));
  const jobseeker =
    (await User.findOne({ email: jobseekerData.email })) ||
    (await User.create(jobseekerData));

  const company =
    (await Company.findOne({ name: "Seed Company Ltd" })) ||
    (await Company.create({
      name: "Seed Company Ltd",
      // Use a value from the allowed enum in src/models/Company.js
      industry: "Manufacturing",
      size: "51-200",
      founded: 2018,
      website: "https://seed-company.example",
      description: "Seed company for automated tests",
      location: { prefecture: "Tokyo", city: "Shinjuku" },
      contact: { email: "hr@seed-company.example", phone: "+81-3-0000-0000" },
      owner: employer._id,
    }));

  try {
    employer.company = company._id;
    await employer.save();
  } catch (e) {}

  const job = await Job.create({
    company: company._id,
    postedBy: employer._id,
    title: "Seed: Manufacturing Engineer",
    industry: "Manufacturing",
    category: "Engineering",
    summary: "A seeded job for integration tests",
    responsibilities: "Maintain production lines; Ensure quality control",
    requirements: "Bachelor degree; Japanese N3; 2+ years experience",
    requiredEducation: "Bachelor",
    japaneseLevel: "N3",
    requiredExperience: { years: 2, description: "Manufacturing experience" },
    requiredSkills: ["Manufacturing", "Quality Control"],
    compensation: {
      salaryMin: 250000,
      salaryMax: 350000,
      currency: "JPY",
      period: "monthly",
    },
    location: { prefecture: "Tokyo", city: "Shibuya", remote: false },
    applicationInfo: {
      deadline: nowISO(60),
      startDate: nowISO(90),
      applicationMethod: "Platform",
    },
    status: "active",
  });

  const profile =
    (await UserProfile.findOne({ user: jobseeker._id })) ||
    (await UserProfile.create({
      user: jobseeker._id,
      firstName: "Seed",
      lastName: "Jobseeker",
      // required by model
      dateOfBirth: new Date("1995-01-01"),
      nationality: "Japan",
      // language schema expects { language, level }
      languages: [{ language: "Japanese", level: "conversational" }],
      // availability schema uses 'visaStatus' and 'relocate'
      availability: { visaStatus: "not-applicable", relocate: false },
    }));

  const application = await Application.create({
    job: job._id,
    applicant: jobseeker._id,
    coverLetter: "I am interested in this seeded job.",
    status: "submitted",
  });

  const artifacts = {
    employer_email: employer.email,
    jobseeker_email: jobseeker.email,
    employer_id: employer._id.toString(),
    jobseeker_id: jobseeker._id.toString(),
    company_id: company._id.toString(),
    job_id: job._id.toString(),
    application_id: application._id.toString(),
  };
  fs.writeFileSync(
    path.join(__dirname, ".seed_artifacts.json"),
    JSON.stringify(artifacts, null, 2),
  );
  console.log("Seed complete — artifacts written to .seed_artifacts.json");
  return artifacts;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes("--clear");
  await connect();
  try {
    if (clear) await clearAll();
    await seed();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
