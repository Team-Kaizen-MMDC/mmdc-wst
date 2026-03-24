#!/usr/bin/env node
/**
 * seed-featured-companies.js — Seed the 9 featured companies shown on the
 * Japan SSW landing page (from pages/companies/) along with their logos and
 * 4-5 related SSW jobs each.
 *
 * Usage:
 *   cd backend && npm run seed:featured
 *
 * Flags:
 *   --dry-run   Print what would be inserted without writing to DB
 *   --drop      Drop existing featured companies before re-seeding (by slug)
 *
 * Requirements:
 *   - MONGODB_URI set in backend/.env
 *   - Admin user already exists (admin@mmdc.local); run seed:admin first if not.
 */

"use strict";
require("dotenv").config();

const mongoose = require("mongoose");
const path = require("path");

const ADMIN_EMAIL = "admin@mmdc.local";
const LOGO_BASE = "https://mmdc-wst-production.up.railway.app/assets/images/company-logos";
const DRY_RUN = process.argv.includes("--dry-run");
const DROP = process.argv.includes("--drop");

// ─── Company definitions ──────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: "All Nippon Airways (ANA)",
    slug: "all-nippon-airways-ana",
    industry: "Aviation",
    size: "5000+",
    founded: 1952,
    website: "https://www.ana.co.jp",
    logo: `${LOGO_BASE}/ANA.png`,
    tagline: "Japan's largest airline connecting the world",
    description:
      "All Nippon Airways (ANA) is Japan's largest airline and one of the most trusted aviation brands in Asia. They recruit SSW workers for ground handling, customer service, and maintenance support roles. ANA provides comprehensive training, cross-cultural workplace support, and career development opportunities in the aviation industry.",
    location: { prefecture: "Tokyo", city: "Minato", address: "Shiodome City Center, 1-5-2 Higashi-Shimbashi, Minato-ku" },
    contact: { email: "ssw-recruit@ana.co.jp", phone: "03-6735-1000" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/ana-all-nippon-airways" },
    jobs: [
      { title: "Ground Handling Staff", category: "Ground Operations", summary: "Handle aircraft ground operations including baggage loading, towing, and marshalling at major Japanese airports. No prior aviation experience required — full training provided.", responsibilities: ["Load and unload baggage and cargo from aircraft", "Operate ground support equipment safely", "Coordinate with flight crew and gate agents", "Maintain ramp safety standards", "Report irregularities to supervisors"] },
      { title: "Aircraft Maintenance Technician", category: "Maintenance", summary: "Support licensed aircraft engineers with routine maintenance, pre-flight checks, and equipment servicing for ANA's domestic and international fleet.", responsibilities: ["Assist with aircraft pre-flight and post-flight checks", "Perform routine maintenance tasks under supervision", "Document maintenance records accurately", "Keep maintenance bays clean and organised", "Follow all aviation safety regulations"] },
      { title: "Airport Customer Service Agent", category: "Customer Service", summary: "Provide check-in, boarding, and passenger assistance services at ANA counters throughout Japan's major airports.", responsibilities: ["Check in passengers and handle ticketing", "Assist with boarding and gate management", "Handle passenger inquiries and complaints", "Support passengers with special needs", "Maintain ANA service quality standards"] },
      { title: "Cargo Handling Worker", category: "Logistics", summary: "Process and handle air cargo shipments including sorting, weighing, labelling, and loading cargo for domestic and international flights.", responsibilities: ["Sort, weigh, and label cargo shipments", "Operate cargo-handling equipment", "Ensure cargo is secured for flight", "Maintain accurate cargo documentation", "Follow all safety and customs procedures"] },
      { title: "Ramp Operations Specialist", category: "Ground Operations", summary: "Coordinate ramp-side activities to ensure on-time aircraft departures, including fuelling oversight, catering coordination, and equipment management.", responsibilities: ["Coordinate with fuelling and catering teams", "Manage ramp equipment allocation", "Monitor on-time performance metrics", "Communicate with operations control", "Ensure compliance with airport safety rules"] },
    ],
  },
  {
    name: "ANA InterContinental",
    slug: "ana-intercontinental",
    industry: "Accommodation",
    size: "5000+",
    founded: 1973,
    website: "https://www.anaictokyoresort.com",
    logo: `${LOGO_BASE}/ANA_InterContinental.png`,
    tagline: "Luxury hospitality experience across Japan",
    description:
      "ANA InterContinental is a leading hospitality group operating luxury hotels across Japan. They welcome foreign SSW workers in housekeeping, food and beverage service, front desk, and facility support roles. ANA InterContinental provides on-the-job training, language support, and a clear career pathway in Japan's thriving hospitality industry.",
    location: { prefecture: "Tokyo", city: "Minato", address: "1-12-33 Akasaka, Minato-ku, Tokyo" },
    contact: { email: "hr@anaintercontinental.co.jp", phone: "03-3505-1111" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/ana-intercontinental-tokyo" },
    jobs: [
      { title: "Housekeeping Staff", category: "Housekeeping", summary: "Maintain the cleanliness and presentation of guest rooms and public areas to the luxury standards expected at ANA InterContinental hotels.", responsibilities: ["Clean and service guest rooms to hotel standards", "Replenish room amenities and linens", "Report maintenance issues promptly", "Assist guests with in-room requests", "Follow health, safety, and hygiene protocols"] },
      { title: "Front Desk Associate", category: "Guest Services", summary: "Greet arriving guests, manage check-in and check-out procedures, and handle concierge enquiries at our Tokyo flagship property.", responsibilities: ["Manage check-in and check-out efficiently", "Respond to guest enquiries and requests", "Handle reservations and room assignments", "Process payments accurately", "Coordinate with other departments for guest needs"] },
      { title: "Food & Beverage Server", category: "F&B", summary: "Deliver attentive table service in our signature restaurants and banquet spaces, representing ANA InterContinental's commitment to culinary excellence.", responsibilities: ["Take food and beverage orders accurately", "Serve guests in accordance with luxury service standards", "Set up and clear tables before and after service", "Describe menu items and make recommendations", "Maintain a clean and orderly service area"] },
      { title: "Facility Maintenance Worker", category: "Engineering", summary: "Perform preventive maintenance, minor repairs, and equipment checks to keep the hotel's facilities in peak condition for guests.", responsibilities: ["Conduct daily facility inspections and preventive maintenance", "Perform minor plumbing, electrical, and carpentry repairs", "Respond to guest room maintenance requests", "Maintain maintenance logs and reports", "Ensure all work complies with safety standards"] },
      { title: "Banquet Service Staff", category: "Banquet", summary: "Set up and service banquet halls for conferences, weddings, and corporate events hosted at ANA InterContinental venues across Japan.", responsibilities: ["Set up banquet rooms per event specifications", "Serve food and beverages during events", "Assist with audio-visual equipment as needed", "Break down and clean banquet spaces after events", "Coordinate with kitchen and event-planning teams"] },
    ],
  },
  {
    name: "Daikin Industries",
    slug: "daikin-industries",
    industry: "Industrial Machinery",
    size: "5000+",
    founded: 1924,
    website: "https://www.daikin.com",
    logo: `${LOGO_BASE}/Daikin_1.png`,
    tagline: "Global leader in air conditioning and refrigeration",
    description:
      "Daikin Industries is a global leader in air conditioning and refrigeration systems. They hire SSW workers for roles such as equipment installation, maintenance technician, and manufacturing support. Daikin offers skill-based training, safety certification programs, and structured career growth for dedicated workers.",
    location: { prefecture: "Osaka", city: "Osaka", address: "Umeda Center Building, 2-4-12 Nakazaki-Nishi, Kita-ku, Osaka" },
    contact: { email: "ssw@daikin.co.jp", phone: "06-6373-4304" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/daikin-industries" },
    jobs: [
      { title: "HVAC Installation Technician", category: "Installation", summary: "Install residential and commercial air conditioning units at customer sites across Japan, following Daikin's certified installation procedures.", responsibilities: ["Install split-type and multi-split AC systems", "Perform refrigerant piping and electrical connections", "Test and commission newly installed units", "Explain product operation to customers", "Complete service reports for each job"] },
      { title: "Manufacturing Line Worker", category: "Manufacturing", summary: "Operate assembly line equipment in Daikin's Osaka manufacturing plant producing air conditioning units for domestic and international markets.", responsibilities: ["Operate production-line machinery per work instructions", "Perform quality visual inspections on assembled units", "Report defects or abnormalities immediately", "Maintain a clean and organised workstation", "Meet daily production targets safely"] },
      { title: "Equipment Maintenance Specialist", category: "Maintenance", summary: "Conduct scheduled preventive maintenance and breakdown repairs on air conditioning units for commercial clients across the Kansai region.", responsibilities: ["Perform scheduled maintenance inspections", "Diagnose and repair equipment faults", "Replace worn parts and top-up refrigerant", "Maintain accurate service and parts records", "Ensure customer satisfaction after each visit"] },
      { title: "Quality Control Inspector", category: "Quality", summary: "Inspect finished air conditioning products on the production line, verifying they meet Daikin's rigorous quality and safety standards before shipment.", responsibilities: ["Inspect products against quality checklists", "Use measurement tools and test equipment accurately", "Record and report non-conformances", "Collaborate with production to improve quality", "Ensure all products meet ISO and safety standards"] },
    ],
  },
  {
    name: "Kandenko",
    slug: "kandenko",
    industry: "Electric & Electronics",
    size: "5000+",
    founded: 1944,
    website: "https://www.kandenko.co.jp",
    logo: `${LOGO_BASE}/Kandenko.png`,
    tagline: "Engineering Japan's electrical infrastructure",
    description:
      "Kandenko is a major engineering and construction company specialising in electrical, communication, and energy systems. SSW workers can apply for positions as electricians, site technicians, and project assistants. The company values teamwork, safety, and continuous skills development.",
    location: { prefecture: "Tokyo", city: "Chiyoda", address: "2-7-2 Higashi-Kanda, Chiyoda-ku, Tokyo" },
    contact: { email: "hr@kandenko.co.jp", phone: "03-3862-4161" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/kandenko" },
    jobs: [
      { title: "Electrical Construction Worker", category: "Construction", summary: "Work on electrical installation projects for commercial buildings, factories, and infrastructure sites throughout Japan under the supervision of licensed engineers.", responsibilities: ["Install conduit, wiring, and electrical panels", "Connect equipment and perform continuity tests", "Follow all electrical safety regulations", "Assist licensed engineers with complex installations", "Keep the worksite clean and hazard-free"] },
      { title: "Site Technician", category: "Engineering", summary: "Support project engineers on electrical and communication system installation sites, coordinating materials, tools, and sub-contractors.", responsibilities: ["Coordinate daily on-site activities", "Monitor progress against project schedules", "Manage tools, equipment, and materials", "Liaise with subcontractors and suppliers", "Prepare daily site progress reports"] },
      { title: "Building Systems Installer", category: "Installation", summary: "Install electrical, fire-alarm, security, and communication systems in new construction and renovation projects across the Kanto region.", responsibilities: ["Install low-voltage communication and security systems", "Run cables and terminate connections neatly", "Test installed systems after completion", "Coordinate with building contractors", "Maintain installation documentation"] },
      { title: "Project Assistant", category: "Project Management", summary: "Provide administrative and logistical support to Kandenko's project management teams, helping to keep multi-site construction projects on schedule.", responsibilities: ["Prepare project reports and meeting minutes", "Track material deliveries and inventory", "Update project schedules and dashboards", "Assist with permit applications and documentation", "Communicate updates between site teams and head office"] },
    ],
  },
  {
    name: "Mitsubishi Heavy Industries",
    slug: "mitsubishi-heavy-industries",
    industry: "Manufacturing",
    size: "5000+",
    founded: 1884,
    website: "https://www.mhi.com",
    logo: `${LOGO_BASE}/Mitsubishi_Heavy_Industries.png`,
    tagline: "Engineering a better world",
    description:
      "Mitsubishi Heavy Industries is a global engineering and manufacturing leader. They offer opportunities for SSW candidates in factory production, machinery operation, and equipment assembly. MHI supports technical training, workplace safety, and long-term career development for skilled foreign workers.",
    location: { prefecture: "Tokyo", city: "Minato", address: "3-2-3 Marunouchi, Chiyoda-ku, Tokyo" },
    contact: { email: "ssw-recruit@mhi.co.jp", phone: "03-6716-3111" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/mitsubishi-heavy-industries" },
    jobs: [
      { title: "Factory Production Worker", category: "Manufacturing", summary: "Operate production-line equipment at MHI's manufacturing plants, assembling industrial machinery, ship components, and energy system parts.", responsibilities: ["Operate production machinery per operating procedures", "Perform in-process quality checks on components", "Report defects and equipment faults immediately", "Keep workstation organised and clean", "Meet production targets while maintaining safety"] },
      { title: "Machinery Operator", category: "Operations", summary: "Operate CNC machines, presses, and forming equipment in MHI's precision manufacturing facilities producing parts for aerospace, energy, and defence applications.", responsibilities: ["Set up and operate CNC or conventional machine tools", "Check finished parts against technical drawings", "Record production data accurately", "Perform first-level machine maintenance", "Follow all workshop safety procedures"] },
      { title: "Equipment Assembly Technician", category: "Assembly", summary: "Assemble large industrial machinery and equipment components following detailed engineering drawings and assembly instructions at MHI's Nagasaki and Kobe plants.", responsibilities: ["Read and follow assembly drawings and work orders", "Assemble mechanical subassemblies to specification", "Use hand tools, torque wrenches, and gauges correctly", "Perform functional tests post-assembly", "Collaborate with engineering teams on assembly issues"] },
      { title: "Welding Technician", category: "Welding", summary: "Perform certified welding operations on steel structures and pressure vessels for MHI's energy and industrial plant divisions.", responsibilities: ["Perform MIG, TIG, and stick welding to certified standards", "Inspect welds for defects visually and with test equipment", "Grind and dress welds to finish requirements", "Follow all hot-work safety procedures", "Maintain welding equipment and consumables"] },
      { title: "Quality Inspector", category: "Quality", summary: "Inspect manufactured components and assemblies against technical drawings, ensuring they meet MHI's stringent quality and regulatory standards.", responsibilities: ["Inspect parts using gauges, callipers, and CMM equipment", "Compare parts against engineering drawings", "Record inspection data in quality management systems", "Identify and quarantine non-conforming parts", "Support root-cause analysis for quality issues"] },
    ],
  },
  {
    name: "Nissan Motor Company",
    slug: "nissan-motor-company",
    industry: "Auto Repair",
    size: "5000+",
    founded: 1933,
    website: "https://www.nissan-global.com",
    logo: `${LOGO_BASE}/Nissan.png`,
    tagline: "Innovation that excites",
    description:
      "Nissan Motor Company is a world-renowned automobile manufacturer based in Yokohama. For SSW workers, Nissan offers opportunities in factory production, assembly, inspection, and equipment maintenance. The company provides safe working environments, stable contracts, and skills training in Japan's leading automotive industry.",
    location: { prefecture: "Kanagawa", city: "Yokohama", address: "2 Takara-cho, Kanagawa-ku, Yokohama" },
    contact: { email: "ssw@nissan.co.jp", phone: "045-523-5523" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/nissan" },
    jobs: [
      { title: "Assembly Line Worker", category: "Assembly", summary: "Work on Nissan's vehicle assembly line at the Oppama or Tochigi plant, fitting components and sub-assemblies to produce Nissan vehicles.", responsibilities: ["Fit interior and exterior vehicle components", "Operate automated assembly tools and fixtures", "Perform in-line quality checks", "Maintain pace with line speed targets", "Report quality issues or line stoppages immediately"] },
      { title: "Vehicle Inspection Technician", category: "Quality Control", summary: "Conduct final vehicle quality inspections before delivery, checking all systems and appearance to Nissan's global quality standards.", responsibilities: ["Inspect finished vehicles for visual and functional defects", "Test vehicle systems including lighting, brakes, and electronics", "Document findings using inspection checklists", "Tag and report non-conforming vehicles for repair", "Work collaboratively with assembly and repair teams"] },
      { title: "Manufacturing Support Staff", category: "Manufacturing", summary: "Provide materials handling, line-feeding, and logistics support to Nissan's assembly plant operations.", responsibilities: ["Deliver parts kits to assembly line workstations", "Operate tugger trains and forklifts (after certification)", "Manage parts inventory at line-side supermarkets", "Support production with material replenishment", "Maintain safety and 5S standards in materials areas"] },
      { title: "Equipment Maintenance Worker", category: "Maintenance", summary: "Perform preventive and corrective maintenance on manufacturing equipment including robots, conveyors, and body shop tooling at Nissan's plants.", responsibilities: ["Execute scheduled preventive maintenance tasks", "Diagnose and repair mechanical and electrical faults", "Replace worn components and lubricate machinery", "Document maintenance activities in SAP PM", "Support 24/7 production by participating in rotating shifts"] },
    ],
  },
  {
    name: "Prince Hotels & Resorts",
    slug: "prince-hotels-resorts",
    industry: "Accommodation",
    size: "5000+",
    founded: 1956,
    website: "https://www.princehotels.com",
    logo: `${LOGO_BASE}/Prince_Hotels.png`,
    tagline: "Discovering Japan's finest hospitality",
    description:
      "Prince Hotels & Resorts operates hotels, resorts, and leisure facilities throughout Japan. They hire SSW candidates for guest relations, restaurant service, and facility maintenance. The company offers accommodation assistance, uniform support, and Japanese language training, making it an excellent entry point into Japan's luxury hospitality sector.",
    location: { prefecture: "Tokyo", city: "Minato", address: "3-13-1 Takanawa, Minato-ku, Tokyo" },
    contact: { email: "ssw@princehotels.co.jp", phone: "03-3447-1111" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/prince-hotels" },
    jobs: [
      { title: "Guest Relations Staff", category: "Guest Services", summary: "Welcome and assist guests at Prince Hotels properties, handling front desk, concierge, and guest experience responsibilities.", responsibilities: ["Check guests in and out efficiently and warmly", "Handle room reservations and modifications", "Respond to guest queries and arrange services", "Communicate hotel facilities and local attractions", "Resolve guest complaints professionally"] },
      { title: "Restaurant Service Staff", category: "F&B", summary: "Deliver courteous, efficient food and beverage service in Prince Hotels' restaurants, cafés, and banquet facilities.", responsibilities: ["Greet guests and take food and beverage orders", "Serve dishes and drinks promptly and accurately", "Maintain thorough knowledge of menus", "Clear and reset tables for subsequent guests", "Support the smooth running of breakfast and dinner services"] },
      { title: "Facility Maintenance Worker", category: "Engineering", summary: "Maintain Prince Hotels' buildings, guest rooms, and leisure facilities in excellent condition to support guest satisfaction.", responsibilities: ["Respond to maintenance requests from guest rooms and public areas", "Perform routine checks on HVAC, plumbing, and electrical systems", "Carry out minor repairs to fixtures and fittings", "Keep maintenance records up to date", "Escalate complex issues to the engineering manager"] },
      { title: "Kitchen Support Staff", category: "Kitchen", summary: "Assist Prince Hotels' professional kitchen teams with food preparation, plating, and kitchen hygiene across multiple restaurant outlets.", responsibilities: ["Wash, peel, and prep vegetables and ingredients", "Support line cooks during busy service periods", "Plate food items according to chef specifications", "Maintain kitchen cleanliness and organisation", "Follow all food hygiene and safety procedures"] },
      { title: "Housekeeping Associate", category: "Housekeeping", summary: "Clean and prepare guest rooms and public spaces to Prince Hotels' luxury presentation standards.", responsibilities: ["Service guest rooms including bedmaking and bathroom cleaning", "Replenish toiletries, amenities, and mini-bar items", "Report maintenance issues found in rooms", "Clean and maintain public areas and corridors", "Handle lost property in line with hotel policy"] },
    ],
  },
  {
    name: "SOMPO Care",
    slug: "sompo-care",
    industry: "Nursing Care",
    size: "5000+",
    founded: 2017,
    website: "https://www.sompocare.com",
    logo: `${LOGO_BASE}/sompocare.png`,
    tagline: "Caring for Japan's ageing population with compassion",
    description:
      "SOMPO Care is one of Japan's largest care service providers for the elderly. They actively recruit caregivers and nursing support staff under the SSW Caregiving category. SOMPO Care provides structured training programs, Japanese language support, and a supportive work environment to help SSW workers build fulfilling careers in Japan's growing long-term care sector.",
    location: { prefecture: "Tokyo", city: "Shinjuku", address: "2-7-9 Nishi-Shinjuku, Shinjuku-ku, Tokyo" },
    contact: { email: "ssw@sompocare.com", phone: "03-6892-3065" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/sompo-care" },
    jobs: [
      { title: "Certified Caregiver (SSW)", category: "Nursing Care", summary: "Provide direct care and daily living support to elderly residents in SOMPO Care's residential facilities across Japan, following individualised care plans.", responsibilities: ["Assist residents with bathing, dressing, and personal hygiene", "Support mealtimes and monitor nutritional intake", "Assist with mobility and transfer exercises", "Implement individualised care plans", "Document daily care observations in electronic records"] },
      { title: "Home Care Support Staff", category: "Home Care", summary: "Visit elderly clients in their own homes to provide personal care, light domestic support, and social engagement under SOMPO Care's home care division.", responsibilities: ["Provide personal care in clients' own homes", "Assist with light housekeeping and meal preparation", "Accompany clients on outings as required", "Monitor health changes and report to care coordinator", "Build trusting relationships with clients and families"] },
      { title: "Nursing Facility Worker", category: "Nursing Care", summary: "Work as part of the residential care team at a SOMPO Care nursing home, supporting registered nurses with daily care tasks and activities.", responsibilities: ["Support nursing staff with clinical care tasks", "Assist with therapeutic exercises and activities", "Accompany residents to medical appointments", "Help deliver recreational and cognitive activities", "Maintain accurate and timely care documentation"] },
      { title: "Day Service Care Attendant", category: "Day Care", summary: "Support elderly day-service clients at SOMPO Care's day centres, facilitating activities, meals, bathing, and transport assistance.", responsibilities: ["Welcome clients on arrival at the day centre", "Assist with bathing and personal care routines", "Facilitate group activities and cognitive programmes", "Serve and assist with meals", "Help clients board and alight transport vehicles"] },
    ],
  },
  {
    name: "Yoshinoya",
    slug: "yoshinoya",
    industry: "Food Service",
    size: "5000+",
    founded: 1899,
    website: "https://www.yoshinoya.com",
    logo: `${LOGO_BASE}/Yoshinoya.png`,
    tagline: "Japan's iconic gyūdon restaurant chain",
    description:
      "Yoshinoya is one of Japan's most famous restaurant chains, known for its gyūdon (beef bowls). They hire SSW candidates for kitchen, food preparation, and customer service positions. Yoshinoya offers paid training, uniforms, and career growth support, making it a great choice for workers entering Japan's food service industry.",
    location: { prefecture: "Tokyo", city: "Chiyoda", address: "1-15-10 Uchi-Kanda, Chiyoda-ku, Tokyo" },
    contact: { email: "ssw@yoshinoya.com", phone: "03-5298-1800" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/yoshinoya" },
    jobs: [
      { title: "Kitchen Staff", category: "Kitchen", summary: "Prepare Yoshinoya's signature gyūdon and other menu items in a fast-paced, high-volume kitchen environment, following standardised recipes and quality procedures.", responsibilities: ["Cook gyūdon, side dishes, and set meals to Yoshinoya's recipe standards", "Manage cooking timers and equipment settings accurately", "Monitor ingredient stock levels and communicate shortages", "Keep the kitchen clean and organised during and after shifts", "Follow all food hygiene and allergen management procedures"] },
      { title: "Food Preparation Worker", category: "Kitchen", summary: "Prepare raw ingredients including slicing meat, washing vegetables, and portioning components ready for kitchen service at Yoshinoya restaurants.", responsibilities: ["Slice and weigh meat portions to specified yield standards", "Wash, peel, and portion vegetables and garnishes", "Set up mise en place for each service period", "Store all ingredients at correct temperatures", "Maintain preparation area cleanliness throughout the shift"] },
      { title: "Customer Service Associate", category: "Customer Service", summary: "Greet customers, take orders, and deliver fast, friendly counter service that upholds Yoshinoya's reputation for quality and speed.", responsibilities: ["Greet and serve customers promptly and courteously", "Take orders accurately using the POS system", "Deliver food trays and explain menu items", "Process cash and electronic payments", "Handle customer questions and resolve complaints politely"] },
      { title: "Restaurant Crew Member", category: "Operations", summary: "Support overall restaurant operations including service, cleaning, stock replenishment, and food safety compliance during busy lunch and dinner periods.", responsibilities: ["Maintain dining area cleanliness including tables and floors", "Replenish condiments, napkins, and service supplies", "Assist kitchen and front-of-house staff during peak hours", "Follow opening and closing operational checklists", "Adhere to all food safety and hygiene regulations"] },
      { title: "Shift Supervisor", category: "Management", summary: "Lead a team of restaurant crew during assigned shifts, ensuring quality, speed, and customer satisfaction standards are consistently met.", responsibilities: ["Manage crew assignments and shift schedules", "Monitor food quality and service speed throughout the shift", "Handle escalated customer complaints", "Complete end-of-shift cash reconciliation and reports", "Coach and motivate team members to meet performance targets"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function log(msg) { console.log(msg); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI not set. Add it to backend/.env");
    process.exit(1);
  }

  if (DRY_RUN) {
    log("\n🔍  DRY RUN — no changes will be written.\n");
    for (const c of COMPANIES) {
      log(`  📦 ${c.name} (${c.industry}) — ${c.jobs.length} jobs`);
    }
    log(`\n  Total: ${COMPANIES.length} companies, ${COMPANIES.reduce((s, c) => s + c.jobs.length, 0)} jobs\n`);
    return;
  }

  log("🔌  Connecting to MongoDB Atlas…");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  log("✅  Connected\n");

  // Get admin user
  const admin = await db.collection("users").findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    console.error(`❌  Admin user '${ADMIN_EMAIL}' not found. Run: npm run seed:admin`);
    await mongoose.disconnect();
    process.exit(1);
  }
  const adminId = admin._id;
  log(`👤  Using admin: ${admin.email} (${adminId})\n`);

  let companiesCreated = 0;
  let companiesSkipped = 0;
  let jobsCreated = 0;

  for (const def of COMPANIES) {
    // Drop existing by slug if requested
    if (DROP) {
      await db.collection("companies").deleteOne({ slug: def.slug });
      await db.collection("jobs").deleteMany({ "company": { $in: (await db.collection("companies").findOne({ slug: def.slug }))?.jobs || [] } });
    }

    // Check if already exists
    const existing = await db.collection("companies").findOne({ slug: def.slug });
    if (existing && !DROP) {
      log(`  ⏭️  Skipped (already exists): ${def.name}`);
      companiesSkipped++;
      continue;
    }

    // Build company doc
    const now = new Date();
    const companyDoc = {
      name: def.name,
      slug: def.slug,
      logo: def.logo,
      industry: def.industry,
      size: def.size,
      founded: def.founded,
      website: def.website,
      description: def.description,
      tagline: def.tagline,
      location: def.location,
      contact: def.contact,
      socialMedia: def.socialMedia || {},
      owner: adminId,
      admins: [adminId],
      jobs: [],
      isVerified: true,
      verifiedAt: now,
      verifiedBy: adminId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const companyResult = await db.collection("companies").insertOne(companyDoc);
    const companyId = companyResult.insertedId;

    // Insert jobs
    const jobIds = [];
    for (const j of def.jobs) {
      const deadline = futureDate(90);
      const startDate = futureDate(120);

      const jobDoc = {
        company: companyId,
        postedBy: adminId,
        title: j.title,
        industry: def.industry,
        category: j.category,
        summary: j.summary,
        responsibilities: j.responsibilities,
        compensation: {
          salaryMin: 180000,
          salaryMax: 280000,
          currency: "JPY",
          type: "monthly",
          details: "Salary commensurate with experience. Includes transportation allowance.",
        },
        location: {
          prefecture: def.location.prefecture,
          city: def.location.city,
          isRemote: false,
        },
        employmentType: "Full-time",
        experienceLevel: "Entry",
        requirements: [
          "Possession of SSW (Specified Skilled Worker) Visa status or eligibility",
          "N4 Japanese language proficiency or higher preferred",
          "Ability to work as part of a team",
          "Commitment to workplace safety and quality standards",
        ],
        benefits: [
          "Paid training and onboarding program",
          "Japanese language support",
          "Transportation allowance",
          "Social insurance (health, pension, employment)",
          "Annual paid leave",
        ],
        applicationInfo: {
          deadline,
          startDate,
          applicationMethod: "Online",
          contactEmail: def.contact.email,
        },
        isActive: true,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const jobResult = await db.collection("jobs").insertOne(jobDoc);
      jobIds.push(jobResult.insertedId);
      jobsCreated++;
    }

    // Update company.jobs array
    await db.collection("companies").updateOne(
      { _id: companyId },
      { $set: { jobs: jobIds, updatedAt: new Date() } }
    );

    log(`  ✅  ${def.name}: ${jobIds.length} jobs created`);
    companiesCreated++;
  }

  log(`\n🎉  Seeding complete!`);
  log(`   Companies created : ${companiesCreated}`);
  log(`   Companies skipped : ${companiesSkipped}`);
  log(`   Jobs created      : ${jobsCreated}\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
