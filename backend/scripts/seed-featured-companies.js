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
const LOGO_BASE = "/assets/images/company-logos";
const DRY_RUN = process.argv.includes("--dry-run");
const DROP = process.argv.includes("--drop");

// ─── Company definitions ──────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: "All Nippon Airways (ANA)",
    slug: "all-nippon-airways-ana",
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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

  // ─── 10 additional companies ────────────────────────────────────────────────
  {
    name: "Toyota Motor Corporation",
    slug: "toyota-motor-corporation",
    industry: "Manufacturing",
    size: "5000+",
    founded: 1937,
    website: "https://www.toyota-global.com",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Moving the world forward",
    description:
      "Toyota Motor Corporation is one of the world's largest automobile manufacturers, headquartered in Toyota City, Aichi Prefecture. SSW workers are recruited for vehicle assembly, quality inspection, painting, and production logistics. Toyota provides structured skills training, safety certification, and long-term career pathways in Japan's premier automotive industry.",
    location: { prefecture: "Aichi", city: "Toyota", address: "1 Toyota-cho, Toyota, Aichi" },
    contact: { email: "ssw-recruit@toyota.co.jp", phone: "0565-28-2121" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/toyota-motor-corporation" },
    jobs: [
      { title: "Vehicle Assembly Worker", category: "Assembly", summary: "Work on Toyota's world-class vehicle assembly lines in Aichi, fitting body panels, interior components, and mechanical subassemblies with precision and speed.", responsibilities: ["Install body, chassis, and interior components per assembly instructions", "Use automated assembly tools and torque wrenches correctly", "Conduct in-process quality checks at designated inspection points", "Alert supervisors to any defects or line abnormalities immediately", "Maintain 5S standards at your workstation throughout the shift"] },
      { title: "Paint Shop Technician", category: "Painting", summary: "Operate automated and manual painting equipment in Toyota's vehicle paint shops, ensuring consistent finish quality across all models.", responsibilities: ["Operate automated spray systems and manual touch-up equipment", "Inspect painted surfaces for runs, sags, and colour inconsistencies", "Mix and prepare paint compounds to Toyota specifications", "Maintain and clean paint booths and spray equipment daily", "Follow all chemical handling and ventilation safety procedures"] },
      { title: "Production Logistics Worker", category: "Logistics", summary: "Manage in-plant materials flow — supplying the correct parts to the correct assembly workstation at the correct time using Toyota's lean production system.", responsibilities: ["Operate tugger trains and forklifts to deliver parts kits", "Replenish assembly line supermarkets on schedule", "Scan and track parts inventory using the WMS system", "Flag discrepancies in parts counts immediately", "Support Kaizen improvements in line-feeding operations"] },
      { title: "Quality Inspector", category: "Quality", summary: "Conduct final vehicle quality inspections before dispatch, verifying all systems and appearance meet Toyota's Global Quality Standards.", responsibilities: ["Perform functional checks on braking, lighting, and electronic systems", "Inspect exterior paintwork and trim fit and finish", "Document inspection results on electronic quality forms", "Quarantine non-conforming vehicles and raise corrective action requests", "Participate in quality circle activities to reduce defect rates"] },
      { title: "Press Shop Operator", category: "Manufacturing", summary: "Operate large mechanical and hydraulic presses forming steel body panels for Toyota vehicles in the Aichi stamping plants.", responsibilities: ["Load and operate progressive press dies safely", "Inspect stamped panels against master templates", "Remove flash and trim panels to dimension", "Carry out first-level press maintenance and lubrication", "Follow all noise and vibration safety procedures in the press shop"] },
    ],
  },
  {
    name: "Japan Airlines (JAL)",
    slug: "japan-airlines-jal",
    industry: "Aviation",
    size: "5000+",
    founded: 1951,
    website: "https://www.jal.com",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Your wings across the world",
    description:
      "Japan Airlines (JAL) is Japan's flag carrier and one of Asia's leading international airlines. JAL actively recruits SSW workers for ground handling, aircraft maintenance support, cargo operations, and airport services. The airline offers competitive pay, comprehensive on-the-job training, and a structured career development program for skilled foreign workers.",
    location: { prefecture: "Tokyo", city: "Shinagawa", address: "2-4-11 Higashi-Shinagawa, Shinagawa-ku, Tokyo" },
    contact: { email: "ssw@jal.co.jp", phone: "03-5460-3121" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/japan-airlines" },
    jobs: [
      { title: "Ramp Ground Handler", category: "Ground Operations", summary: "Perform all ramp-side ground handling duties for JAL flights including pushback, marshalling, baggage loading, and fuelling liaison at Tokyo Haneda and Narita.", responsibilities: ["Marshal and guide aircraft on the ramp safely", "Load and unload baggage and cargo according to load plans", "Operate ground support equipment including baggage tractors", "Coordinate fuelling checks with JAL operations", "Maintain all ramp safety standards and FOD prevention procedures"] },
      { title: "Aircraft Cabin Cleaner", category: "Cabin Services", summary: "Perform rapid, thorough cabin cleaning and resetting of JAL aircraft between flights to the airline's premium service standards.", responsibilities: ["Clean seats, seat pockets, and tray tables between turnarounds", "Replenish cabin supplies including blankets and pillows", "Remove all waste and sanitise lavatories", "Check for and report any damage or lost property", "Complete cabin preparation within tight turnaround schedules"] },
      { title: "Air Cargo Handler", category: "Cargo", summary: "Process, sort, and load air cargo shipments for JAL's domestic and international cargo operations at Narita and Haneda cargo facilities.", responsibilities: ["Sort and screen incoming and outgoing cargo shipments", "Build and break down cargo pallets and ULDs to load plans", "Scan shipments and update cargo tracking systems", "Ensure dangerous goods are handled per IATA regulations", "Operate cargo-handling equipment including elevating platforms"] },
      { title: "Baggage Service Agent", category: "Customer Service", summary: "Assist JAL passengers with baggage-related inquiries, including check-in, tracing delayed baggage, and processing claims at major JAL terminals.", responsibilities: ["Tag and process checked baggage at departure counters", "Trace delayed or mishandled baggage and communicate updates to passengers", "Process baggage damage and loss claims accurately", "Coordinate with ramp and airline operations on baggage queries", "Maintain a calm, empathetic approach with frustrated passengers"] },
    ],
  },
  {
    name: "Yamato Transport (Kuroneko)",
    slug: "yamato-transport-kuroneko",
    industry: "Logistics",
    size: "5000+",
    founded: 1919,
    website: "https://www.yamato-hd.co.jp",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Delivering Japan reliably every day",
    description:
      "Yamato Transport, known as Kuroneko Yamato, is Japan's largest parcel delivery company. SSW workers are hired for package sorting, delivery support, and warehouse operations across Yamato's nationwide network. The company offers stable employment, transportation allowances, and skills training in Japan's growing logistics sector.",
    location: { prefecture: "Tokyo", city: "Chuo", address: "2-16-10 Ginza, Chuo-ku, Tokyo" },
    contact: { email: "ssw@yamatogroup.co.jp", phone: "0120-01-9625" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/yamato-holdings" },
    jobs: [
      { title: "Package Sorting Worker", category: "Sorting", summary: "Sort high volumes of parcels at Yamato's regional distribution centres, ensuring accurate routing for same-day and next-day delivery across Japan.", responsibilities: ["Scan and sort parcels by destination zone using conveyor systems", "Stack and unstuck parcels safely on cages and dollies", "Identify and isolate damaged or undeliverable parcels", "Maintain accurate parcel count logs per shift", "Follow all manual handling and ergonomic guidelines"] },
      { title: "Delivery Support Staff", category: "Delivery", summary: "Assist Yamato delivery drivers by loading delivery vehicles, preparing manifests, and managing parcel handover at distribution branches.", responsibilities: ["Load parcels onto delivery vehicles according to route sequence", "Prepare daily delivery manifests and scan paperwork", "Accept incoming re-delivery parcels and process returns", "Manage parcel staging areas at branch depots", "Support driver debriefs and end-of-day parcel reconciliation"] },
      { title: "Warehouse Operative", category: "Warehouse", summary: "Operate Yamato's automated and manual warehousing equipment to receive, store, and dispatch parcels and freight shipments.", responsibilities: ["Receive and book in incoming freight deliveries", "Operate forklifts and pallet jacks safely (after certification)", "Pick and pack items for onward shipment as required", "Maintain organised and clean warehouse locations", "Support inventory cycle counts and stock accuracy checks"] },
      { title: "Parcel Processing Agent", category: "Operations", summary: "Manage parcel data entry, label generation, and system updates for Yamato's shipment processing operations at major depots.", responsibilities: ["Enter shipment data accurately into Yamato's logistics system", "Generate and apply shipping labels and manifests", "Resolve scanning exceptions and address queries", "Liaise with customer service on undeliverable parcel queries", "Support system reconciliation at start and end of shift"] },
    ],
  },
  {
    name: "Komatsu Ltd.",
    slug: "komatsu-ltd",
    industry: "Industrial Machinery",
    size: "5000+",
    founded: 1921,
    website: "https://www.komatsu.com",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Powering construction and mining globally",
    description:
      "Komatsu is a world-leading manufacturer of construction and mining equipment, headquartered in Tokyo. SSW candidates can join Komatsu's manufacturing plants in Ishikawa and Ibaraki for equipment assembly, welding, and quality control roles. Komatsu provides technical training, safety certification, and career growth in Japan's industrial machinery sector.",
    location: { prefecture: "Tokyo", city: "Minato", address: "2-3-6 Akasaka, Minato-ku, Tokyo" },
    contact: { email: "ssw-recruit@komatsu.co.jp", phone: "03-5561-2616" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/komatsu" },
    jobs: [
      { title: "Construction Equipment Assembler", category: "Assembly", summary: "Assemble hydraulic excavators, bulldozers, and other construction machinery at Komatsu's Kanazawa plant in Ishikawa Prefecture.", responsibilities: ["Assemble hydraulic and mechanical sub-components to engineering specifications", "Fit track assemblies, cab structures, and boom attachments", "Use hand tools, power tools, and torque tools accurately", "Perform post-assembly functional checks", "Document assembly completion on electronic work orders"] },
      { title: "Structural Welder", category: "Welding", summary: "Weld heavy steel frames and structural components for Komatsu's range of excavators, dump trucks, and wheel loaders.", responsibilities: ["Perform MIG, TIG, and arc welding on structural steel frames", "Read and interpret weld symbol drawings", "Inspect welds visually and with NDT equipment", "Prepare weld joints including grinding and fit-up", "Follow all PPE and hot-work permit requirements"] },
      { title: "Machining Operator", category: "Machining", summary: "Operate CNC turning, milling, and boring machines producing precision components for Komatsu's drivetrain and hydraulic systems.", responsibilities: ["Set up and operate CNC machine tools per work instructions", "Check machined dimensions against engineering drawings", "Perform in-process quality measurements", "Change cutting tools and adjust offsets as required", "Carry out first-level machine maintenance and lubrication"] },
      { title: "After-sales Parts Warehouse Worker", category: "Warehouse", summary: "Pick, pack, and despatch spare parts orders from Komatsu's regional parts distribution centre serving dealers and customers across Asia-Pacific.", responsibilities: ["Pick parts orders accurately using handheld scanners", "Pack parts for domestic and international shipment", "Receive and put away incoming parts stock", "Conduct cycle count inventory checks", "Operate forklift and reach trucks (after certification)"] },
    ],
  },
  {
    name: "Obayashi Corporation",
    slug: "obayashi-corporation",
    industry: "Construction",
    size: "5000+",
    founded: 1892,
    website: "https://www.obayashi.co.jp",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Building the future of Japan",
    description:
      "Obayashi Corporation is one of Japan's five major general contractors, delivering large-scale infrastructure, commercial, and civil engineering projects. SSW workers are recruited for reinforced concrete work, scaffolding, ironwork, and site support roles. Obayashi offers technical skill training, safety certification, and career development in Japan's construction industry.",
    location: { prefecture: "Tokyo", city: "Shinjuku", address: "2-15-2 Konan, Minato-ku, Tokyo" },
    contact: { email: "ssw@obayashi.co.jp", phone: "03-5769-1111" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/obayashi" },
    jobs: [
      { title: "Reinforced Concrete Worker", category: "Concrete", summary: "Place rebar, set formwork, and pour concrete on Obayashi's large commercial and infrastructure construction sites across Japan.", responsibilities: ["Assemble and tie rebar to structural drawings", "Set, align, and strip concrete formwork", "Support concrete placement and vibration operations", "Carry out post-pour curing and surface finishing", "Maintain a tidy and hazard-free site at all times"] },
      { title: "Scaffolding Erector", category: "Scaffolding", summary: "Erect and dismantle scaffolding systems at Obayashi construction sites, working safely at height to enable other trades to operate efficiently.", responsibilities: ["Erect, alter, and dismantle tubular and system scaffolding", "Inspect scaffold structures for safety compliance daily", "Fit edge protection, toe boards, and guardrails", "Tag-out unsafe scaffold bays and report to supervisor", "Operate material hoists and attend toolbox talks"] },
      { title: "Ironwork / Steel Fixer", category: "Structural Steel", summary: "Fabricate and erect structural steelwork including columns, beams, and connections on major building projects.", responsibilities: ["Connect structural steel members using bolts and site welds", "Read structural drawings and steel connection details", "Operate man-baskets and work at height safely", "Grind and treat steel surfaces for painting", "Assist with crane lifts of steel components"] },
      { title: "Site Support Worker", category: "Site Operations", summary: "Provide general site support including materials handling, concrete mixing, cleaning, and assisting specialist trades on Obayashi project sites.", responsibilities: ["Deliver materials to trade crews on multi-storey sites", "Operate concrete barrows and assist with pours", "Keep site access, stairwells, and common areas clean", "Assist with loading and unloading deliveries", "Attend daily safety briefings and follow site rules"] },
      { title: "Civil Works Labourer", category: "Civil Engineering", summary: "Work on Obayashi's civil engineering projects including roads, bridges, and tunnels, carrying out excavation support, drainage, and compaction tasks.", responsibilities: ["Assist with excavation, trench shoring, and backfill operations", "Lay drainage pipes and service ducts", "Operate compaction equipment for road sub-base layers", "Support survey teams with setting out tasks", "Follow all confined space and ground work safety procedures"] },
    ],
  },
  {
    name: "Maruha Nichiro Corporation",
    slug: "maruha-nichiro-corporation",
    industry: "Food Processing",
    size: "5000+",
    founded: 1880,
    website: "https://www.maruha-nichiro.co.jp",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "From the ocean to your table",
    description:
      "Maruha Nichiro is Japan's largest seafood and food processing company, operating processing plants, aquaculture facilities, and distribution centres nationwide. SSW workers are hired for seafood processing, canning, freezing, and quality inspection roles. Maruha Nichiro offers structured training, social insurance, and career development in Japan's food processing industry.",
    location: { prefecture: "Tokyo", city: "Koto", address: "1-1-2 Toyosu, Koto-ku, Tokyo" },
    contact: { email: "ssw@maruha-nichiro.co.jp", phone: "03-6833-0300" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/maruha-nichiro" },
    jobs: [
      { title: "Seafood Processing Worker", category: "Processing", summary: "Process fresh and frozen seafood products including filleting, de-heading, skinning, and portioning at Maruha Nichiro's Hokkaido and Miyagi processing plants.", responsibilities: ["Fillet, de-head, and skin fish to plant specifications", "Portion fillets to weight and trim to presentation standards", "Operate manual and semi-automatic processing equipment", "Maintain cutting tools and equipment in hygienic condition", "Follow all HACCP and food safety procedures throughout the shift"] },
      { title: "Canning Line Operator", category: "Manufacturing", summary: "Operate Maruha Nichiro's seafood canning lines, managing filling, seaming, retorting, and labelling processes for domestic and export markets.", responsibilities: ["Set up and operate filling and seaming machines", "Monitor fill weights and can seam quality continuously", "Operate retort sterilisation equipment to schedule", "Apply labels and pack finished cans for despatch", "Record all production and quality data accurately"] },
      { title: "Frozen Food Production Worker", category: "Manufacturing", summary: "Produce frozen seafood and ready-meal products on Maruha Nichiro's IQF and blast-freeze lines, maintaining strict cold-chain integrity throughout.", responsibilities: ["Operate IQF and blast-freeze equipment", "Manage frozen product glazing and portion packaging", "Monitor and record product temperatures in the cold store", "Carry out hygienic strip-down and clean-down of equipment", "Follow all cold-chain and allergen management procedures"] },
      { title: "Quality Control Technician", category: "Quality", summary: "Conduct in-process and finished product quality checks at Maruha Nichiro's processing facilities, ensuring all products meet food safety and customer specifications.", responsibilities: ["Perform sensory, visual, and weight checks on product samples", "Test for pathogens and allergens using rapid-test kits", "Record all quality data in HACCP monitoring forms", "Place product on hold if out-of-spec results are found", "Support external audits and third-party certification activities"] },
    ],
  },
  {
    name: "Seven & i Food Systems (Denny's Japan)",
    slug: "seven-i-food-systems",
    industry: "Food Service",
    size: "5000+",
    founded: 1974,
    website: "https://www.7andi.com",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Bringing great dining to neighbourhoods across Japan",
    description:
      "Seven & i Food Systems operates Denny's Japan restaurants and other family dining chains across the country. SSW workers are recruited for kitchen, service, and store operations roles. The company provides paid training, uniform support, Japanese language assistance, and a clear pathway to supervisory roles in Japan's family restaurant sector.",
    location: { prefecture: "Tokyo", city: "Chiyoda", address: "8-8-8 Nibancho, Chiyoda-ku, Tokyo" },
    contact: { email: "ssw@7andi-fs.co.jp", phone: "03-6238-3400" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/seven-i-food-systems" },
    jobs: [
      { title: "Kitchen Line Cook", category: "Kitchen", summary: "Prepare hot and cold dishes from Denny's Japan's menu in a structured brigade kitchen, following standardised recipes and plating guides.", responsibilities: ["Prepare starters, mains, and desserts to recipe specifications", "Manage grill, fryer, and sauté stations during service", "Monitor food quality and temperature at all times", "Keep the kitchen and equipment clean between and after service", "Assist with mise en place preparation before each shift"] },
      { title: "Floor Service Staff", category: "Service", summary: "Provide attentive table service to Denny's Japan guests, taking orders, delivering food, and ensuring a positive dining experience from arrival to departure.", responsibilities: ["Welcome guests and escort them to tables", "Take accurate food and beverage orders", "Deliver dishes promptly and describe specials", "Process payments via POS and handle cash correctly", "Clear and reset tables for subsequent seatings"] },
      { title: "Store Operations Worker", category: "Operations", summary: "Support the daily operations of a Denny's Japan restaurant including opening/closing procedures, stock management, and facility cleanliness.", responsibilities: ["Carry out opening and closing checklists", "Receive and put away food and beverage deliveries", "Maintain restaurant equipment and report faults", "Clean dining room, restrooms, and staff areas", "Assist with stocktakes and waste recording"] },
      { title: "Catering & Events Staff", category: "Catering", summary: "Support Denny's Japan catering operations for corporate and community events, setting up and servicing buffet and set-menu catering packages.", responsibilities: ["Set up catering stations and buffet equipment at event venues", "Prepare and plate catering menu items to presentation standards", "Serve guests during events and manage refill and clearing", "Break down and clean catering equipment post-event", "Liaise with the event coordinator on timing and menu changes"] },
    ],
  },
  {
    name: "Nihon Anzen Seimei Care",
    slug: "nihon-anzen-seimei-care",
    industry: "Nursing Care",
    size: "1001-5000",
    founded: 2005,
    website: "https://www.nihon-care.co.jp",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Safe, compassionate care for every stage of life",
    description:
      "Nihon Anzen Seimei Care operates a network of elderly care facilities and home-care services across Japan's Kansai and Chubu regions. SSW caregivers are welcomed under the Caregiving category with full support including Japanese language training, housing assistance, and a structured career ladder from support worker to care team leader.",
    location: { prefecture: "Osaka", city: "Osaka", address: "2-3-1 Namba, Chuo-ku, Osaka" },
    contact: { email: "ssw@nihon-care.co.jp", phone: "06-6534-8000" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/nihon-anzen-seimei" },
    jobs: [
      { title: "Residential Caregiver (SSW)", category: "Nursing Care", summary: "Provide direct personal care and daily living support to elderly residents in our Osaka and Kyoto care facilities, following individualised care plans.", responsibilities: ["Assist residents with bathing, dressing, and grooming", "Support mealtimes and monitor nutritional intake", "Provide mobility assistance and bed transfers", "Record care observations accurately in electronic care notes", "Participate in multidisciplinary care planning meetings"] },
      { title: "Night Shift Care Worker", category: "Nursing Care", summary: "Provide overnight monitoring, comfort care, and emergency response for residents in our 24-hour residential care facilities.", responsibilities: ["Conduct regular night-time welfare checks on residents", "Assist with nocturnal personal care needs", "Respond calmly to resident call bells and emergencies", "Document overnight incidents and handover to day shift", "Maintain a quiet, safe environment for residents' overnight rest"] },
      { title: "Day Care Centre Staff", category: "Day Care", summary: "Support elderly day-service clients at our Osaka day centre with activities, meals, bathing, and social engagement programmes.", responsibilities: ["Greet and sign in day-service clients on arrival", "Facilitate group activities and cognitive programmes", "Assist with personal care including bathing", "Serve and support clients during meals", "Help clients board transport vehicles at end of the day"] },
      { title: "Home Care Aide (Visiting)", category: "Home Care", summary: "Visit elderly clients at home to provide personal care, domestic support, and companionship as part of Nihon Care's home-visiting programme across Osaka.", responsibilities: ["Provide personal care in clients' homes", "Assist with light housekeeping and grocery management", "Accompany clients on medical appointments and outings", "Monitor and report any health changes to the coordinator", "Complete visit records accurately on the mobile care app"] },
    ],
  },
  {
    name: "ISS Facility Services Japan",
    slug: "iss-facility-services-japan",
    industry: "Building Cleaning",
    size: "5000+",
    founded: 1901,
    website: "https://www.issworld.com/japan",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Creating clean, safe, welcoming workplaces across Japan",
    description:
      "ISS Facility Services Japan provides integrated facility management including building cleaning, maintenance, catering, and security services to major corporations, hospitals, and government facilities across Japan. SSW workers are hired for cleaning, waste management, and building support roles with paid training and stable employment across multiple prefectures.",
    location: { prefecture: "Tokyo", city: "Chuo", address: "3-5-7 Nihonbashi, Chuo-ku, Tokyo" },
    contact: { email: "ssw@jp.issworld.com", phone: "03-5200-8500" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/iss-facility-services" },
    jobs: [
      { title: "Commercial Cleaning Operative", category: "Cleaning", summary: "Clean and maintain offices, lobbies, restrooms, and common areas in ISS-managed commercial buildings across Tokyo, Osaka, and Nagoya to a consistently high standard.", responsibilities: ["Vacuum, mop, and dust all areas to cleaning schedules", "Clean and sanitise restrooms and kitchenettes thoroughly", "Empty bins and sort recyclable waste correctly", "Replenish consumables including soap and paper products", "Report building faults or damage to the site manager"] },
      { title: "Hospital Cleaning Specialist", category: "Healthcare Cleaning", summary: "Carry out specialist cleaning and disinfection of patient wards, theatres, and clinical areas in ISS-managed hospital contracts, following strict infection-control protocols.", responsibilities: ["Clean and disinfect patient rooms using correct dwell times", "Perform terminal cleans of operating theatres post-procedure", "Handle clinical waste according to hospital waste protocols", "Wear correct PPE for clinical areas at all times", "Record cleaning completion on electronic audit systems"] },
      { title: "Floor Care Technician", category: "Floor Care", summary: "Operate professional floor-cleaning machinery including scrubber-dryers, buffing machines, and carpet-extraction equipment in large commercial facilities.", responsibilities: ["Operate ride-on and walk-behind scrubber-dryers safely", "Strip, seal, and buff hard floors to a high finish", "Extract and deep-clean carpets using hot-water extraction", "Inspect floor surfaces and schedule preventive treatments", "Maintain cleaning machinery in serviceable condition"] },
      { title: "Waste Management Operative", category: "Waste Management", summary: "Manage waste streams at ISS client sites including general waste, recyclables, food waste, and hazardous materials in compliance with Japanese waste regulations.", responsibilities: ["Collect and segregate waste by stream across client sites", "Compact and containerise waste for collection", "Maintain accurate waste logs and transfer notes", "Ensure waste storage areas are clean and compliant", "Support client waste-reduction and recycling initiatives"] },
    ],
  },
  {
    name: "JFE Steel Corporation",
    slug: "jfe-steel-corporation",
    industry: "Shipbuilding",
    size: "5000+",
    founded: 2003,
    website: "https://www.jfe-steel.co.jp",
    // logo: null — no asset yet; JS will use ui-avatars.com fallback
    tagline: "Forging Japan's steel foundation",
    description:
      "JFE Steel Corporation is one of Japan's largest integrated steel producers, operating major works in Chiba, Fukuyama, and Kawasaki. SSW workers are recruited for steel production, rolling mill operations, and shipbuilding steel fabrication. JFE Steel offers competitive wages, safety training, and career development in Japan's heavy industry sector.",
    location: { prefecture: "Kanagawa", city: "Kawasaki", address: "1-1 Minamiwatarida-cho, Kawasaki-ku, Kawasaki" },
    contact: { email: "ssw-recruit@jfe-steel.co.jp", phone: "044-577-1111" },
    socialMedia: { linkedin: "https://www.linkedin.com/company/jfe-steel" },
    jobs: [
      { title: "Steel Production Operator", category: "Production", summary: "Operate electric arc furnace and continuous casting equipment at JFE Steel's Kawasaki works, producing high-quality steel billets and slabs for rolling.", responsibilities: ["Monitor and operate EAF and ladle furnace controls", "Manage scrap charging and alloy additions to specification", "Operate continuous casting machines to produce slabs", "Record melt data and adjust parameters to meet quality targets", "Follow all hot metal handling and PPE requirements"] },
      { title: "Hot Rolling Mill Operator", category: "Rolling", summary: "Operate hot strip mill equipment to roll steel slabs into coil and plate products meeting JFE's dimensional and mechanical property specifications.", responsibilities: ["Set up mill roll gaps and tension levels to product schedules", "Monitor strip dimensions and surface quality during rolling", "Respond to cobbles and strip breaks quickly and safely", "Record rolling data in the mill automation system", "Support roll change activities and schedule maintenance windows"] },
      { title: "Steel Fabrication Welder", category: "Fabrication", summary: "Fabricate heavy steel structures and marine components at JFE's shipbuilding steel fabrication division serving Japan's major shipyards.", responsibilities: ["Weld large steel sections using SAW, MIG, and FCAW processes", "Prepare joint fit-up and pre-heat as per WPS", "Conduct self-inspection of welds using visual and gauge checks", "Work safely with overhead cranes and lifting equipment", "Participate in shift-handover and safety pre-work checks"] },
      { title: "Maintenance Fitter", category: "Maintenance", summary: "Perform planned and breakdown maintenance on rolling mill, conveyor, and materials-handling equipment across JFE Steel's Kawasaki works.", responsibilities: ["Diagnose and repair mechanical faults on heavy industrial equipment", "Replace bearings, seals, couplings, and drive components", "Carry out planned preventive maintenance to schedule", "Use SAP PM to log work orders and parts consumption", "Follow all lockout/tag-out procedures before starting work"] },
      { title: "Quality Testing Technician", category: "Quality", summary: "Conduct mechanical and chemical testing of steel samples from production heats to verify they meet JIS and customer specification requirements.", responsibilities: ["Prepare steel test pieces using cutting and milling equipment", "Operate tensile testing, impact testing, and hardness testing machines", "Perform chemical composition analysis using spectrometry equipment", "Record and report test results against product specifications", "Raise non-conformance reports for out-of-spec results"] },
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
      featured: def.featured === true,
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
