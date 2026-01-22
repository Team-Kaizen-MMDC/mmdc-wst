# MongoDB Atlas Integration Guide

## Overview

This document provides a comprehensive guide for integrating MongoDB Atlas with the Japan SSW (Specified Skilled Worker) platform. The platform connects job seekers with Japanese employers and Registered Support Organizations (RSOs) for SSW visa opportunities.

## Table of Contents

- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Database Schema Design](#database-schema-design)
- [Collections Overview](#collections-overview)
- [Integration Architecture](#integration-architecture)
- [Backend Implementation](#backend-implementation)
- [Security & Best Practices](#security--best-practices)
- [Migration Strategy](#migration-strategy)
- [API Endpoints](#api-endpoints)

---

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in
3. Create a new organization (e.g., "Japan SSW Platform")

### 2. Create Cluster

```bash
# Recommended Configuration:
- Cluster Tier: M0 (Free) for development, M10+ for production
- Cloud Provider: AWS (ap-northeast-1 - Tokyo) for low latency
- Cluster Name: japanssw-cluster
- MongoDB Version: 6.0 or higher
```

### 3. Network Access Configuration

```bash
# For Development:
# Add your IP address: 0.0.0.0/0 (Allow access from anywhere)

# For Production:
# Whitelist specific IPs or use VPC peering
# Example: 203.0.113.0/24 (Your application server IP range)
```

### 4. Database User Setup

```bash
# Create database user:
Username: japanssw_app_user
Password: <generate-strong-password>
Role: readWrite on japanssw_db
Authentication Database: admin
```

### 5. Connection String

```javascript
// Development Connection String:
mongodb+srv://japanssw_app_user:<password>@japanssw-cluster.xxxxx.mongodb.net/japanssw_db?retryWrites=true&w=majority

// Production Connection String (with additional options):
mongodb+srv://japanssw_app_user:<password>@japanssw-cluster.xxxxx.mongodb.net/japanssw_db?retryWrites=true&w=majority&maxPoolSize=50&minPoolSize=10
```

---

## Database Schema Design

### Database Structure

```
japanssw_db/
├── users
├── companies
├── jobs
├── applications
├── rsos (Registered Support Organizations)
├── visaGuidance
├── userProfiles
├── savedJobs
├── notifications
└── auditLogs
```

---

## Collections Overview

### 1. **users** Collection

Stores user authentication and basic account information.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "juan.delacruz@example.com",
  passwordHash: "$2b$10$...", // bcrypt hashed password
  role: "jobseeker", // Enum: ["jobseeker", "employer", "rso", "admin"]
  accountStatus: "active", // Enum: ["active", "suspended", "pending", "deactivated"]
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  lastLogin: ISODate("2026-01-22T10:30:00Z"),
  loginAttempts: 0,
  passwordResetToken: null,
  passwordResetExpires: null,
  preferences: {
    language: "en", // "en" or "ja"
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    timezone: "Asia/Tokyo"
  },
  createdAt: ISODate("2025-12-01T08:00:00Z"),
  updatedAt: ISODate("2026-01-22T10:30:00Z")
}
```

**Indexes:**

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ accountStatus: 1 });
db.users.createIndex({ createdAt: -1 });
```

---

### 2. **userProfiles** Collection

Detailed profile information for job seekers.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"), // Reference to users collection

  // Basic Information
  personalInfo: {
    firstName: "Juan",
    middleName: "Pablo",
    lastName: "Dela Cruz",
    dateOfBirth: ISODate("1995-03-15T00:00:00Z"),
    age: 31,
    gender: "Male", // Enum: ["Male", "Female", "Other", "Prefer not to say"]
    nationality: "Philippines",
    profilePhoto: "https://cdn.japanssw.com/profiles/juan-delacruz.jpg",
    profileSummary: "Experienced service crew looking for opportunities in Japan's hospitality sector."
  },

  // Contact Information
  contactInfo: {
    mobile1: "+639123456789",
    mobile2: "+639987654321",
    email: "juan.delacruz@example.com",
    address: {
      street: "123 Rizal St.",
      city: "Quezon City",
      prefecture: "Metro Manila",
      postalCode: "1100",
      country: "Philippines"
    }
  },

  // Work-Related Information
  workInfo: {
    industry: "Food and Beverage", // SSW-eligible industries
    japaneseLevel: "N3", // JLPT levels: N1, N2, N3, N4, N5, None
    currentVisaStatus: "Tourist Visa",
    desiredVisaType: "SSW Type 1",
    expectedSalary: {
      min: 180000,
      max: 250000,
      currency: "JPY",
      period: "monthly"
    }
  },

  // Education History
  education: [
    {
      _id: ObjectId("507f1f77bcf86cd799439013"),
      institution: "University of the Philippines",
      degree: "Bachelor of Science",
      fieldOfStudy: "Hospitality Management",
      startDate: ISODate("2012-06-01T00:00:00Z"),
      endDate: ISODate("2016-04-30T00:00:00Z"),
      graduated: true,
      gpa: 3.5,
      location: {
        city: "Diliman",
        country: "Philippines"
      }
    }
  ],

  // Work Experience
  experience: [
    {
      _id: ObjectId("507f1f77bcf86cd799439014"),
      jobTitle: "Service Crew",
      company: "McDonald's Philippines",
      employmentType: "Full-time", // Full-time, Part-time, Contract, Internship
      startDate: ISODate("2016-07-01T00:00:00Z"),
      endDate: ISODate("2020-12-31T00:00:00Z"),
      currentlyWorking: false,
      location: {
        city: "Makati",
        country: "Philippines"
      },
      responsibilities: [
        "Customer service and order taking",
        "Food preparation and quality control",
        "Cash handling and POS operations",
        "Training new staff members"
      ],
      achievements: [
        "Employee of the Month (3 times)",
        "Led training for 15+ new hires"
      ]
    }
  ],

  // Skills and Certifications
  skills: [
    {
      name: "Customer Service",
      level: "Expert", // Beginner, Intermediate, Advanced, Expert
      yearsOfExperience: 5
    },
    {
      name: "Japanese Language",
      level: "Intermediate",
      yearsOfExperience: 2
    },
    {
      name: "Food Safety",
      level: "Advanced",
      yearsOfExperience: 4
    }
  ],

  certifications: [
    {
      _id: ObjectId("507f1f77bcf86cd799439015"),
      name: "JLPT N3 Certificate",
      issuingOrganization: "Japan Foundation",
      issueDate: ISODate("2024-08-15T00:00:00Z"),
      expiryDate: null, // null if doesn't expire
      credentialId: "N3-2024-123456",
      credentialUrl: "https://jlpt.jp/verify/N3-2024-123456"
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439016"),
      name: "Food Safety Certificate",
      issuingOrganization: "Department of Health",
      issueDate: ISODate("2020-02-10T00:00:00Z"),
      expiryDate: ISODate("2025-02-10T00:00:00Z"),
      credentialId: "FS-2020-789012",
      credentialUrl: null
    }
  ],

  // Availability
  availability: {
    startDate: ISODate("2026-03-01T00:00:00Z"),
    endDate: ISODate("2029-03-01T00:00:00Z"), // SSW Type 1 max 5 years
    willingToRelocate: true,
    preferredLocations: ["Tokyo", "Osaka", "Kyoto"],
    availableForInterview: true
  },

  // Documents
  documents: [
    {
      _id: ObjectId("507f1f77bcf86cd799439017"),
      type: "Resume", // Resume, Passport, Certificate, Photo
      fileName: "Juan_DelaC ruz_Resume.pdf",
      fileUrl: "https://cdn.japanssw.com/docs/resume-juan.pdf",
      fileSize: 245678, // bytes
      uploadedAt: ISODate("2025-12-15T14:30:00Z"),
      verified: true,
      verifiedBy: ObjectId("507f1f77bcf86cd799439018"),
      verifiedAt: ISODate("2025-12-16T09:00:00Z")
    }
  ],

  // Profile Status
  profileStatus: {
    completionPercentage: 95,
    isComplete: true,
    missingFields: ["certifications.expiryDate"],
    lastUpdated: ISODate("2026-01-20T15:45:00Z")
  },

  // Metadata
  createdAt: ISODate("2025-12-01T08:00:00Z"),
  updatedAt: ISODate("2026-01-20T15:45:00Z")
}
```

**Indexes:**

```javascript
db.userProfiles.createIndex({ userId: 1 }, { unique: true });
db.userProfiles.createIndex({ "workInfo.industry": 1 });
db.userProfiles.createIndex({ "workInfo.japaneseLevel": 1 });
db.userProfiles.createIndex({ "personalInfo.nationality": 1 });
db.userProfiles.createIndex({ "profileStatus.completionPercentage": -1 });
db.userProfiles.createIndex({ "availability.startDate": 1 });
```

---

### 3. **companies** Collection

Company/employer profiles and information.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  userId: ObjectId("507f1f77bcf86cd799439021"), // Reference to users collection

  // Basic Company Information
  companyInfo: {
    companyName: "Daikin Industries, Ltd.",
    companyNameJa: "ダイキン工業株式会社",
    registrationNumber: "1234567890123", // Corporate Number (法人番号)
    establishedDate: ISODate("1924-10-25T00:00:00Z"),
    employeeCount: 75000,
    companySize: "Large", // Small, Medium, Large, Enterprise
    industry: "Manufacturing", // SSW-eligible industries
    subIndustry: ["Air Conditioning", "Refrigeration", "Chemicals"],
    companyType: "Corporation", // Corporation, Partnership, LLC, Government
    stockExchange: "Tokyo Stock Exchange",
    stockSymbol: "6367"
  },

  // Contact Information
  contactInfo: {
    headquarters: {
      address: "Umeda Center Building, 2-4-12 Nakazaki-Nishi",
      city: "Osaka",
      prefecture: "Osaka",
      postalCode: "530-8323",
      country: "Japan"
    },
    phone: "+81-6-6373-4312",
    fax: "+81-6-6373-4389",
    email: "careers@daikin.co.jp",
    website: "https://www.daikin.com",
    socialMedia: {
      linkedin: "https://linkedin.com/company/daikin",
      twitter: "@DaikinJapan",
      facebook: "DaikinIndustries"
    }
  },

  // HR Contact
  hrContact: {
    name: "Tanaka Hiroshi",
    title: "HR Manager",
    email: "tanaka.h@daikin.co.jp",
    phone: "+81-6-6373-4400",
    languages: ["Japanese", "English"]
  },

  // Company Profile
  profile: {
    description: "Daikin Industries is a leading global manufacturer of air conditioning systems and refrigerants.",
    descriptionJa: "ダイキン工業は、空調システムと冷媒の世界的リーディングメーカーです。",
    mission: "To contribute to a better quality of life through comfortable air environments.",
    values: ["Innovation", "Quality", "Sustainability", "Customer Focus"],
    culture: "We value diversity and foster an inclusive workplace where every employee can thrive.",
    benefits: [
      "Visa sponsorship for qualified candidates",
      "Housing support and allowance",
      "Japanese language training",
      "Health insurance and pension",
      "Annual bonuses",
      "Career development programs"
    ],
    workEnvironment: {
      averageAge: 38,
      foreignEmployeeRatio: 15, // percentage
      supportLanguages: ["Japanese", "English", "Chinese"],
      workLifeBalance: "Good",
      overtimeAverage: 20 // hours per month
    }
  },

  // Visual Assets
  media: {
    logo: "https://cdn.japanssw.com/logos/daikin-logo.png",
    coverImage: "https://cdn.japanssw.com/covers/daikin-cover.jpg",
    officePhotos: [
      "https://cdn.japanssw.com/photos/daikin-office-1.jpg",
      "https://cdn.japanssw.com/photos/daikin-office-2.jpg"
    ],
    videoUrl: "https://youtube.com/watch?v=daikin-company-intro"
  },

  // SSW Program Details
  sswProgram: {
    isSSWEmployer: true,
    registeredWithIMSA: true, // Immigration Services Agency
    registrationNumber: "SSW-2023-001234",
    supportedVisaTypes: ["SSW Type 1", "SSW Type 2"],
    eligibleIndustries: ["Manufacturing"],
    rsoPartners: [
      ObjectId("507f1f77bcf86cd799439030") // Reference to RSOs
    ],
    hasInHouseSupport: true
  },

  // Statistics
  statistics: {
    totalJobPostings: 12,
    activeJobPostings: 8,
    totalApplications: 245,
    totalHires: 18,
    averageTimeToHire: 45, // days
    employeeSatisfaction: 4.5, // out of 5
    companyRating: 4.7 // out of 5
  },

  // Verification Status
  verification: {
    isVerified: true,
    verifiedAt: ISODate("2024-01-15T10:00:00Z"),
    verifiedBy: ObjectId("507f1f77bcf86cd799439031"), // Admin user ID
    verificationDocuments: [
      {
        type: "Business License",
        documentUrl: "https://cdn.japanssw.com/verifications/daikin-license.pdf",
        uploadedAt: ISODate("2024-01-10T14:00:00Z")
      }
    ]
  },

  // Account Status
  accountStatus: "active", // active, suspended, pending, deactivated
  subscriptionPlan: "premium", // free, basic, premium, enterprise
  subscriptionExpires: ISODate("2026-12-31T23:59:59Z"),

  // Metadata
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-15T11:30:00Z")
}
```

**Indexes:**

```javascript
db.companies.createIndex({ userId: 1 }, { unique: true });
db.companies.createIndex({ "companyInfo.companyName": "text" });
db.companies.createIndex({ "companyInfo.industry": 1 });
db.companies.createIndex({ "contactInfo.headquarters.prefecture": 1 });
db.companies.createIndex({ "sswProgram.isSSWEmployer": 1 });
db.companies.createIndex({ "verification.isVerified": 1 });
db.companies.createIndex({ accountStatus: 1 });
db.companies.createIndex({ createdAt: -1 });
```

---

### 4. **jobs** Collection

Job postings and opportunities.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439040"),
  companyId: ObjectId("507f1f77bcf86cd799439020"), // Reference to companies

  // Job Basic Information
  jobInfo: {
    title: "Facilities Maintenance Cleaner",
    titleJa: "施設メンテナンス清掃員",
    jobCode: "DAIKIN-2026-001",
    industry: "Building Cleaning Management", // SSW industry category
    category: "Cleaning Services",
    employmentType: "Full-time", // Full-time, Part-time, Contract, Temporary
    contractDuration: {
      min: 12, // months
      max: 60  // SSW Type 1 maximum
    }
  },

  // Job Description
  description: {
    summary: "We are seeking dedicated individuals for facilities maintenance and cleaning positions.",
    summaryJa: "施設の保守・清掃業務に従事していただける方を募集しています。",
    responsibilities: [
      "Daily cleaning and maintenance of office facilities",
      "Restroom sanitation and supply management",
      "Floor cleaning and polishing",
      "Waste collection and disposal",
      "Equipment maintenance and minor repairs"
    ],
    responsibilitiesJa: [
      "オフィス施設の日常清掃および保守",
      "トイレの衛生管理と備品管理",
      "床の清掃と磨き作業",
      "ごみの収集と処分",
      "設備のメンテナンスと軽微な修理"
    ]
  },

  // Requirements
  requirements: {
    education: "High School", // No requirement, High School, Associate, Bachelor, Master, PhD
    experience: {
      required: true,
      minimumYears: 1,
      preferredYears: 3,
      fieldOfExperience: "Cleaning or Facilities Maintenance"
    },
    japaneseLevel: {
      minimum: "N4", // N1, N2, N3, N4, N5, None
      preferred: "N3"
    },
    skills: [
      "Basic Japanese communication",
      "Attention to detail",
      "Physical stamina",
      "Time management"
    ],
    certifications: [
      {
        name: "Building Cleaning Technician Certificate",
        required: false,
        preferred: true
      }
    ],
    otherRequirements: [
      "Must be eligible for SSW Type 1 visa",
      "Willing to work early morning shifts",
      "Able to lift up to 20kg",
      "Good health condition"
    ]
  },

  // Compensation
  compensation: {
    salary: {
      min: 180000,
      max: 220000,
      currency: "JPY",
      period: "monthly", // hourly, daily, monthly, yearly
      paymentSchedule: "Monthly on 25th"
    },
    dailyRate: 9000, // JPY per day
    hourlyRate: null,
    workHours: {
      standard: "08:00-17:00",
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerWeek: "3-6 days",
      overtimeAvailable: true,
      overtimePay: 1.25 // multiplier
    },
    benefits: [
      "Social insurance (health, pension, unemployment)",
      "Workers' compensation insurance",
      "Paid holidays (10 days/year)",
      "Transportation allowance (up to ¥15,000/month)",
      "Housing support available",
      "Uniform provided",
      "Annual health checkup"
    ],
    trialPeriod: {
      duration: 180, // days
      salary: 180000,
      terms: "Same conditions apply during trial period"
    }
  },

  // Location
  location: {
    workSite: "Daikin Osaka Office",
    address: "2-4-12 Nakazaki-Nishi, Kita-ku",
    city: "Osaka",
    prefecture: "Osaka",
    postalCode: "530-8323",
    country: "Japan",
    nearestStation: "Osaka Station",
    accessInstructions: "5 minutes walk from JR Osaka Station",
    coordinates: {
      type: "Point",
      coordinates: [135.4959, 34.7024] // [longitude, latitude]
    },
    remote: false,
    relocationRequired: true,
    relocationSupport: {
      provided: true,
      details: "Initial accommodation support for first 3 months"
    }
  },

  // Application Details
  applicationInfo: {
    applicationDeadline: ISODate("2026-03-31T23:59:59Z"),
    startDate: ISODate("2026-05-01T00:00:00Z"),
    positions: 5,
    positionsFilled: 0,
    applicationMethod: "online", // online, email, phone, in-person
    requiredDocuments: [
      "Resume/CV (English or Japanese)",
      "Passport copy",
      "JLPT certificate (if applicable)",
      "Work experience certificates",
      "Motivation letter"
    ],
    selectionProcess: [
      "Document screening (1-2 weeks)",
      "Video interview (Japanese language test included)",
      "Skills assessment",
      "Final interview",
      "Job offer"
    ],
    estimatedProcessTime: "4-6 weeks"
  },

  // SSW Visa Information
  visaInfo: {
    sponsorshipProvided: true,
    visaType: "SSW Type 1",
    sswIndustry: "Building Cleaning Management",
    registeredWithIMSA: true,
    rsoSupport: {
      provided: true,
      rsoId: ObjectId("507f1f77bcf86cd799439030"),
      services: [
        "Visa application support",
        "Japanese language training",
        "Cultural orientation",
        "24/7 consultation hotline"
      ]
    }
  },

  // Job Status
  status: "active", // draft, active, paused, closed, filled
  featured: true,
  urgent: false,

  // Statistics
  statistics: {
    views: 1234,
    applications: 25,
    shortlisted: 8,
    interviewed: 3,
    offers: 0,
    averageApplicationScore: 75 // percentage
  },

  // SEO and Discovery
  seo: {
    slug: "cleaner-facilities-maintenance-daikin-osaka",
    metaTitle: "Facilities Maintenance Cleaner - Daikin Industries, Osaka",
    metaDescription: "Join Daikin Industries as a Facilities Maintenance Cleaner in Osaka. SSW visa sponsorship provided.",
    keywords: ["cleaning", "facilities", "osaka", "ssw visa", "daikin", "maintenance"]
  },

  // Metadata
  createdBy: ObjectId("507f1f77bcf86cd799439021"), // User who created
  createdAt: ISODate("2026-01-15T09:00:00Z"),
  updatedAt: ISODate("2026-01-20T14:30:00Z"),
  publishedAt: ISODate("2026-01-16T00:00:00Z"),
  closedAt: null,
  expiresAt: ISODate("2026-03-31T23:59:59Z")
}
```

**Indexes:**

```javascript
db.jobs.createIndex({ companyId: 1 });
db.jobs.createIndex({ status: 1 });
db.jobs.createIndex({ "jobInfo.industry": 1 });
db.jobs.createIndex({ "location.prefecture": 1 });
db.jobs.createIndex({ "requirements.japaneseLevel.minimum": 1 });
db.jobs.createIndex({ "compensation.salary.min": 1 });
db.jobs.createIndex({ "applicationInfo.applicationDeadline": 1 });
db.jobs.createIndex({ featured: 1, createdAt: -1 });
db.jobs.createIndex({ "seo.slug": 1 }, { unique: true });
db.jobs.createIndex({ "location.coordinates": "2dsphere" }); // Geospatial index
db.jobs.createIndex({
  "jobInfo.title": "text",
  "description.summary": "text",
  "description.responsibilities": "text",
}); // Full-text search
```

---

### 5. **applications** Collection

Job applications and tracking.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439050"),
  jobId: ObjectId("507f1f77bcf86cd799439040"), // Reference to jobs
  applicantId: ObjectId("507f1f77bcf86cd799439011"), // Reference to users
  companyId: ObjectId("507f1f77bcf86cd799439020"), // Reference to companies

  // Application Information
  applicationInfo: {
    applicationNumber: "APP-2026-001234",
    appliedAt: ISODate("2026-01-22T10:30:00Z"),
    source: "website", // website, referral, job board, direct, other
    referralCode: null,
    coverLetter: "I am writing to express my strong interest in the Facilities Maintenance Cleaner position...",
    motivation: "I have been studying Japanese for 2 years and am eager to work in Japan..."
  },

  // Application Status
  status: {
    current: "shortlisted", // applied, under_review, shortlisted, interview_scheduled, interviewed, offer_extended, accepted, rejected, withdrawn
    history: [
      {
        status: "applied",
        timestamp: ISODate("2026-01-22T10:30:00Z"),
        note: "Application received",
        updatedBy: null
      },
      {
        status: "under_review",
        timestamp: ISODate("2026-01-23T14:00:00Z"),
        note: "HR reviewing application",
        updatedBy: ObjectId("507f1f77bcf86cd799439021")
      },
      {
        status: "shortlisted",
        timestamp: ISODate("2026-01-25T11:00:00Z"),
        note: "Candidate meets requirements, scheduled for interview",
        updatedBy: ObjectId("507f1f77bcf86cd799439021")
      }
    ]
  },

  // Submitted Documents
  documents: [
    {
      _id: ObjectId("507f1f77bcf86cd799439051"),
      type: "Resume",
      fileName: "Juan_DelaC ruz_Resume.pdf",
      fileUrl: "https://cdn.japanssw.com/applications/app-001234-resume.pdf",
      fileSize: 245678,
      uploadedAt: ISODate("2026-01-22T10:25:00Z")
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439052"),
      type: "JLPT Certificate",
      fileName: "JLPT_N3_Certificate.pdf",
      fileUrl: "https://cdn.japanssw.com/applications/app-001234-jlpt.pdf",
      fileSize: 156789,
      uploadedAt: ISODate("2026-01-22T10:27:00Z")
    }
  ],

  // Interview Information
  interviews: [
    {
      _id: ObjectId("507f1f77bcf86cd799439053"),
      type: "Video Interview", // Phone, Video, In-person, Group
      scheduledAt: ISODate("2026-01-30T14:00:00Z"),
      duration: 60, // minutes
      timezone: "Asia/Tokyo",
      location: "Zoom Meeting",
      meetingLink: "https://zoom.us/j/123456789",
      interviewers: [
        {
          name: "Tanaka Hiroshi",
          title: "HR Manager",
          email: "tanaka.h@daikin.co.jp"
        }
      ],
      status: "scheduled", // scheduled, completed, cancelled, rescheduled, no_show
      notes: "Japanese language proficiency will be tested",
      feedback: null,
      rating: null
    }
  ],

  // Assessment and Scoring
  assessment: {
    screeningScore: 85, // out of 100
    skillsTestScore: null,
    interviewScore: null,
    overallScore: 85,
    strengths: [
      "Strong customer service experience",
      "JLPT N3 certified",
      "Relevant work experience"
    ],
    concerns: [
      "Limited facilities maintenance experience",
      "Needs visa sponsorship support"
    ],
    recommendation: "Proceed to interview stage"
  },

  // Communication History
  communications: [
    {
      _id: ObjectId("507f1f77bcf86cd799439054"),
      type: "email", // email, phone, sms, in-app
      direction: "outbound", // inbound, outbound
      subject: "Application Received - Facilities Maintenance Cleaner",
      message: "Thank you for applying. We will review your application and get back to you within 5 business days.",
      sentBy: ObjectId("507f1f77bcf86cd799439021"),
      sentTo: ObjectId("507f1f77bcf86cd799439011"),
      sentAt: ISODate("2026-01-22T10:35:00Z"),
      opened: true,
      openedAt: ISODate("2026-01-22T11:00:00Z")
    }
  ],

  // Offer Details (if applicable)
  offer: {
    extended: false,
    extendedAt: null,
    expiresAt: null,
    salary: null,
    startDate: null,
    acceptedAt: null,
    declinedAt: null,
    declineReason: null
  },

  // Notes and Comments (Internal)
  internalNotes: [
    {
      _id: ObjectId("507f1f77bcf86cd799439055"),
      note: "Candidate has strong profile. Recommend for interview.",
      addedBy: ObjectId("507f1f77bcf86cd799439021"),
      addedAt: ISODate("2026-01-25T10:45:00Z"),
      private: true
    }
  ],

  // Metadata
  createdAt: ISODate("2026-01-22T10:30:00Z"),
  updatedAt: ISODate("2026-01-25T11:00:00Z")
}
```

**Indexes:**

```javascript
db.applications.createIndex({ jobId: 1 });
db.applications.createIndex({ applicantId: 1 });
db.applications.createIndex({ companyId: 1 });
db.applications.createIndex({ "status.current": 1 });
db.applications.createIndex(
  { "applicationInfo.applicationNumber": 1 },
  { unique: true },
);
db.applications.createIndex({ "applicationInfo.appliedAt": -1 });
db.applications.createIndex({ companyId: 1, "status.current": 1 });
db.applications.createIndex({ applicantId: 1, "status.current": 1 });
```

---

### 6. **rsos** Collection

Registered Support Organizations information.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439030"),
  userId: ObjectId("507f1f77bcf86cd799439032"), // Reference to users

  // RSO Basic Information
  rsoInfo: {
    organizationName: "Japan Work Support Services",
    organizationNameJa: "ジャパン・ワーク・サポート・サービス",
    registrationNumber: "RSO-2024-001234", // IMSA registration number
    registeredDate: ISODate("2024-01-15T00:00:00Z"),
    licenseExpiry: ISODate("2029-01-14T23:59:59Z"),
    organizationType: "Private", // Private, NPO, Government-affiliated
    establishedYear: 2020,
    employeeCount: 25
  },

  // Contact Information
  contactInfo: {
    headquarters: {
      address: "1-2-3 Shinjuku",
      city: "Shinjuku-ku",
      prefecture: "Tokyo",
      postalCode: "160-0022",
      country: "Japan"
    },
    phone: "+81-3-1234-5678",
    emergencyPhone: "+81-90-1234-5678", // 24/7 hotline
    fax: "+81-3-1234-5679",
    email: "info@japanworksupport.jp",
    website: "https://www.japanworksupport.jp",
    languages: ["English", "Japanese", "Tagalog", "Vietnamese", "Chinese"]
  },

  // Services Offered
  services: {
    preArrival: [
      "Visa application assistance",
      "Job matching services",
      "Pre-departure orientation",
      "Japanese language training",
      "Cultural orientation materials"
    ],
    postArrival: [
      "Airport pickup",
      "Housing arrangement",
      "Bank account setup",
      "Resident card registration",
      "Health insurance enrollment",
      "Mobile phone setup"
    ],
    ongoing: [
      "Regular consultation (minimum monthly)",
      "24/7 emergency support hotline",
      "Japanese language lessons",
      "Life counseling services",
      "Workplace problem resolution",
      "Annual health checkups",
      "Career development support"
    ],
    specializedServices: [
      "Legal consultation",
      "Medical interpretation",
      "Family support services",
      "Visa renewal assistance"
    ]
  },

  // Coverage and Specialization
  coverage: {
    supportedPrefectures: ["Tokyo", "Kanagawa", "Saitama", "Chiba"],
    supportedIndustries: [
      "Manufacturing",
      "Food and Beverage",
      "Building Cleaning Management",
      "Accommodation",
      "Agriculture"
    ],
    languageCapabilities: [
      { language: "English", proficiency: "Native/Fluent" },
      { language: "Japanese", proficiency: "Native" },
      { language: "Tagalog", proficiency: "Fluent" },
      { language: "Vietnamese", proficiency: "Fluent" },
      { language: "Chinese", proficiency: "Intermediate" }
    ],
    maxSupportCapacity: 500, // Maximum number of SSW workers supported
    currentlySupporting: 287
  },

  // Fees and Pricing
  pricing: {
    registrationFee: 50000, // JPY, one-time
    monthlyFee: 25000, // JPY per worker
    additionalServices: [
      {
        service: "Japanese Language Course (Advanced)",
        fee: 10000,
        period: "monthly"
      },
      {
        service: "Emergency Interpretation",
        fee: 5000,
        period: "per incident"
      }
    ],
    employerFees: {
      annualContractFee: 200000,
      perWorkerFee: 30000
    }
  },

  // Partner Companies
  partnerCompanies: [
    ObjectId("507f1f77bcf86cd799439020"), // Daikin
    ObjectId("507f1f77bcf86cd799439025"), // Other company IDs
  ],

  // Staff Information
  staff: [
    {
      _id: ObjectId("507f1f77bcf86cd799439061"),
      name: "Yamada Taro",
      role: "Director",
      languages: ["Japanese", "English"],
      email: "yamada@japanworksupport.jp",
      phone: "+81-3-1234-5678",
      photo: "https://cdn.japanssw.com/rso-staff/yamada.jpg"
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439062"),
      name: "Maria Santos",
      role: "Counselor (Filipino Community)",
      languages: ["Japanese", "English", "Tagalog"],
      email: "santos@japanworksupport.jp",
      phone: "+81-90-2345-6789",
      photo: "https://cdn.japanssw.com/rso-staff/santos.jpg"
    }
  ],

  // Performance Metrics
  performance: {
    totalSupportedWorkers: 450,
    currentActiveWorkers: 287,
    successfulPlacements: 425,
    averageSatisfactionRating: 4.6, // out of 5
    responseTime: {
      averageMinutes: 45,
      emergencyAverageMinutes: 15
    },
    complaintRate: 0.02, // 2%
    renewalRate: 0.95 // 95% of workers renew with this RSO
  },

  // Reviews and Testimonials
  reviews: [
    {
      _id: ObjectId("507f1f77bcf86cd799439063"),
      reviewerId: ObjectId("507f1f77bcf86cd799439011"),
      rating: 5,
      comment: "Excellent support! They helped me with everything from arrival to settling in.",
      commentJa: "素晴らしいサポート！到着から定住まですべてを手伝ってくれました。",
      reviewDate: ISODate("2025-11-10T00:00:00Z"),
      verified: true
    }
  ],

  // Verification and Compliance
  verification: {
    isVerified: true,
    verifiedBy: ObjectId("507f1f77bcf86cd799439031"),
    verifiedAt: ISODate("2024-02-01T00:00:00Z"),
    imsaVerified: true,
    complianceStatus: "Good Standing",
    lastInspection: ISODate("2025-12-15T00:00:00Z"),
    nextInspection: ISODate("2026-12-15T00:00:00Z")
  },

  // Metadata
  accountStatus: "active",
  createdAt: ISODate("2024-01-15T00:00:00Z"),
  updatedAt: ISODate("2026-01-20T00:00:00Z")
}
```

**Indexes:**

```javascript
db.rsos.createIndex({ userId: 1 }, { unique: true });
db.rsos.createIndex({ "rsoInfo.registrationNumber": 1 }, { unique: true });
db.rsos.createIndex({ "coverage.supportedPrefectures": 1 });
db.rsos.createIndex({ "coverage.supportedIndustries": 1 });
db.rsos.createIndex({ "verification.isVerified": 1 });
db.rsos.createIndex({ accountStatus: 1 });
db.rsos.createIndex({ "performance.averageSatisfactionRating": -1 });
```

---

### 7. **savedJobs** Collection

User saved/bookmarked jobs.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439070"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  jobId: ObjectId("507f1f77bcf86cd799439040"),

  // Save Information
  savedAt: ISODate("2026-01-20T15:30:00Z"),
  notes: "Good salary range, location convenient",
  tags: ["priority", "osaka", "daikin"],

  // Notification Preferences
  notifications: {
    statusChanges: true, // Notify when job status changes
    similarJobs: true,   // Notify about similar opportunities
    applicationDeadline: true // Remind before deadline
  },

  // Metadata
  viewed: 3,
  lastViewed: ISODate("2026-01-21T10:00:00Z")
}
```

**Indexes:**

```javascript
db.savedJobs.createIndex({ userId: 1, jobId: 1 }, { unique: true });
db.savedJobs.createIndex({ userId: 1, savedAt: -1 });
db.savedJobs.createIndex({ jobId: 1 });
```

---

### 8. **notifications** Collection

User notifications system.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439080"),
  userId: ObjectId("507f1f77bcf86cd799439011"),

  // Notification Content
  type: "application_status", // application_status, new_job, message, interview, offer, system
  title: "Application Status Updated",
  message: "Your application for Facilities Maintenance Cleaner has been shortlisted!",
  messageJa: "施設メンテナンス清掃員の応募が候補リストに入りました！",

  // Related References
  relatedTo: {
    type: "application", // application, job, company, message, etc.
    id: ObjectId("507f1f77bcf86cd799439050")
  },

  // Notification Status
  status: {
    read: false,
    readAt: null,
    clicked: false,
    clickedAt: null
  },

  // Delivery
  deliveryChannel: ["in-app", "email"], // in-app, email, sms, push
  priority: "high", // low, normal, high, urgent

  // Action
  actionUrl: "/applications/APP-2026-001234",
  actionLabel: "View Application",
  actionLabelJa: "応募を見る",

  // Metadata
  createdAt: ISODate("2026-01-25T11:05:00Z"),
  expiresAt: ISODate("2026-02-25T23:59:59Z")
}
```

**Indexes:**

```javascript
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, "status.read": 1 });
db.notifications.createIndex({ "relatedTo.type": 1, "relatedTo.id": 1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

---

### 9. **visaGuidance** Collection

Visa information and guidance content.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439090"),

  // Content Information
  title: "SSW Type 1 Visa Application Process",
  titleJa: "特定技能1号ビザ申請プロセス",
  slug: "ssw-type-1-visa-application-process",

  // Content
  content: {
    summary: "Complete guide to applying for SSW Type 1 visa...",
    summaryJa: "特定技能1号ビザ申請の完全ガイド...",
    sections: [
      {
        heading: "Eligibility Requirements",
        headingJa: "資格要件",
        content: "To be eligible for SSW Type 1, you must...",
        contentJa: "特定技能1号の資格を得るには...",
        order: 1
      },
      {
        heading: "Required Documents",
        headingJa: "必要書類",
        content: "You will need the following documents...",
        contentJa: "以下の書類が必要です...",
        order: 2
      }
    ]
  },

  // Categorization
  category: "Visa Application", // Visa Application, Requirements, Process, FAQs
  visaType: "SSW Type 1",
  industry: null, // null for general, or specific industry
  tags: ["ssw", "visa", "application", "requirements"],

  // Related Resources
  relatedArticles: [
    ObjectId("507f1f77bcf86cd799439091"),
    ObjectId("507f1f77bcf86cd799439092")
  ],
  downloadableResources: [
    {
      title: "SSW Visa Application Checklist",
      titleJa: "SSWビザ申請チェックリスト",
      type: "PDF",
      fileUrl: "https://cdn.japanssw.com/resources/ssw-checklist.pdf",
      fileSize: 123456
    }
  ],

  // Metadata
  status: "published", // draft, published, archived
  author: ObjectId("507f1f77bcf86cd799439031"),
  publishedAt: ISODate("2025-06-01T00:00:00Z"),
  lastReviewed: ISODate("2026-01-01T00:00:00Z"),
  nextReview: ISODate("2026-07-01T00:00:00Z"),
  version: 2,
  views: 5678,
  helpful: 345,
  notHelpful: 12,
  createdAt: ISODate("2025-05-15T00:00:00Z"),
  updatedAt: ISODate("2026-01-01T00:00:00Z")
}
```

**Indexes:**

```javascript
db.visaGuidance.createIndex({ slug: 1 }, { unique: true });
db.visaGuidance.createIndex({ category: 1, visaType: 1 });
db.visaGuidance.createIndex({ status: 1, publishedAt: -1 });
db.visaGuidance.createIndex({ tags: 1 });
db.visaGuidance.createIndex({
  title: "text",
  "content.summary": "text",
  "content.sections.content": "text",
});
```

---

### 10. **auditLogs** Collection

System audit trail for security and compliance.

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439100"),

  // User Information
  userId: ObjectId("507f1f77bcf86cd799439011"),
  userEmail: "juan.delacruz@example.com",
  userRole: "jobseeker",

  // Action Information
  action: "profile_updated", // login, logout, profile_updated, application_submitted, etc.
  resource: "userProfiles",
  resourceId: ObjectId("507f1f77bcf86cd799439012"),

  // Details
  details: {
    changes: {
      field: "contactInfo.mobile1",
      oldValue: "+639123456789",
      newValue: "+639987654321"
    },
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    location: {
      country: "Philippines",
      city: "Manila"
    }
  },

  // Status
  status: "success", // success, failed, partial
  errorMessage: null,

  // Metadata
  timestamp: ISODate("2026-01-22T10:30:00Z"),
  expiresAt: ISODate("2027-01-22T10:30:00Z") // 1 year retention
}
```

**Indexes:**

```javascript
db.auditLogs.createIndex({ userId: 1, timestamp: -1 });
db.auditLogs.createIndex({ action: 1, timestamp: -1 });
db.auditLogs.createIndex({ timestamp: -1 });
db.auditLogs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

---

## Integration Architecture

### Technology Stack

```javascript
// Backend Stack
{
  runtime: "Node.js 18+",
  framework: "Express.js",
  database: "MongoDB Atlas",
  odm: "Mongoose 7.x",
  authentication: "JWT + bcrypt",
  fileStorage: "AWS S3 / Cloudinary",
  emailService: "SendGrid / AWS SES",
  scheduler: "node-cron",
  validation: "Joi / express-validator",
  testing: "Jest + Supertest"
}

// Frontend (existing)
{
  html: "HTML5",
  css: "CSS3 (Custom + Bootstrap 5.3)",
  javascript: "ES6+",
  testing: "Playwright"
}
```

### Folder Structure

```
japanssw-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── environment.js       # Environment variables
│   │   └── constants.js         # App constants
│   ├── models/
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── RSO.js
│   │   ├── SavedJob.js
│   │   ├── Notification.js
│   │   ├── VisaGuidance.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── companyController.js
│   │   └── rsoController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── companies.js
│   │   └── rsos.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── rateLimit.js         # Rate limiting
│   ├── services/
│   │   ├── emailService.js
│   │   ├── fileService.js
│   │   ├── notificationService.js
│   │   └── searchService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── logger.js
│   │   └── validators.js
│   └── app.js                   # Express app setup
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Backend Implementation

### 1. Database Connection (`src/config/database.js`)

```javascript
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  try {
    const options = {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info("✅ MongoDB Atlas connected successfully");

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB Atlas");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("Mongoose connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error("❌ MongoDB Atlas connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
```

### 2. User Model Example (`src/models/User.js`)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "rso", "admin"],
      default: "jobseeker",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "pending", "deactivated"],
      default: "pending",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    preferences: {
      language: {
        type: String,
        enum: ["en", "ja"],
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      timezone: {
        type: String,
        default: "Asia/Tokyo",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
};

// Virtual for user profile
userSchema.virtual("profile", {
  ref: "UserProfile",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

module.exports = mongoose.model("User", userSchema);
```

### 3. Job Model Example (`src/models/Job.js`)

```javascript
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  jobInfo: {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    titleJa: String,
    jobCode: {
      type: String,
      unique: true,
      sparse: true
    },
    industry: {
      type: String,
      required: true,
      enum: [
        'Manufacturing',
        'Food and Beverage',
        'Building Cleaning Management',
        'Accommodation',
        'Agriculture',
        'Fishery',
        'Food Manufacturing',
        'Restaurant Industry',
        'Care Worker',
        'Shipbuilding',
        'Auto Repair',
        'Aviation',
        'Construction',
        'Machinery and Electrical'
      ]
    },
    category: String,
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
      default: 'Full-time'
    },
    contractDuration: {
      min: Number,
      max: Number
    }
  },
  description: {
    summary: { type: String, required: true },
    summaryJa: String,
    responsibilities: [String],
    responsibilitiesJa: [String]
  },
  requirements: {
    education: {
      type: String,
      enum: ['No requirement', 'High School', 'Associate', 'Bachelor', 'Master', 'PhD']
    },
    experience: {
      required: Boolean,
      minimumYears: Number,
      preferredYears: Number,
      fieldOfExperience: String
    },
    japaneseLevel: {
      minimum: {
        type: String,
        enum: ['N1', 'N2', 'N3', 'N4', 'N5', 'None']
      },
      preferred: String
    },
    skills: [String],
    certifications: [{
      name: String,
      required: Boolean,
      preferred: Boolean
    }],
    otherRequirements: [String]
  },
  compensation: {
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'JPY' },
      period: {
        type: String,
        enum: ['hourly', 'daily', 'monthly', 'yearly'],
        default: 'monthly'
      }
    },
    benefits: [String],
    trialPeriod: {
      duration: Number,
      salary: Number,
      terms: String
    }
  },
  location: {
    city: String,
    prefecture: { type: String, index: true },
    postalCode: String,
    country: { type: String, default: 'Japan' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' }
    },
    remote: { type: Boolean, default: false },
    relocationRequired: Boolean,
    relocationSupport: {
      provided: Boolean,
      details: String
    }
  },
  applicationInfo: {
    applicationDeadline: { type: Date, index: true },
    startDate: Date,
    positions: { type: Number, default: 1 },
    positionsFilled: { type: Number, default: 0 },
    requiredDocuments: [String],
    selectionProcess: [String]
  },
  visaInfo: {
    sponsorshipProvided: { type: Boolean, default: true },
    visaType: String,
    sswIndustry: String,
    registeredWithIMSA: Boolean,
    rsoSupport: {
      provided: Boolean,
      rsoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RSO'
      },
      services: [String]
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'filled'],
    default: 'draft',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  urgent: {
    type: Boolean,
    default: false
  },
  statistics: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    interviewed: { type: Number, default: 0 },
    offers: { type: Number, default: 0 }
  },
  seo: {
    slug: { type: String, unique: true, sparse: true },
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: Date,
  closedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ 'jobInfo.industry': 1 });
jobSchema.index({ 'location.prefecture': 1 });
jobSchema.index({ 'requirements.japaneseLevel.minimum': 1 });
jobSchema.index({ 'compensation.salary.min': 1 });
jobSchema.index({ status: 1, featured: 1, createdAt: -1 });
jobSchema.index({ location.coordinates: '2dsphere' });

// Text search index
jobSchema.index({
  'jobInfo.title': 'text',
  'description.summary': 'text',
  'description.responsibilities': 'text'
});

// Pre-save middleware to generate slug
jobSchema.pre('save', function(next) {
  if (this.isModified('jobInfo.title') && !this.seo.slug) {
    this.seo.slug = this.jobInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + this._id.toString().slice(-6);
  }
  next();
});

// Method to check if job is still open
jobSchema.methods.isOpen = function() {
  return this.status === 'active' &&
         this.applicationInfo.applicationDeadline > new Date() &&
         this.applicationInfo.positionsFilled < this.applicationInfo.positions;
};

// Virtual for remaining positions
jobSchema.virtual('remainingPositions').get(function() {
  return this.applicationInfo.positions - this.applicationInfo.positionsFilled;
});

// Populate company info
jobSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Job', jobSchema);
```

### 4. Express App Setup (`src/app.js`)

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDatabase = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const companyRoutes = require("./routes/companies");
const rsoRoutes = require("./routes/rsos");

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDatabase();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8000",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize data
app.use(mongoSanitize());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/rsos", rsoRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

module.exports = app;
```

### 5. Environment Variables (`.env.example`)

```bash
# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanssw_db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@japanssw.com
FROM_NAME=Japan SSW Platform

# File Storage (AWS S3 or Cloudinary)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=japanssw-uploads

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+15551234567

# Google Maps API (for location services)
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret-key

# Application Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

---

## Security & Best Practices

### 1. Authentication & Authorization

```javascript
// JWT Authentication Middleware
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-passwordHash");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
```

### 2. Data Validation

```javascript
const Joi = require("joi");

// User registration validation
exports.validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid("jobseeker", "employer", "rso")
      .default("jobseeker"),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

// Job creation validation
exports.validateJobCreation = (req, res, next) => {
  const schema = Joi.object({
    jobInfo: Joi.object({
      title: Joi.string().required(),
      industry: Joi.string().required(),
      employmentType: Joi.string().valid(
        "Full-time",
        "Part-time",
        "Contract",
        "Temporary",
      ),
    }).required(),
    compensation: Joi.object({
      salary: Joi.object({
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref("min")).required(),
      }).required(),
    }).required(),
    location: Joi.object({
      prefecture: Joi.string().required(),
      city: Joi.string().required(),
    }).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
```

### 3. Error Handling

```javascript
// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

### 4. Password Hashing Best Practices

- Use bcrypt with salt rounds of 10-12
- Never store plain text passwords
- Implement password reset with time-limited tokens
- Enforce strong password policies (min 8 chars, mix of upper/lower/numbers/symbols)

### 5. Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement GDPR-compliant data handling
- Regular backups with encryption
- Implement data retention policies

---

## Migration Strategy

### Phase 1: Setup & Configuration (Week 1)

1. **MongoDB Atlas Setup**
   - Create account and cluster
   - Configure network access
   - Set up database users
   - Create test database

2. **Backend Initialization**
   - Initialize Node.js project
   - Install dependencies
   - Configure environment variables
   - Set up folder structure

3. **Database Connection**
   - Implement connection module
   - Test connection
   - Set up connection pooling
   - Configure error handling

### Phase 2: Core Models Implementation (Week 2-3)

1. **User Management**
   - Implement User model
   - Create authentication routes
   - Implement JWT authentication
   - Test user registration/login

2. **Profile Management**
   - Implement UserProfile model
   - Create profile CRUD operations
   - Implement file upload for documents
   - Test profile operations

3. **Company & Jobs**
   - Implement Company model
   - Implement Job model
   - Create company/job CRUD operations
   - Test company and job listings

### Phase 3: Application Flow (Week 4)

1. **Application System**
   - Implement Application model
   - Create application submission flow
   - Implement status tracking
   - Create notification system

2. **RSO Integration**
   - Implement RSO model
   - Create RSO directory
   - Link RSOs with companies/jobs
   - Test RSO services

### Phase 4: Frontend Integration (Week 5-6)

1. **API Integration**
   - Update frontend to use API endpoints
   - Implement authentication flow
   - Replace localStorage with API calls
   - Test all user flows

2. **Data Migration**
   - Export existing mock data
   - Transform to MongoDB format
   - Import to MongoDB Atlas
   - Verify data integrity

### Phase 5: Testing & Optimization (Week 7-8)

1. **Testing**
   - Unit tests for models
   - Integration tests for APIs
   - End-to-end testing
   - Performance testing

2. **Optimization**
   - Implement caching (Redis)
   - Optimize database queries
   - Add monitoring (MongoDB Atlas monitoring)
   - Load testing

### Phase 6: Deployment (Week 9)

1. **Production Setup**
   - Set up production MongoDB cluster
   - Configure production environment
   - Set up CI/CD pipeline
   - Deploy backend API

2. **Monitoring & Maintenance**
   - Set up logging (Winston/Morgan)
   - Configure alerts
   - Implement backup strategy
   - Documentation

---

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/logout            # Logout user
GET    /api/v1/auth/me                # Get current user
PUT    /api/v1/auth/update-details    # Update user details
PUT    /api/v1/auth/update-password   # Update password
POST   /api/v1/auth/forgot-password   # Forgot password
PUT    /api/v1/auth/reset-password    # Reset password
POST   /api/v1/auth/verify-email      # Verify email
```

### Users & Profiles

```
GET    /api/v1/users                  # Get all users (admin)
GET    /api/v1/users/:id              # Get single user
PUT    /api/v1/users/:id              # Update user
DELETE /api/v1/users/:id              # Delete user

GET    /api/v1/profiles/me            # Get own profile
PUT    /api/v1/profiles/me            # Update own profile
GET    /api/v1/profiles/:userId       # Get user profile (public view)
POST   /api/v1/profiles/documents     # Upload document
DELETE /api/v1/profiles/documents/:id # Delete document
```

### Jobs

```
GET    /api/v1/jobs                   # Get all jobs (with filters)
POST   /api/v1/jobs                   # Create job (employer)
GET    /api/v1/jobs/:id               # Get single job
PUT    /api/v1/jobs/:id               # Update job (employer)
DELETE /api/v1/jobs/:id               # Delete job (employer)
GET    /api/v1/jobs/search            # Search jobs
GET    /api/v1/jobs/featured          # Get featured jobs
GET    /api/v1/jobs/company/:id       # Get jobs by company
```

### Applications

```
GET    /api/v1/applications           # Get all applications
POST   /api/v1/applications           # Submit application
GET    /api/v1/applications/:id       # Get single application
PUT    /api/v1/applications/:id       # Update application status (employer)
DELETE /api/v1/applications/:id       # Withdraw application
GET    /api/v1/applications/me        # Get my applications
GET    /api/v1/applications/job/:id   # Get applications for job (employer)
```

### Companies

```
GET    /api/v1/companies              # Get all companies
POST   /api/v1/companies              # Create company profile
GET    /api/v1/companies/:id          # Get single company
PUT    /api/v1/companies/:id          # Update company
DELETE /api/v1/companies/:id          # Delete company
GET    /api/v1/companies/me           # Get own company profile
```

### RSOs

```
GET    /api/v1/rsos                   # Get all RSOs
POST   /api/v1/rsos                   # Create RSO profile
GET    /api/v1/rsos/:id               # Get single RSO
PUT    /api/v1/rsos/:id               # Update RSO
DELETE /api/v1/rsos/:id               # Delete RSO
GET    /api/v1/rsos/search            # Search RSOs
POST   /api/v1/rsos/:id/reviews       # Add review
```

### Saved Jobs

```
GET    /api/v1/saved-jobs             # Get saved jobs
POST   /api/v1/saved-jobs             # Save job
DELETE /api/v1/saved-jobs/:id         # Remove saved job
```

### Notifications

```
GET    /api/v1/notifications          # Get all notifications
PUT    /api/v1/notifications/:id/read # Mark as read
PUT    /api/v1/notifications/read-all # Mark all as read
DELETE /api/v1/notifications/:id      # Delete notification
```

### Visa Guidance

```
GET    /api/v1/visa-guidance          # Get all guidance articles
GET    /api/v1/visa-guidance/:slug    # Get single article
GET    /api/v1/visa-guidance/search   # Search articles
POST   /api/v1/visa-guidance/:id/helpful # Mark as helpful
```

---

## Next Steps

1. **Set up MongoDB Atlas account** and create cluster
2. **Initialize backend project** with Node.js and Express
3. **Implement authentication system** (register/login)
4. **Create core models** (User, UserProfile, Job, Company)
5. **Build API endpoints** for CRUD operations
6. **Integrate frontend** with backend API
7. **Test thoroughly** before production deployment
8. **Deploy** and monitor

---

## Additional Resources

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Support & Maintenance

For questions or issues regarding MongoDB Atlas integration:

1. Check MongoDB Atlas documentation
2. Review application logs
3. Contact development team
4. Submit issue on project repository

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2026  
**Next Review:** March 22, 2026
