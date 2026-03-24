require("dotenv").config({ path: "/Users/brianjancarlos/codestuff/MMDC/WST/mmdc-wst/backend/.env" });
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("japansswdb");

  const jobs = await db.collection("jobs").find({}).toArray();
  const companies = await db.collection("companies").find({}).toArray();

  const cids = new Set(companies.map(c => c._id.toString()));

  let good = 0, bad = 0, none = 0, noPostedBy = 0;
  const badList = [];

  for (const j of jobs) {
    if (!j.company) { none++; }
    else if (!cids.has(j.company.toString())) { bad++; badList.push({ id: j._id, title: j.title, company: j.company }); }
    else { good++; }
    if (!j.postedBy) noPostedBy++;
  }

  console.log("=== JOB-COMPANY AUDIT ===");
  console.log("Total jobs      :", jobs.length);
  console.log("Good company ref:", good);
  console.log("Bad company ref :", bad);
  console.log("No company field:", none);
  console.log("Missing postedBy:", noPostedBy);

  if (badList.length) {
    console.log("\nBroken refs:");
    badList.forEach(j => console.log(" ", j.id, "|", j.title, "| company:", j.company));
  }

  console.log("\n=== JOBS PER COMPANY ===");
  for (const c of companies) {
    const count = jobs.filter(j => j.company && j.company.toString() === c._id.toString()).length;
    console.log(String(count).padStart(3), "|", c.name);
  }

  await client.close();
}

main().catch(e => { console.error(e.message); process.exit(1); });
