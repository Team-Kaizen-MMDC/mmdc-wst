#!/usr/bin/env node

/**
 * seedDatabase.js
 * Canonical single-purpose seeder. This file replaces any previously
 * concatenated/corrupted versions and is intentionally small and deterministic.
 * Usage: node seedDatabase.js [--clear]
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

/**
 * seedDatabase.js
 * Canonical single-purpose seeder. This file replaces any previously
 * concatenated/corrupted versions and is intentionally small and deterministic.
 * Usage: node seedDatabase.js [--clear]
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
#!/usr/bin/env node

/**
 * seedDatabase.js
 * Canonical single-purpose seeder. This file replaces any previously
 * concatenated/corrupted versions and is intentionally small and deterministic.
 * Usage: node seedDatabase.js [--clear]
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

        company: company._id,
        postedBy: postedBy._id,
        title: j.title || 'Untitled Job',
        industry: j.industry || company.industry || 'Other',
        category: j.category || 'General',
        summary: j.summary || null,
        responsibilities: j.responsibilities || null,
        requirements: j.requirements || null,
        requiredEducation: j.requiredEducation || null,
        japaneseLevel: j.japaneseLevel || null,
        requiredExperience: j.requiredExperience || null,
        requiredSkills: j.requiredSkills || [],
        compensation: j.compensation || null,
        location: j.location || company.location || null,
        applicationInfo: j.applicationInfo || { deadline: nowISO(60), applicationMethod: 'Platform' },
        status: j.status || 'active',
      };
      const job = await Job.create(jobObj);
      jobsCreated.push(job);
    } catch (e) {
      console.warn('Failed to create job', j.title, e.message);
    }
  }

  for (const p of profilesRaw) {
    const userEmail = p.userEmail || p.user || 'jobseeker+seed@example.com';
    const user = usersMap[userEmail] || usersMap['jobseeker+seed@example.com'];
    if (!user) continue;
    const exists = await UserProfile.findOne({ user: user._id });
    if (exists) continue;
    try {
      const profileObj = {
        user: user._id,
        firstName: p.firstName || 'Seed',
        lastName: p.lastName || 'Jobseeker',
        dateOfBirth: p.dateOfBirth || new Date('1995-01-01'),
        nationality: p.nationality || 'Japan',
        phone: p.phone || null,
        city: p.city || (p.location && p.location.city) || 'Tokyo',
        prefecture: p.prefecture || (p.location && p.location.prefecture) || 'Tokyo',
        languages: p.languages || [{ language: 'Japanese', level: 'conversational' }],
        availability: p.availability || { visaStatus: 'not-applicable', relocate: false },
      };
      await UserProfile.create(profileObj);
    } catch (e) {
      console.warn('Failed to create profile for', userEmail, e.message);
    }
  }

  if (jobsCreated.length) {
    const job = jobsCreated[0];
    const jsEmail = profilesRaw[0] && (profilesRaw[0].userEmail || profilesRaw[0].user) || 'jobseeker+seed@example.com';
    const jsUser = usersMap[jsEmail] || usersMap['jobseeker+seed@example.com'];
    if (jsUser) {
      try {
        await Application.create({ job: job._id, applicant: jsUser._id, coverLetter: 'Auto-applied from seed data', status: 'submitted' });
      } catch (e) {}
    }
  }

  const artifacts = {
    jobs: jobsCreated.length,
    companies: Object.keys(companiesMap).length,
  };
  fs.writeFileSync(path.join(__dirname, '.seed_artifacts.json'), JSON.stringify(artifacts, null, 2));
  console.log('Seed from seedData complete — artifacts written to .seed_artifacts.json');
  return artifacts;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');

  await connect();
  try {
    if (clear) await clearAll();

    const hasSeedData = fs.existsSync(path.join(__dirname, 'seedData', 'jobs.json')) || fs.existsSync(path.join(__dirname, 'seedData', 'companies.json')) || fs.existsSync(path.join(__dirname, 'seedData', 'profiles.json'));
    if (hasSeedData) {
      await seedFromSeedData();
    } else {
      await seedProgrammatic();
    }
    console.log('\nSeeding complete ✅');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
      nationality: 'Japan',
      languages: [{ language: 'Japanese', level: 'conversational' }],
      availability: { visaStatus: 'not-applicable', relocate: false },
    });
  }

  const application = await Application.create({ job: job._id, applicant: jobseeker._id, coverLetter: 'I am interested in this seeded job.', status: 'submitted' });

  const artifacts = {
    employer_email: employer.email,
    jobseeker_email: jobseeker.email,
    employer_id: employer._id.toString(),
    jobseeker_id: jobseeker._id.toString(),
    company_id: company._id.toString(),
    job_id: job._id.toString(),
    application_id: application._id.toString(),
  };
  fs.writeFileSync(path.join(__dirname, '.seed_artifacts.json'), JSON.stringify(artifacts, null, 2));
  console.log('Seed complete — artifacts written to .seed_artifacts.json');
  return artifacts;
}

async function seedFromSeedData() {
  console.log('Seeding from backend/seedData...');
  const companiesRaw = readSeedData('companies.json') || [];
  const jobsRaw = readSeedData('jobs.json') || [];
  const profilesRaw = readSeedData('profiles.json') || [];

  // Create users for any referenced emails: collect employer and jobseeker emails from jobs/profiles
  const userEmails = new Set();
  jobsRaw.forEach(j => { if (j.postedByEmail) userEmails.add(j.postedByEmail); if (j.postedBy) userEmails.add(j.postedBy); });
  profilesRaw.forEach(p => { if (p.userEmail) userEmails.add(p.userEmail); if (p.user) userEmails.add(p.user); });
  // always ensure default seed users exist
  userEmails.add('employer+seed@example.com');
  userEmails.add('jobseeker+seed@example.com');

  const usersMap = {};
  for (const email of userEmails) {
    if (!email) continue;
    const role = email.includes('employer') ? 'employer' : 'jobseeker';
    const u = await createOrFindUserByEmail(email, role);
    usersMap[email] = u;
  }

  // Create companies
  const companiesMap = {};
  for (const c of companiesRaw) {
    const name = c.name || c.title || `Company ${Math.random().toString(36).slice(2,8)}`;
    let company = await Company.findOne({ name });
    if (!company) {
      const ownerEmail = c.ownerEmail || c.owner || 'employer+seed@example.com';
      const owner = usersMap[ownerEmail] || usersMap['employer+seed@example.com'];
      const companyObj = {
        name,
        slug: c.slug || (name && name.toLowerCase().replace(/[^a-z0-9]+/g,'-')),
        industry: c.industry || 'Other',
        size: c.size || '51-200',
        founded: c.founded || 2018,
        website: c.website || null,
        description: c.description || `Profile for ${name}`,
        location: c.location || { prefecture: 'Tokyo', city: 'Shinjuku' },
        contact: c.contact || { email: `hr@${name.replace(/\s+/g,'').toLowerCase()}.example`, phone: '+81-3-0000-0000' },
        owner: owner ? owner._id : undefined,
      };
      company = await Company.create(companyObj);
    }
    companiesMap[name] = company;
  }

  // Create jobs
  const jobsCreated = [];
  for (const j of jobsRaw) {
    const companyName = j.companyName || j.company || (Object.keys(companiesMap)[0]);
    const company = companiesMap[companyName];
    if (!company) {
      console.warn('Skipping job, no company found for', j.title || j);
      continue;
    }
    const postedByEmail = j.postedByEmail || j.postedBy || 'employer+seed@example.com';
    const postedBy = usersMap[postedByEmail] || usersMap['employer+seed@example.com'];
    try {
      const jobObj = {
        company: company._id,
        postedBy: postedBy._id,
        title: j.title || 'Untitled Job',
        industry: j.industry || company.industry || 'Other',
        category: j.category || 'General',
        summary: j.summary || null,
        responsibilities: j.responsibilities || null,
        requirements: j.requirements || null,
        requiredEducation: j.requiredEducation || null,
        japaneseLevel: j.japaneseLevel || null,
        requiredExperience: j.requiredExperience || null,
        requiredSkills: j.requiredSkills || [],
        compensation: j.compensation || null,
        location: j.location || company.location || null,
        applicationInfo: j.applicationInfo || { deadline: nowISO(60), applicationMethod: 'Platform' },
        status: j.status || 'active',
      };
      const job = await Job.create(jobObj);
      jobsCreated.push(job);
    } catch (e) {
      console.warn('Failed to create job', j.title, e.message);
    }
  }

  // Create profiles
  for (const p of profilesRaw) {
    const userEmail = p.userEmail || p.user || 'jobseeker+seed@example.com';
    const user = usersMap[userEmail] || usersMap['jobseeker+seed@example.com'];
    if (!user) continue;
    const exists = await UserProfile.findOne({ user: user._id });
    if (exists) continue;
    try {
      const profileObj = {
        user: user._id,
        firstName: p.firstName || 'Seed',
        lastName: p.lastName || 'Jobseeker',
        dateOfBirth: p.dateOfBirth || new Date('1995-01-01'),
        nationality: p.nationality || 'Japan',
        phone: p.phone || null,
        city: p.city || (p.location && p.location.city) || 'Tokyo',
        prefecture: p.prefecture || (p.location && p.location.prefecture) || 'Tokyo',
        languages: p.languages || [{ language: 'Japanese', level: 'conversational' }],
        availability: p.availability || { visaStatus: 'not-applicable', relocate: false },
      };
      await UserProfile.create(profileObj);
    } catch (e) {
      console.warn('Failed to create profile for', userEmail, e.message);
    }
  }

  // Optionally create a single application connecting first job and first jobseeker
  if (jobsCreated.length) {
    const job = jobsCreated[0];
    const jsEmail = profilesRaw[0] && (profilesRaw[0].userEmail || profilesRaw[0].user) || 'jobseeker+seed@example.com';
    const jsUser = usersMap[jsEmail] || usersMap['jobseeker+seed@example.com'];
    if (jsUser) {
      try {
        await Application.create({ job: job._id, applicant: jsUser._id, coverLetter: 'Auto-applied from seed data', status: 'submitted' });
      } catch (e) {}
    }
  }

  // Write artifacts
  const artifacts = {
    jobs: jobsCreated.length,
    companies: Object.keys(companiesMap).length,
  };
  fs.writeFileSync(path.join(__dirname, '.seed_artifacts.json'), JSON.stringify(artifacts, null, 2));
  console.log('Seed from seedData complete — artifacts written to .seed_artifacts.json');
  return artifacts;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');

  await connect();
  try {
    if (clear) await clearAll();

    const hasSeedData = fs.existsSync(path.join(__dirname, 'seedData', 'jobs.json')) || fs.existsSync(path.join(__dirname, 'seedData', 'companies.json')) || fs.existsSync(path.join(__dirname, 'seedData', 'profiles.json'));
    if (hasSeedData) {
      await seedFromSeedData();
    } else {
      await seedProgrammatic();
    }
    console.log('\nSeeding complete ✅');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
#!/usr/bin/env node

/**
 * seedDatabase.js
 * Programmatic seeding script for Day 5 — simplified, deterministic seeder
 * Usage:
 *   node seedDatabase.js           # run seed
 *   node seedDatabase.js --clear   # clears collections then seeds
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const UserProfile = require('./src/models/UserProfile');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmdc-wst-seed';

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB:', MONGODB_URI);
}

function nowISO(deltaDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

async function clearAll() {
  console.log('Clearing collections: Application, Job, Company, UserProfile, User');
  await Application.deleteMany({}).catch(e => console.warn('Application clear error', e.message));
  await Job.deleteMany({}).catch(e => console.warn('Job clear error', e.message));
  await Company.deleteMany({}).catch(e => console.warn('Company clear error', e.message));
  await UserProfile.deleteMany({}).catch(e => console.warn('UserProfile clear error', e.message));
  await User.deleteMany({}).catch(e => console.warn('User clear error', e.message));
}

async function seed() {
  console.log('Seeding database...');

  // Create employer
  const employerData = {
    email: `employer+seed@example.com`,
    password: 'Test123!',
    role: 'employer'
  };
  const existingEmployer = await User.findOne({ email: employerData.email });
  const employer = existingEmployer || await User.create(employerData);
  console.log('Employer id:', employer._id.toString());

  // Create jobseeker
  const seekerData = {
    email: `jobseeker+seed@example.com`,
    password: 'Test123!',
    role: 'jobseeker'
  };
  const existingSeeker = await User.findOne({ email: seekerData.email });
  const jobseeker = existingSeeker || await User.create(seekerData);
  console.log('Jobseeker id:', jobseeker._id.toString());

  // Create company
  const companyData = {
    name: `Seed Company Ltd`,
    industry: 'Technology',
    size: '51-200',
    founded: 2018,
    website: 'https://seed-company.example',
    description: 'Seed company for automated tests',
    location: { prefecture: 'Tokyo', city: 'Shinjuku' },
    contact: { email: 'hr@seed-company.example', phone: '+81-3-0000-0000' },
    owner: employer._id
  };
  let company = await Company.findOne({ name: companyData.name });
  if (!company) company = await Company.create(companyData);
  console.log('Company id:', company._id.toString());

  // Link employer to company (best-effort)
  try {
    employer.company = company._id;
    await employer.save();
  } catch (err) {
    console.warn('Failed to link employer to company:', err.message);
  }

  // Create a job
  const jobData = {
    company: company._id,
    postedBy: employer._id,
    title: 'Seed: Manufacturing Engineer',
    industry: 'Manufacturing',
    category: 'Engineering',
    summary: 'A seeded job for integration tests',
    responsibilities: 'Maintain production lines; Ensure quality control',
    requirements: 'Bachelor degree; Japanese N3; 2+ years experience',
    requiredEducation: 'Bachelor',
    japaneseLevel: 'N3',
    requiredExperience: { years: 2, description: 'Manufacturing experience' },
    requiredSkills: ['Manufacturing', 'Quality Control'],
    compensation: { salaryMin: 250000, salaryMax: 350000, currency: 'JPY', period: 'monthly' },
    location: { prefecture: 'Tokyo', city: 'Shibuya', remote: false },
    applicationInfo: { deadline: nowISO(60), startDate: nowISO(90), applicationMethod: 'Platform' },
    status: 'active'
  };
  const job = await Job.create(jobData);
  console.log('Job id:', job._id.toString());

  // Create jobseeker profile
  const profileData = {
    user: jobseeker._id,
    fullName: 'Seed Jobseeker',
    displayName: 'seed-js',
    languages: [{ name: 'Japanese', level: 'conversational' }],
    availability: { visaStatus: 'not-applicable', willingToRelocate: false }
  };
  let profile = await UserProfile.findOne({ user: jobseeker._id });
  if (!profile) profile = await UserProfile.create(profileData);
  console.log('Profile id:', profile._id.toString());

  // Create application
  const applicationData = {
    job: job._id,
    applicant: jobseeker._id,
    coverLetter: 'I am interested in this seeded job.',
    status: 'submitted'
  };
  const application = await Application.create(applicationData);
  console.log('Application id:', application._id.toString());

  // Persist artifacts for teardown or debugging
  const artifacts = {
    employer_email: employer.email,
    jobseeker_email: jobseeker.email,
    employer_id: employer._id.toString(),
    jobseeker_id: jobseeker._id.toString(),
    company_id: company._id.toString(),
    job_id: job._id.toString(),
    application_id: application._id.toString()
  };
  const outPath = path.join(__dirname, '.seed_artifacts.json');
  fs.writeFileSync(outPath, JSON.stringify(artifacts, null, 2));
  console.log('Artifacts written to', outPath);

  return artifacts;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');

  await connect();
  try {
    if (clear) await clearAll();
    const artifacts = await seed();
    console.log('\nSeeding complete ✅');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
#!/usr/bin/env node

/**
 * seedDatabase.js
 * Programmatic seeding script for Day 5
 * Usage:
 *   node seedDatabase.js           # run seed
 *   node seedDatabase.js --clear   # clears collections then seeds
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const UserProfile = require('./src/models/UserProfile');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmdc-wst-seed';

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB:', MONGODB_URI);
}

function nowISO(deltaDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

async function clearAll() {
  console.log('Clearing collections: Application, Job, Company, UserProfile, User');
  await Application.deleteMany({}).catch(e => console.warn('Application clear error', e.message));
  await Job.deleteMany({}).catch(e => console.warn('Job clear error', e.message));
  await Company.deleteMany({}).catch(e => console.warn('Company clear error', e.message));
  await UserProfile.deleteMany({}).catch(e => console.warn('UserProfile clear error', e.message));
  await User.deleteMany({}).catch(e => console.warn('User clear error', e.message));
}

async function seed() {
  console.log('Seeding database...');

  // Create employer
  const employerData = {
    email: `employer+seed@example.com`,
    password: 'Test123!',
    role: 'employer'
  };
  const existingEmployer = await User.findOne({ email: employerData.email });
  const employer = existingEmployer || await User.create(employerData);
  console.log('Employer id:', employer._id.toString());

  // Create jobseeker
  const seekerData = {
    email: `jobseeker+seed@example.com`,
    password: 'Test123!',
    role: 'jobseeker'
  };
  const existingSeeker = await User.findOne({ email: seekerData.email });
  const jobseeker = existingSeeker || await User.create(seekerData);
  console.log('Jobseeker id:', jobseeker._id.toString());

  // Create company
  const companyData = {
    name: `Seed Company Ltd`,
    industry: 'Technology',
    size: '51-200',
    founded: 2018,
    website: 'https://seed-company.example',
    description: 'Seed company for automated tests',
    location: { prefecture: 'Tokyo', city: 'Shinjuku' },
    contact: { email: 'hr@seed-company.example', phone: '+81-3-0000-0000' },
    owner: employer._id
  };
  let company = await Company.findOne({ name: companyData.name });
  if (!company) company = await Company.create(companyData);
  console.log('Company id:', company._id.toString());

  // Link employer to company (best-effort)
  try {
    employer.company = company._id;
    await employer.save();
  } catch (err) {
    console.warn('Failed to link employer to company:', err.message);
  }

  // Create a job
  const jobData = {
    company: company._id,
    postedBy: employer._id,
    title: 'Seed: Manufacturing Engineer',
    industry: 'Manufacturing',
    category: 'Engineering',
    summary: 'A seeded job for integration tests',
    responsibilities: 'Maintain production lines; Ensure quality control',
    requirements: 'Bachelor degree; Japanese N3; 2+ years experience',
    requiredEducation: 'Bachelor',
    japaneseLevel: 'N3',
    requiredExperience: { years: 2, description: 'Manufacturing experience' },
    requiredSkills: ['Manufacturing', 'Quality Control'],
    compensation: { salaryMin: 250000, salaryMax: 350000, currency: 'JPY', period: 'monthly' },
    location: { prefecture: 'Tokyo', city: 'Shibuya', remote: false },
    applicationInfo: { deadline: nowISO(60), startDate: nowISO(90), applicationMethod: 'Platform' },
    status: 'active'
  };
  const job = await Job.create(jobData);
  console.log('Job id:', job._id.toString());

  // Create jobseeker profile
  const profileData = {
    user: jobseeker._id,
    fullName: 'Seed Jobseeker',
    displayName: 'seed-js',
    languages: [{ name: 'Japanese', level: 'conversational' }],
    availability: { visaStatus: 'not-applicable', willingToRelocate: false }
  };
  let profile = await UserProfile.findOne({ user: jobseeker._id });
  if (!profile) profile = await UserProfile.create(profileData);
  console.log('Profile id:', profile._id.toString());

  // Create application
  const applicationData = {
    job: job._id,
    applicant: jobseeker._id,
    coverLetter: 'I am interested in this seeded job.',
    status: 'submitted'
  };
  const application = await Application.create(applicationData);
  console.log('Application id:', application._id.toString());

  // Persist artifacts for teardown or debugging
  const artifacts = {
    employer_email: employer.email,
    jobseeker_email: jobseeker.email,
    employer_id: employer._id.toString(),
    jobseeker_id: jobseeker._id.toString(),
    company_id: company._id.toString(),
    job_id: job._id.toString(),
    application_id: application._id.toString()
  };
  const outPath = path.join(__dirname, '.seed_artifacts.json');
  fs.writeFileSync(outPath, JSON.stringify(artifacts, null, 2));
  console.log('Artifacts written to', outPath);

  return artifacts;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');

  await connect();
  try {
    if (clear) await clearAll();
    const artifacts = await seed();
    console.log('\nSeeding complete ✅');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
  log(`Profiles seeded: ${profileCount}/${profilesData.length}`, 'success');
}

/**
 * Seed jobs
 */
async function seedJobs(companies, users) {
  log('Seeding jobs...');
  
  const createdJobs = [];
  
  for (const jobData of jobsData) {
    const company = companies[jobData.companyName];
    const employer = users[jobData.employerEmail];
    
    if (!company) {
      log(`Company not found for job: ${jobData.title}`, 'warning');
      continue;
    }
    
    if (!employer) {
      log(`Employer not found for job: ${jobData.title}`, 'warning');
      continue;
    }
    
    try {
      // Check if job exists
      let job = await Job.findOne({
        title: jobData.title,
        company: company._id
      });
      
      if (job) {
        verboseLog(`Job already exists: ${jobData.title}`);
        createdJobs.push(job);
        continue;
      }
      
      // Create job
      const { companyName, employerEmail, ...jobFields } = jobData;
      job = await Job.create({
        ...jobFields,
        company: company._id,
        postedBy: employer._id
      });
      
      createdJobs.push(job);
      verboseLog(`Created job: ${jobData.title} at ${jobData.companyName}`);
      
    } catch (error) {
      log(`Error creating job ${jobData.title}: ${error.message}`, 'error');
    }
  }
  
  log(`Jobs seeded: ${createdJobs.length}/${jobsData.length}`, 'success');
  return createdJobs;
}

/**
 * Seed applications
 */
async function seedApplications(users, jobs) {
  log('Seeding sample applications...');
  
  const jobseekerEmails = [
    'carlos.rivera@example.com',
    'maria.santos@example.com',
    'nguyen.tran@example.com',
    'le.minh@example.com',
    'budi.santoso@example.com',
    'ana.reyes@example.com',
    'pham.van@example.com',
    'jose.garcia@example.com',
    'dewi.putri@example.com',
    'juan.dela.cruz@example.com'
  ];
  
  // Application scenarios
  const applicationScenarios = [
    // Manufacturing jobs
    { jobseeker: 'carlos.rivera@example.com', jobIndex: 0, status: 'interview', coverLetter: 'I have 7 years of experience in manufacturing and I am very interested in working with your company.' },
    { jobseeker: 'juan.dela.cruz@example.com', jobIndex: 1, status: 'reviewing', coverLetter: 'I am a skilled CNC operator with experience in automotive parts manufacturing.' },
    { jobseeker: 'budi.santoso@example.com', jobIndex: 2, status: 'submitted', coverLetter: 'My quality control experience makes me a great fit for this position.' },
    
    // Nursing care jobs
    { jobseeker: 'maria.santos@example.com', jobIndex: 4, status: 'offer', coverLetter: 'I have 5 years of elderly care experience and JLPT N2 certification.' },
    { jobseeker: 'pham.van@example.com', jobIndex: 5, status: 'accepted', coverLetter: 'I am passionate about providing quality care to elderly patients.' },
    
    // Construction jobs
    { jobseeker: 'nguyen.tran@example.com', jobIndex: 7, status: 'interview', coverLetter: 'I have extensive construction experience and strong safety knowledge.' },
    { jobseeker: 'jose.garcia@example.com', jobIndex: 7, status: 'submitted', coverLetter: 'I am a hardworking construction worker ready to learn and contribute.' },
    
    // Agriculture jobs
    { jobseeker: 'le.minh@example.com', jobIndex: 10, status: 'reviewing', coverLetter: 'I have experience in vegetable farming and am eager to work in Japan.' },
    
    // Food service jobs
    { jobseeker: 'ana.reyes@example.com', jobIndex: 12, status: 'submitted', coverLetter: 'I have food service experience and good customer service skills.' },
    { jobseeker: 'dewi.putri@example.com', jobIndex: 13, status: 'rejected', coverLetter: 'I am interested in learning Japanese cooking and serving customers.' }
  ];
  
  let applicationCount = 0;
  
  for (const scenario of applicationScenarios) {
    const jobseeker = users[scenario.jobseeker];
    const job = jobs[scenario.jobIndex];
    
    if (!jobseeker || !job) {
      verboseLog(`Skipping application - missing jobseeker or job`);
      continue;
    }
    
    try {
      // Check if application exists
      let application = await Application.findOne({
        applicant: jobseeker._id,
        job: job._id
      });
      
      if (application) {
        verboseLog(`Application already exists: ${scenario.jobseeker} -> ${job.title}`);
        applicationCount++;
        continue;
      }
      
      // Create application
      application = await Application.create({
        applicant: jobseeker._id,
        job: job._id,
        status: scenario.status,
        coverLetter: scenario.coverLetter,
        appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      // Add status history
      if (scenario.status === 'interview') {
        application.statusHistory.push({
          status: 'reviewing',
          changedBy: job.postedBy,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          notes: 'Initial review completed'
        });
        application.interview = {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          location: 'Company office',
          notes: 'Please bring your resume and ID'
        };
      } else if (scenario.status === 'offer' || scenario.status === 'accepted') {
        application.statusHistory.push(
          {
            status: 'reviewing',
            changedBy: job.postedBy,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            notes: 'Initial review'
          },
          {
            status: 'interview',
            changedBy: job.postedBy,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            notes: 'Interview scheduled'
          }
        );
      } else if (scenario.status === 'rejected') {
        application.rejectionReason = 'Position filled by another candidate';
      }
      
      await application.save();
      
      applicationCount++;
      verboseLog(`Created application: ${scenario.jobseeker} -> ${job.title} (${scenario.status})`);
      
    } catch (error) {
      log(`Error creating application: ${error.message}`, 'error');
    }
  }
  
  log(`Applications seeded: ${applicationCount}/${applicationScenarios.length}`, 'success');
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('\n========================================');
  console.log('🌱 Database Seeding Script');
  console.log('========================================\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear data if requested
    if (clearData) {
      await clearDatabase();
    }
    
    // Seed in order (respecting references)
    console.log('');
    const users = await seedUsers();
    
    console.log('');
    const companies = await seedCompanies(users);
    
    console.log('');
    await seedProfiles(users);
    
    console.log('');
    const jobs = await seedJobs(companies, users);
    
    console.log('');
    await seedApplications(users, jobs);
    
    // Summary
    console.log('\n========================================');
    log('Database seeded successfully!', 'success');
    console.log('========================================\n');
    
    const stats = {
      users: await User.countDocuments(),
      profiles: await UserProfile.countDocuments(),
      companies: await Company.countDocuments(),
      jobs: await Job.countDocuments(),
      applications: await Application.countDocuments()
    };
    
    console.log('Current database counts:');
    console.log(`  Users:        ${stats.users}`);
    console.log(`  Profiles:     ${stats.profiles}`);
    console.log(`  Companies:    ${stats.companies}`);
    console.log(`  Jobs:         ${stats.jobs}`);
    console.log(`  Applications: ${stats.applications}`);
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    log(`Seeding failed: ${error.message}`, 'error');
    if (verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the script
seedDatabase();
