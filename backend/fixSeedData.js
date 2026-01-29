#!/usr/bin/env node

/**
 * Quick fix script for seed data enum validation issues
 */

const fs = require("fs");
const path = require("path");

console.log("Fixing seed data...\n");

// Fix profiles.json
const profilesPath = path.join(__dirname, "seedData", "profiles.json");
const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf8"));

profiles.forEach((profile) => {
  // Fix language levels
  if (profile.languages) {
    profile.languages.forEach((lang) => {
      if (lang.level === "intermediate") lang.level = "conversational";
      else if (lang.level === "advanced") lang.level = "fluent";
      else if (lang.level === "beginner") lang.level = "basic";
    });
  }

  // Fix visa status
  if (profile.availability && profile.availability.visaStatus) {
    if (profile.availability.visaStatus === "applying") {
      profile.availability.visaStatus = "student";
    } else if (profile.availability.visaStatus === "not_applied") {
      profile.availability.visaStatus = "not-applicable";
    }
  }
});

fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
console.log("✅ Fixed profiles.json");

// Fix jobs.json
const jobsPath = path.join(__dirname, "seedData", "jobs.json");
const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"));

jobs.forEach((job) => {
  if (job.applicationInfo) {
    // Update deadlines to 2026
    job.applicationInfo.deadline = job.applicationInfo.deadline.replace(
      "2025",
      "2026",
    );
    job.applicationInfo.startDate = job.applicationInfo.startDate.replace(
      "2025",
      "2026",
    );
  }
});

fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));
console.log("✅ Fixed jobs.json");

console.log("\nAll seed data fixed! Ready to run npm run seed\n");
