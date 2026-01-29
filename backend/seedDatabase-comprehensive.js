#!/usr/bin/env node

/**
 * seedDatabase-comprehensive.js
 * Comprehensive seeder with realistic test data from JSON files
 * Usage: node seedDatabase-comprehensive.js [--clear]
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

const CLEAR_DATA = process.argv.includes("--clear");
const VERBOSE = process.argv.includes("--verbose");

function log(message, ...args) {
  if (VERBOSE) {
    console.log(message, ...args);
  }
}

function nowISO(deltaDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

async function connect() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB:", MONGODB_URI);
}

async function clearAll() {
  console.log("🗑️  Clearing existing collections...");
  await Application.deleteMany({});
  await Job.deleteMany({});
  await Company.deleteMany({});
  await UserProfile.deleteMany({});
  await User.deleteMany({});
  console.log("✅ Collections cleared");
}

async function seedUsers(usersData) {
  console.log("📝 Seeding users...");
  const createdUsers = [];

  for (const userData of usersData) {
    try {
      const user = await User.create({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: userData.isActive !== false,
        isEmailVerified: userData.isEmailVerified !== false,
      });

      createdUsers.push({
        user,
        profileData: userData.profile,
        companyIndex: userData.companyIndex,
      });
      log(`  ✓ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(
        `  ✗ Failed to create user ${userData.email}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedCompanies(companiesData, userList) {
  console.log("📝 Seeding companies...");
  const createdCompanies = [];

  for (const companyData of companiesData) {
    try {
      // Find the employer for this company
      const employer = userList.find(
        (u) =>
          u.user.email === companyData.employerEmail &&
          u.user.role === "employer",
      );

      if (!employer) {
        console.warn(`  ⚠️  No employer found for company ${companyData.name}`);
        continue;
      }

      const company = await Company.create({
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size,
        founded: companyData.founded,
        website: companyData.website,
        description: companyData.description,
        location: companyData.location,
        contact: companyData.contact,
        owner: employer.user._id,
        isVerified: true,
      });

      // Link company to employer user
      employer.user.company = company._id;
      await employer.user.save();

      createdCompanies.push({
        company,
        employerEmail: companyData.employerEmail,
      });
      log(
        `  ✓ Created company: ${company.name} (owner: ${employer.user.email})`,
      );
    } catch (error) {
      console.error(
        `  ✗ Failed to create company ${companyData.name}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Created ${createdCompanies.length} companies`);
  return createdCompanies;
}

async function seedProfiles(userList) {
  console.log("📝 Seeding profiles...");
  let profileCount = 0;

  for (const { user, profileData } of userList) {
    if (!profileData || user.role !== "jobseeker") continue;

    try {
      const profile = await UserProfile.create({
        user: user._id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dateOfBirth: new Date(profileData.dateOfBirth),
        gender: profileData.gender,
        nationality: profileData.nationality,
        phone: profileData.phone,
        address: { prefecture: profileData.prefecture, city: profileData.city },
        japaneseLevel: profileData.japaneseLevel,
        languages: profileData.languages || [],
        education: profileData.education || [],
        experience: profileData.experience || [],
        skills: profileData.skills || [],
        certifications: profileData.certifications || [],
        availability: profileData.availability || {},
      });

      profileCount++;
      log(`  ✓ Created profile for: ${user.email}`);
    } catch (error) {
      console.error(
        `  ✗ Failed to create profile for ${user.email}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Created ${profileCount} profiles`);
}

async function seedJobs(companyList) {
  console.log("📝 Seeding jobs...");
  const createdJobs = [];

  // Job templates for each industry
  const jobTemplates = {
    Manufacturing: [
      {
        title: "Manufacturing Engineer",
        category: "Engineering",
        summary:
          "Design and optimize manufacturing processes for electronic components",
        responsibilities:
          "Design manufacturing processes; Optimize production efficiency; Maintain quality standards; Train production staff",
        requirements:
          "Bachelor's degree in Engineering; 2+ years manufacturing experience; Japanese N3 or higher",
        requiredEducation: "Bachelor",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 2,
          description: "Manufacturing or production experience",
        },
        requiredSkills: [
          "Manufacturing",
          "Quality Control",
          "Process Optimization",
        ],
        salaryMin: 250000,
        salaryMax: 350000,
      },
      {
        title: "Production Line Supervisor",
        category: "Management",
        summary: "Supervise production line operations and team management",
        responsibilities:
          "Manage production team; Monitor quality standards; Ensure safety compliance; Coordinate with other departments",
        requirements:
          "Associate degree or higher; 3+ years production experience; Japanese N3 or higher; Leadership skills",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 3,
          description: "Production line or supervisory experience",
        },
        requiredSkills: [
          "Team Leadership",
          "Production Management",
          "Quality Assurance",
        ],
        salaryMin: 280000,
        salaryMax: 380000,
      },
      {
        title: "Quality Control Inspector",
        category: "Quality Assurance",
        summary: "Inspect products and ensure quality standards compliance",
        responsibilities:
          "Conduct product inspections; Document quality issues; Implement corrective actions; Maintain inspection equipment",
        requirements:
          "High school diploma or higher; 1+ years QC experience; Japanese N4 or higher; Attention to detail",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Quality control or inspection experience",
        },
        requiredSkills: [
          "Quality Control",
          "Attention to Detail",
          "Documentation",
        ],
        salaryMin: 220000,
        salaryMax: 300000,
      },
      {
        title: "Machine Operator (CNC)",
        category: "Operations",
        summary:
          "Operate and maintain CNC machinery for precision manufacturing",
        responsibilities:
          "Operate CNC machines; Perform routine maintenance; Monitor product quality; Follow safety procedures",
        requirements:
          "Vocational training or equivalent; 1+ years CNC experience; Japanese N4 or higher",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: { years: 1, description: "CNC machine operation" },
        requiredSkills: [
          "CNC Operation",
          "Machine Maintenance",
          "Blueprint Reading",
        ],
        salaryMin: 240000,
        salaryMax: 320000,
      },
      {
        title: "Assembly Technician",
        category: "Operations",
        summary: "Assemble electronic components and sub-assemblies",
        responsibilities:
          "Assemble products according to specifications; Inspect completed assemblies; Maintain clean workspace; Report defects",
        requirements:
          "High school diploma; Basic Japanese N5; Manual dexterity; Attention to detail",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided for motivated candidates",
        },
        requiredSkills: ["Manual Assembly", "Quality Inspection", "Teamwork"],
        salaryMin: 200000,
        salaryMax: 260000,
      },
      {
        title: "Maintenance Technician",
        category: "Maintenance",
        summary: "Maintain and repair production equipment and facilities",
        responsibilities:
          "Perform preventive maintenance; Troubleshoot equipment issues; Repair mechanical/electrical systems; Document maintenance activities",
        requirements:
          "Technical degree or certification; 2+ years maintenance experience; Japanese N4 or higher; Mechanical/electrical skills",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Equipment maintenance or repair",
        },
        requiredSkills: [
          "Equipment Maintenance",
          "Troubleshooting",
          "Electrical Systems",
        ],
        salaryMin: 260000,
        salaryMax: 340000,
      },
    ],
    Healthcare: [
      {
        title: "Certified Nursing Assistant",
        category: "Nursing",
        summary:
          "Provide direct patient care and assistance in healthcare facility",
        responsibilities:
          "Assist with daily living activities; Monitor patient vital signs; Document patient conditions; Communicate with nursing staff",
        requirements:
          "Nursing assistant certification; 1+ years care experience; Japanese N4 or higher; Compassionate and patient",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Patient care or nursing assistant experience",
        },
        requiredSkills: [
          "Patient Care",
          "Vital Signs Monitoring",
          "Communication",
        ],
        salaryMin: 230000,
        salaryMax: 300000,
      },
      {
        title: "Elderly Caregiver",
        category: "Care Support",
        summary: "Provide daily care and support for elderly residents",
        responsibilities:
          "Assist with meals and medication; Support mobility and hygiene; Provide companionship; Monitor health conditions",
        requirements:
          "Caregiver certification preferred; Japanese N5 minimum; Patient and caring personality; Physical stamina",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; caregiving experience preferred",
        },
        requiredSkills: ["Elderly Care", "Patient Assistance", "Communication"],
        salaryMin: 210000,
        salaryMax: 280000,
      },
      {
        title: "Rehabilitation Assistant",
        category: "Therapy Support",
        summary:
          "Assist physical therapists with patient rehabilitation programs",
        responsibilities:
          "Support therapy sessions; Prepare equipment; Monitor patient progress; Maintain therapy area",
        requirements:
          "Associate degree in healthcare field; 1+ years experience; Japanese N4 or higher; Physical stamina",
        requiredEducation: "Associate",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Healthcare or rehabilitation support",
        },
        requiredSkills: [
          "Rehabilitation Support",
          "Patient Assistance",
          "Physical Therapy",
        ],
        salaryMin: 240000,
        salaryMax: 310000,
      },
      {
        title: "Medical Records Clerk",
        category: "Administration",
        summary: "Manage patient records and healthcare documentation",
        responsibilities:
          "Maintain patient files; Input data into systems; Ensure privacy compliance; Coordinate with medical staff",
        requirements:
          "High school diploma; Basic computer skills; Japanese N4 or higher; Attention to detail; Organizational skills",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 0,
          description:
            "Office or healthcare administration experience preferred",
        },
        requiredSkills: ["Medical Records", "Data Entry", "Organization"],
        salaryMin: 220000,
        salaryMax: 280000,
      },
      {
        title: "Nursing Care Supervisor",
        category: "Management",
        summary: "Supervise nursing care team and coordinate patient services",
        responsibilities:
          "Manage care team; Develop care plans; Ensure quality standards; Coordinate with families and doctors",
        requirements:
          "Nursing degree or equivalent; 3+ years care experience; Japanese N3 or higher; Leadership skills",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 3,
          description: "Nursing care or supervisory experience",
        },
        requiredSkills: ["Team Management", "Care Planning", "Communication"],
        salaryMin: 290000,
        salaryMax: 380000,
      },
    ],
    Construction: [
      {
        title: "Construction Worker",
        category: "General Labor",
        summary:
          "Perform general construction tasks on residential and commercial projects",
        responsibilities:
          "Assist with site preparation; Operate basic tools and equipment; Follow safety protocols; Work as part of team",
        requirements:
          "Physical fitness; Japanese N5 minimum; Willingness to learn; Safety conscious",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; construction experience preferred",
        },
        requiredSkills: ["Construction", "Physical Labor", "Safety Compliance"],
        salaryMin: 220000,
        salaryMax: 290000,
      },
      {
        title: "Carpenter",
        category: "Skilled Trade",
        summary:
          "Perform carpentry work including framing, finishing, and installation",
        responsibilities:
          "Read blueprints; Cut and shape wood materials; Install structures and fixtures; Ensure quality workmanship",
        requirements:
          "Carpentry experience or certification; 2+ years experience; Japanese N4 or higher; Tool proficiency",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Carpentry or woodworking experience",
        },
        requiredSkills: ["Carpentry", "Blueprint Reading", "Tool Operation"],
        salaryMin: 260000,
        salaryMax: 340000,
      },
      {
        title: "Heavy Equipment Operator",
        category: "Operations",
        summary: "Operate heavy construction machinery and equipment",
        responsibilities:
          "Operate excavators, bulldozers, cranes; Perform pre-operation inspections; Follow site safety protocols; Maintain equipment",
        requirements:
          "Equipment operator license; 2+ years experience; Japanese N4 or higher; Safety certification",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Heavy equipment operation",
        },
        requiredSkills: [
          "Heavy Equipment",
          "Safety Compliance",
          "Equipment Maintenance",
        ],
        salaryMin: 280000,
        salaryMax: 360000,
      },
      {
        title: "Site Supervisor",
        category: "Management",
        summary:
          "Supervise construction site operations and coordinate workers",
        responsibilities:
          "Manage construction crew; Coordinate schedules; Ensure safety compliance; Monitor project progress; Communicate with project managers",
        requirements:
          "Construction management degree or extensive experience; 4+ years experience; Japanese N3 or higher; Leadership skills",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 4,
          description: "Construction site supervision or management",
        },
        requiredSkills: [
          "Site Management",
          "Team Leadership",
          "Project Coordination",
        ],
        salaryMin: 320000,
        salaryMax: 420000,
      },
      {
        title: "Concrete Worker",
        category: "Skilled Trade",
        summary:
          "Prepare, pour, and finish concrete for various construction projects",
        responsibilities:
          "Prepare concrete mixes; Set forms and reinforcements; Pour and finish concrete; Ensure proper curing",
        requirements:
          "1+ years concrete experience; Japanese N5 or higher; Physical stamina; Attention to quality",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 1,
          description: "Concrete work or construction",
        },
        requiredSkills: ["Concrete Work", "Form Setting", "Quality Control"],
        salaryMin: 240000,
        salaryMax: 310000,
      },
    ],
    Agriculture: [
      {
        title: "Farm Worker",
        category: "General Labor",
        summary:
          "Perform general farm tasks including planting, harvesting, and maintenance",
        responsibilities:
          "Plant and harvest crops; Operate farm equipment; Maintain farm facilities; Follow safety procedures",
        requirements:
          "Physical fitness; Japanese N5 minimum; Outdoor work tolerance; Reliable",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; farm experience helpful",
        },
        requiredSkills: [
          "Agriculture",
          "Physical Labor",
          "Equipment Operation",
        ],
        salaryMin: 200000,
        salaryMax: 260000,
      },
      {
        title: "Agricultural Technician",
        category: "Technical",
        summary:
          "Apply technical knowledge to crop cultivation and farm management",
        responsibilities:
          "Monitor crop health; Apply fertilizers and pesticides; Operate irrigation systems; Collect data and samples",
        requirements:
          "Agricultural degree or certification; 1+ years experience; Japanese N4 or higher; Technical knowledge",
        requiredEducation: "Associate",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Agricultural or horticultural work",
        },
        requiredSkills: [
          "Agriculture",
          "Crop Management",
          "Irrigation Systems",
        ],
        salaryMin: 240000,
        salaryMax: 310000,
      },
      {
        title: "Greenhouse Manager",
        category: "Management",
        summary: "Manage greenhouse operations and plant cultivation",
        responsibilities:
          "Oversee greenhouse production; Manage climate control systems; Supervise workers; Maintain quality standards",
        requirements:
          "Agricultural degree; 3+ years greenhouse experience; Japanese N3 or higher; Management skills",
        requiredEducation: "Bachelor",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 3,
          description: "Greenhouse or agricultural management",
        },
        requiredSkills: [
          "Greenhouse Management",
          "Team Leadership",
          "Climate Control",
        ],
        salaryMin: 290000,
        salaryMax: 370000,
      },
      {
        title: "Livestock Caretaker",
        category: "Animal Care",
        summary:
          "Care for farm animals including feeding, health monitoring, and facility maintenance",
        responsibilities:
          "Feed and water animals; Monitor animal health; Clean facilities; Assist with breeding and veterinary care",
        requirements:
          "Animal care experience; Japanese N5 or higher; Physical stamina; Patient with animals",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Animal care or farm experience preferred",
        },
        requiredSkills: [
          "Animal Care",
          "Facility Maintenance",
          "Health Monitoring",
        ],
        salaryMin: 210000,
        salaryMax: 270000,
      },
      {
        title: "Organic Farm Specialist",
        category: "Technical",
        summary:
          "Specialize in organic farming methods and sustainable agriculture",
        responsibilities:
          "Implement organic farming practices; Manage pest control naturally; Maintain organic certification; Train farm workers",
        requirements:
          "Agricultural degree with organic focus; 2+ years organic farming; Japanese N4 or higher; Sustainability knowledge",
        requiredEducation: "Associate",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Organic farming or sustainable agriculture",
        },
        requiredSkills: [
          "Organic Farming",
          "Sustainable Agriculture",
          "Pest Management",
        ],
        salaryMin: 260000,
        salaryMax: 330000,
      },
    ],
    "Food Service": [
      {
        title: "Restaurant Server",
        category: "Service",
        summary: "Provide excellent customer service in restaurant environment",
        responsibilities:
          "Take customer orders; Serve food and beverages; Handle payments; Maintain clean dining area",
        requirements:
          "Customer service skills; Japanese N5 minimum; Friendly personality; Physical stamina",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; restaurant experience preferred",
        },
        requiredSkills: ["Customer Service", "Food Service", "Communication"],
        salaryMin: 190000,
        salaryMax: 250000,
      },
      {
        title: "Kitchen Assistant",
        category: "Food Preparation",
        summary: "Assist chefs with food preparation and kitchen operations",
        responsibilities:
          "Prepare ingredients; Assist with cooking; Maintain kitchen cleanliness; Follow food safety standards",
        requirements:
          "Basic cooking knowledge; Japanese N5 or higher; Food handling certificate; Team player",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; kitchen experience helpful",
        },
        requiredSkills: ["Food Preparation", "Kitchen Sanitation", "Teamwork"],
        salaryMin: 200000,
        salaryMax: 260000,
      },
      {
        title: "Line Cook",
        category: "Culinary",
        summary:
          "Prepare menu items efficiently in fast-paced kitchen environment",
        responsibilities:
          "Cook menu items to specifications; Manage cooking times; Maintain food quality; Ensure kitchen safety",
        requirements:
          "Culinary training or 2+ years experience; Japanese N4 or higher; Speed and accuracy; Stress management",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Professional cooking experience",
        },
        requiredSkills: ["Cooking", "Kitchen Operations", "Time Management"],
        salaryMin: 240000,
        salaryMax: 310000,
      },
      {
        title: "Restaurant Manager",
        category: "Management",
        summary:
          "Manage restaurant operations including staff, inventory, and customer service",
        responsibilities:
          "Supervise restaurant staff; Manage inventory and ordering; Handle customer issues; Ensure quality standards; Coordinate with kitchen",
        requirements:
          "Restaurant management degree or 4+ years experience; Japanese N3 or higher; Leadership skills; Customer service excellence",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 4,
          description: "Restaurant management or supervisory role",
        },
        requiredSkills: [
          "Restaurant Management",
          "Team Leadership",
          "Customer Service",
        ],
        salaryMin: 300000,
        salaryMax: 400000,
      },
      {
        title: "Pastry Chef",
        category: "Culinary",
        summary: "Create desserts, pastries, and baked goods for restaurant",
        responsibilities:
          "Prepare desserts and baked goods; Develop new recipes; Manage pastry inventory; Ensure quality and presentation",
        requirements:
          "Culinary degree with pastry focus; 2+ years pastry experience; Japanese N4 or higher; Creativity and precision",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Professional pastry or baking experience",
        },
        requiredSkills: ["Pastry Making", "Baking", "Food Presentation"],
        salaryMin: 260000,
        salaryMax: 340000,
      },
      {
        title: "Dishwasher / Kitchen Steward",
        category: "Kitchen Support",
        summary: "Maintain kitchen cleanliness and dishwashing operations",
        responsibilities:
          "Wash dishes and utensils; Maintain clean kitchen; Assist with food prep as needed; Follow sanitation standards",
        requirements:
          "Physical stamina; Basic Japanese N5; Reliable; Team player",
        requiredEducation: "None",
        japaneseLevel: "N5",
        requiredExperience: { years: 0, description: "No experience required" },
        requiredSkills: ["Kitchen Cleaning", "Dishwashing", "Teamwork"],
        salaryMin: 180000,
        salaryMax: 230000,
      },
    ],
    Hospitality: [
      {
        title: "Hotel Front Desk Staff",
        category: "Guest Services",
        summary: "Provide excellent guest service at hotel front desk",
        responsibilities:
          "Check-in/check-out guests; Handle reservations; Respond to guest inquiries; Process payments; Coordinate with other departments",
        requirements:
          "Customer service experience; Japanese N4 or higher; English conversational; Professional appearance; Computer skills",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Customer service or hospitality experience",
        },
        requiredSkills: [
          "Customer Service",
          "Communication",
          "Computer Systems",
        ],
        salaryMin: 220000,
        salaryMax: 290000,
      },
      {
        title: "Housekeeping Staff",
        category: "Room Maintenance",
        summary: "Maintain cleanliness and comfort of guest rooms",
        responsibilities:
          "Clean and prepare guest rooms; Change linens; Restock amenities; Report maintenance issues; Follow hygiene standards",
        requirements:
          "Physical stamina; Japanese N5 or higher; Attention to detail; Reliable; Team player",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; housekeeping experience helpful",
        },
        requiredSkills: ["Cleaning", "Attention to Detail", "Time Management"],
        salaryMin: 200000,
        salaryMax: 260000,
      },
      {
        title: "Restaurant Server (Hotel)",
        category: "Food & Beverage",
        summary: "Serve guests in hotel restaurant and banquet facilities",
        responsibilities:
          "Take orders and serve meals; Provide menu recommendations; Handle guest requests; Maintain dining area cleanliness",
        requirements:
          "Food service experience; Japanese N4 or higher; Customer service skills; Professional demeanor",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Restaurant or food service experience",
        },
        requiredSkills: ["Food Service", "Customer Service", "Communication"],
        salaryMin: 210000,
        salaryMax: 280000,
      },
      {
        title: "Bellhop / Porter",
        category: "Guest Services",
        summary: "Assist guests with luggage and provide property information",
        responsibilities:
          "Greet guests and assist with luggage; Escort guests to rooms; Provide property information; Arrange transportation; Run errands",
        requirements:
          "Physical fitness; Japanese N5 or higher; Friendly personality; Service-oriented; Basic English helpful",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Customer service experience preferred",
        },
        requiredSkills: [
          "Customer Service",
          "Physical Fitness",
          "Communication",
        ],
        salaryMin: 190000,
        salaryMax: 250000,
      },
    ],
    "Building Cleaning": [
      {
        title: "Building Maintenance Technician",
        category: "Maintenance",
        summary: "Maintain building systems and facilities",
        responsibilities:
          "Perform preventive maintenance; Repair building systems; Respond to maintenance requests; Maintain records; Ensure safety compliance",
        requirements:
          "Technical training or 2+ years experience; Japanese N4 or higher; Electrical/plumbing knowledge; Problem-solving skills",
        requiredEducation: "Vocational",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 2,
          description: "Building maintenance or facility management",
        },
        requiredSkills: [
          "Building Maintenance",
          "Electrical Systems",
          "Plumbing",
        ],
        salaryMin: 250000,
        salaryMax: 330000,
      },
      {
        title: "Industrial Cleaner",
        category: "Cleaning Services",
        summary: "Clean and maintain industrial and commercial facilities",
        responsibilities:
          "Clean production areas; Operate cleaning equipment; Follow safety protocols; Dispose of waste properly; Maintain cleaning supplies",
        requirements:
          "Physical stamina; Japanese N5 or higher; Safety conscious; Reliable; Willingness to work various shifts",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; cleaning experience helpful",
        },
        requiredSkills: [
          "Industrial Cleaning",
          "Safety Compliance",
          "Equipment Operation",
        ],
        salaryMin: 200000,
        salaryMax: 260000,
      },
      {
        title: "Facility Supervisor",
        category: "Management",
        summary: "Supervise facility maintenance and cleaning operations",
        responsibilities:
          "Manage maintenance team; Schedule work orders; Coordinate contractors; Ensure quality standards; Monitor budgets",
        requirements:
          "3+ years facility management; Japanese N3 or higher; Leadership skills; Technical knowledge; Budget management",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 3,
          description: "Facility management or supervisory role",
        },
        requiredSkills: [
          "Team Management",
          "Facility Operations",
          "Budget Management",
        ],
        salaryMin: 300000,
        salaryMax: 400000,
      },
    ],
    "Food Processing": [
      {
        title: "Seafood Processing Worker",
        category: "Production",
        summary: "Process and package seafood products",
        responsibilities:
          "Clean and cut fish; Operate processing equipment; Package products; Maintain quality standards; Follow food safety procedures",
        requirements:
          "Physical stamina; Japanese N5 or higher; Cold environment tolerance; Knife handling skills; Food safety awareness",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; food processing experience helpful",
        },
        requiredSkills: ["Food Processing", "Knife Skills", "Quality Control"],
        salaryMin: 210000,
        salaryMax: 280000,
      },
      {
        title: "Quality Control Inspector (Food)",
        category: "Quality Assurance",
        summary: "Inspect seafood products for quality and safety",
        responsibilities:
          "Inspect raw materials and finished products; Conduct quality tests; Document inspection results; Ensure HACCP compliance; Report issues",
        requirements:
          "1+ years QC experience; Japanese N4 or higher; Food safety knowledge; Attention to detail; HACCP training preferred",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Food quality control or inspection",
        },
        requiredSkills: ["Quality Control", "Food Safety", "HACCP"],
        salaryMin: 230000,
        salaryMax: 310000,
      },
      {
        title: "Production Line Supervisor (Food)",
        category: "Management",
        summary: "Supervise seafood processing production line",
        responsibilities:
          "Manage production team; Monitor output and quality; Ensure safety compliance; Train new workers; Coordinate with management",
        requirements:
          "2+ years food production; Japanese N3 or higher; Leadership skills; Food safety certification; Problem-solving ability",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 2,
          description: "Food processing or supervisory role",
        },
        requiredSkills: [
          "Team Leadership",
          "Food Production",
          "Safety Management",
        ],
        salaryMin: 280000,
        salaryMax: 360000,
      },
      {
        title: "Packaging Machine Operator",
        category: "Operations",
        summary: "Operate packaging machinery for seafood products",
        responsibilities:
          "Set up and operate packaging machines; Monitor machine performance; Perform quality checks; Troubleshoot minor issues; Maintain cleanliness",
        requirements:
          "1+ years machine operation; Japanese N5 or higher; Mechanical aptitude; Attention to detail; Shift work flexibility",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 1,
          description: "Machine operation or food packaging",
        },
        requiredSkills: [
          "Machine Operation",
          "Quality Control",
          "Troubleshooting",
        ],
        salaryMin: 220000,
        salaryMax: 290000,
      },
    ],
    Logistics: [
      {
        title: "Warehouse Worker",
        category: "Operations",
        summary: "Handle receiving, storage, and shipping of goods",
        responsibilities:
          "Load and unload shipments; Pick and pack orders; Operate forklifts; Maintain inventory accuracy; Keep warehouse organized",
        requirements:
          "Physical stamina; Japanese N5 or higher; Forklift license preferred; Basic computer skills; Reliable",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 0,
          description: "Training provided; warehouse experience helpful",
        },
        requiredSkills: [
          "Warehouse Operations",
          "Forklift Operation",
          "Physical Labor",
        ],
        salaryMin: 210000,
        salaryMax: 280000,
      },
      {
        title: "Forklift Operator",
        category: "Equipment Operation",
        summary: "Operate forklifts and material handling equipment",
        responsibilities:
          "Operate forklifts safely; Move materials within warehouse; Load/unload trucks; Perform equipment inspections; Maintain safety standards",
        requirements:
          "Forklift license required; 1+ years experience; Japanese N5 or higher; Safety conscious; Good spatial awareness",
        requiredEducation: "High School",
        japaneseLevel: "N5",
        requiredExperience: {
          years: 1,
          description: "Forklift operation experience",
        },
        requiredSkills: [
          "Forklift Operation",
          "Safety Compliance",
          "Material Handling",
        ],
        salaryMin: 230000,
        salaryMax: 300000,
      },
      {
        title: "Inventory Control Specialist",
        category: "Operations",
        summary: "Manage warehouse inventory and stock control",
        responsibilities:
          "Track inventory levels; Conduct cycle counts; Update inventory systems; Investigate discrepancies; Generate reports",
        requirements:
          "1+ years inventory experience; Japanese N4 or higher; Computer proficiency; Attention to detail; Analytical skills",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Inventory control or warehouse operations",
        },
        requiredSkills: [
          "Inventory Management",
          "Computer Systems",
          "Data Analysis",
        ],
        salaryMin: 240000,
        salaryMax: 320000,
      },
      {
        title: "Warehouse Supervisor",
        category: "Management",
        summary: "Supervise warehouse operations and staff",
        responsibilities:
          "Manage warehouse team; Coordinate shipping/receiving; Ensure safety compliance; Monitor productivity; Train new staff",
        requirements:
          "3+ years warehouse experience; Japanese N3 or higher; Leadership skills; Computer proficiency; Problem-solving ability",
        requiredEducation: "Associate",
        japaneseLevel: "N3",
        requiredExperience: {
          years: 3,
          description: "Warehouse supervision or team lead role",
        },
        requiredSkills: [
          "Team Management",
          "Warehouse Operations",
          "Logistics Coordination",
        ],
        salaryMin: 300000,
        salaryMax: 390000,
      },
      {
        title: "Delivery Driver",
        category: "Transportation",
        summary: "Deliver goods to customers and businesses",
        responsibilities:
          "Drive delivery truck; Load and secure cargo; Follow delivery schedule; Collect signatures; Maintain vehicle; Provide customer service",
        requirements:
          "Valid driver's license; Japanese N4 or higher; Clean driving record; Physical fitness; Customer service skills; Route knowledge",
        requiredEducation: "High School",
        japaneseLevel: "N4",
        requiredExperience: {
          years: 1,
          description: "Commercial driving or delivery experience",
        },
        requiredSkills: ["Driving", "Customer Service", "Time Management"],
        salaryMin: 240000,
        salaryMax: 320000,
      },
    ],
  };

  // Create jobs for each company
  for (const { company, employerEmail } of companyList) {
    const templates = jobTemplates[company.industry] || [];
    const employer = await User.findOne({ email: employerEmail });

    if (!employer) {
      console.warn(`  ⚠️  No employer found for company ${company.name}`);
      continue;
    }

    // Create multiple jobs per company (use all templates)
    for (const template of templates) {
      try {
        const job = await Job.create({
          company: company._id,
          postedBy: employer._id,
          title: template.title,
          industry: company.industry,
          category: template.category,
          summary: template.summary,
          responsibilities: template.responsibilities,
          requirements: template.requirements,
          requiredEducation: template.requiredEducation,
          japaneseLevel: template.japaneseLevel,
          requiredExperience: template.requiredExperience,
          requiredSkills: template.requiredSkills,
          compensation: {
            salaryMin: template.salaryMin,
            salaryMax: template.salaryMax,
            currency: "JPY",
            period: "monthly",
          },
          location: {
            prefecture: company.location.prefecture,
            city: company.location.city,
            remote: false,
          },
          applicationInfo: {
            deadline: nowISO(60), // 60 days from now
            startDate: nowISO(90), // 90 days from now
            applicationMethod: "Platform",
          },
          status: "active",
        });

        createdJobs.push(job);
        log(`  ✓ Created job: ${job.title} at ${company.name}`);
      } catch (error) {
        console.error(
          `  ✗ Failed to create job ${template.title} at ${company.name}:`,
          error.message,
        );
      }
    }
  }

  console.log(`✅ Created ${createdJobs.length} jobs`);
  return createdJobs;
}

async function seedApplications(userList, jobList) {
  console.log("📝 Seeding applications...");
  const jobseekers = userList.filter((u) => u.user.role === "jobseeker");
  const createdApplications = [];

  // Application statuses to distribute
  const statuses = [
    { status: "submitted", count: 5 },
    { status: "reviewing", count: 5 },
    { status: "interview", count: 3 },
    { status: "offer", count: 3 },
    { status: "accepted", count: 2 },
    { status: "rejected", count: 2 },
  ];

  let applicationIndex = 0;

  for (const statusGroup of statuses) {
    for (
      let i = 0;
      i < statusGroup.count && applicationIndex < jobseekers.length * 2;
      i++
    ) {
      const jobseeker = jobseekers[applicationIndex % jobseekers.length];
      const job = jobList[applicationIndex % jobList.length];

      try {
        // Check if application already exists
        const existing = await Application.findOne({
          applicant: jobseeker.user._id,
          job: job._id,
        });

        if (existing) {
          log(
            `  ⚠️  Application already exists: ${jobseeker.user.email} -> ${job.title}`,
          );
          applicationIndex++;
          continue;
        }

        const application = await Application.create({
          job: job._id,
          applicant: jobseeker.user._id,
          coverLetter: `I am very interested in the ${job.title} position. I believe my skills and experience make me a great fit for this role.`,
          status: statusGroup.status,
        });

        createdApplications.push(application);
        log(
          `  ✓ Created application: ${jobseeker.user.email} -> ${job.title} (${statusGroup.status})`,
        );
      } catch (error) {
        console.error(`  ✗ Failed to create application:`, error.message);
      }

      applicationIndex++;
    }
  }

  console.log(`✅ Created ${createdApplications.length} applications`);
  return createdApplications;
}

async function main() {
  try {
    await connect();

    if (CLEAR_DATA) {
      await clearAll();
    }

    // Load seed data from JSON files
    const usersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "seedData", "users.json"), "utf8"),
    );
    const companiesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "seedData", "companies.json"),
        "utf8",
      ),
    );

    console.log("\n🌱 Starting comprehensive database seeding...\n");

    // Seed in order (respecting references)
    const userList = await seedUsers(usersData);
    const companyList = await seedCompanies(companiesData, userList);
    await seedProfiles(userList);
    const jobList = await seedJobs(companyList);
    const applicationList = await seedApplications(userList, jobList);

    // Write artifacts
    const artifacts = {
      users: userList.length,
      companies: companyList.length,
      jobs: jobList.length,
      applications: applicationList.length,
      admin_email: "admin@japanssw.com",
      sample_employer: companyList[0]?.employerEmail || null,
      sample_jobseeker:
        userList.find((u) => u.user.role === "jobseeker")?.user.email || null,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(__dirname, ".seed_artifacts.json"),
      JSON.stringify(artifacts, null, 2),
    );

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📊 Summary:`);
    console.log(
      `   • Users: ${userList.length} (1 admin, ${userList.filter((u) => u.user.role === "employer").length} employers, ${userList.filter((u) => u.user.role === "jobseeker").length} jobseekers)`,
    );
    console.log(`   • Companies: ${companyList.length}`);
    console.log(`   • Jobs: ${jobList.length}`);
    console.log(`   • Applications: ${applicationList.length}`);
    console.log(`\n📝 Artifacts written to: .seed_artifacts.json`);
    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Admin: admin@japanssw.com / Admin123!`);
    console.log(
      `   Employer: ${companyList[0]?.employerEmail || "N/A"} / Test123!`,
    );
    console.log(
      `   Jobseeker: ${userList.find((u) => u.user.role === "jobseeker")?.user.email || "N/A"} / Test123!`,
    );
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ SEEDING FAILED:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
