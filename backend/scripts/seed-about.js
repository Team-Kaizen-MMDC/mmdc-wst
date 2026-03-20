#!/usr/bin/env node
/**
 * seed-about.js
 *
 * Seeds the `about` collection with the About Us page document.
 * Safe to run multiple times — uses upsert (slug is the unique key).
 *
 * Usage:
 *   cd backend && npm run seed:about
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Content = require("../src/models/Content");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is not set in .env");
  process.exit(1);
}

const aboutDocument = {
  slug: "about",
  title: "About Japan SSW",
  paragraphs: [
    {
      text: "MMDC (Manpower Management Development Corporation) is a licensed recruitment agency dedicated to connecting Filipino skilled workers with quality employment opportunities in Japan.",
    },
    {
      text: "We specialize in Japan's Specified Skilled Worker (SSW) program, helping candidates navigate the visa process, skills assessments, and job placement from start to finish.",
    },
    {
      text: "Our team of experienced professionals provides end-to-end support — from pre-departure orientation and language training to on-ground assistance once you arrive in Japan.",
    },
  ],
  mission:
    "To empower Filipino workers by providing transparent, ethical, and world-class recruitment services that open doors to rewarding careers in Japan.",
  vision:
    "To be the most trusted bridge between Filipino talent and Japanese employers, fostering mutual growth and cultural exchange through the SSW program.",
};

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  const result = await Content.findOneAndUpdate(
    { slug: "about" },
    { $set: aboutDocument },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`About document upserted — _id: ${result._id}`);
  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
