const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "mmdc-wst";
const COLLECTION = process.env.MONGODB_COLLECTION || "about";

if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI environment variable. Create a .env with MONGODB_URI or set it in env.",
  );
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

async function seed() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    const seedDoc = {
      slug: "about",
      title: "About Us",
      paragraphs: [
        "JapanSSW is a comprehensive platform dedicated to empowering foreign workers seeking skilled trade jobs in Japan under the Specified Skilled Worker (SSW) visa. We bridge the gap between job seekers and opportunities by providing job-matching services, visa assistance, and essential community resources.",
        "Our journey began in 2024 when Juan Angelo, a first-year student at MMDC and an SSW visa holder, founded JapanSSW. Inspired by his own experiences as a working student in Japan, Juan recognized the challenges foreign workers face, from navigating complex immigration policies to finding secure employment. His vision was to create a platform that not only simplifies these processes but also drives meaningful change in Japan’s labor landscape.",
      ],
      mission:
        "Fair careers for workers. Trusted recruitment for employers. Sustainable growth for Japan.",
      vision:
        "To be Japan's leading platform that empowers skilled foreign workers to achieve meaningful careers and brighter futures.",
      updatedAt: new Date(),
    };

    const result = await col.replaceOne({ slug: "about" }, seedDoc, {
      upsert: true,
    });
    console.log("Seed result:", result.result || result);
    console.log(`Seeded document into ${DB_NAME}.${COLLECTION}`);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
