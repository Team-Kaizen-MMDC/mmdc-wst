Node.js REST API with MongoDB Atlas - Complete CRUD Implementation Guide
Overview
This guide provides a step-by-step implementation of a production-ready Node.js REST API with full CRUD (Create, Read, Update, Delete) operations using MongoDB Atlas as the database backend for the Japan SSW platform.

Table of Contents
Prerequisites
Project Setup
Project Structure
Installation & Configuration
MongoDB Connection Setup
Mongoose Models
REST API Controllers
Express Routes
Middleware Implementation
Error Handling
Testing the API
Deployment
Best Practices
Prerequisites
Required Software

- Node.js: v18.x or higher
- npm: v9.x or higher
- MongoDB Atlas account (free tier available)
- Postman or similar API testing tool
- Git
- Code editor (VS Code recommended)
Required Knowledge
JavaScript ES6+
Asynchronous programming (Promises, async/await)
HTTP methods (GET, POST, PUT, DELETE)
RESTful API principles
Basic MongoDB concepts
Project Setup
Step 1: Initialize Project

# Create project directory

mkdir japanssw-backend
cd japanssw-backend

# Initialize Node.js project

npm init -y

# Initialize Git repository

git init
Step 2: Install Dependencies

# Core dependencies

npm install express mongoose dotenv cors helmet morgan

# Development dependencies

npm install --save-dev nodemon

# Security dependencies

npm install bcryptjs jsonwebtoken express-validator express-rate-limit express-mongo-sanitize

# Utility dependencies

npm install winston multer uuid

# Testing dependencies (optional)

npm install --save-dev jest supertest
Package Descriptions
Package Purpose
express Web framework for Node.js
mongoose MongoDB ODM (Object Data Modeling)
dotenv Environment variable management
cors Cross-Origin Resource Sharing
helmet Security headers
morgan HTTP request logger
bcryptjs Password hashing
jsonwebtoken JWT authentication
express-validator Request validation
express-rate-limit API rate limiting
express-mongo-sanitize NoSQL injection prevention
winston Logging library
multer File upload handling
nodemon Auto-restart during development
Project Structure
japanssw-backend/
├── src/
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   ├── constants.js          # App constants
│   │   └── environment.js        # Environment config
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User CRUD operations
│   │   ├── profileController.js  # Profile CRUD operations
│   │   ├── jobController.js      # Job CRUD operations
│   │   ├── applicationController.js
│   │   ├── companyController.js
│   │   └── rsoController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── RSO.js
│   ├── routes/
│   │   ├── index.js              # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── companyRoutes.js
│   │   └── rsoRoutes.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── validate.js           # Request validation
│   │   ├── errorHandler.js       # Error handling
│   │   ├── asyncHandler.js       # Async wrapper
│   │   └── upload.js             # File upload
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── ApiError.js           # Custom error class
│   │   ├── ApiResponse.js        # Response formatter
│   │   └── helpers.js            # Helper functions
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── jobValidator.js
│   │   └── applicationValidator.js
│   └── app.js                    # Express app setup
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js                     # Entry point
Installation & Configuration

1. Create .gitignore

# .gitignore

node_modules/
.env
.env.local
.DS_Store
logs/
uploads/
*.log
coverage/
.vscode/
.idea/
dist/
build/
2. Update package.json Scripts
{
  "name": "japanssw-backend",
  "version": "1.0.0",
  "description": "REST API for Japan SSW Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "format": "prettier --write \"**/*.js\""
  },
  "keywords": ["rest-api", "nodejs", "mongodb", "express"],
  "author": "Team Kaizen MMDC",
  "license": "ISC"
}
3. Create .env.example

# .env.example

NODE_ENV=development
PORT=5000

# MongoDB Atlas

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanssw_db?retryWrites=true&w=majority

# JWT

JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Client URL

CLIENT_URL=<http://localhost:8000>

# Rate Limiting

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (SendGrid)

SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=<noreply@japanssw.com>
FROM_NAME=Japan SSW Platform

# Logging

LOG_LEVEL=info
LOG_FILE=logs/app.log
MongoDB Connection Setup
src/config/database.js
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`Mongoose connection error: ${err}`);
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

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;
src/config/constants.js
module.exports = {
  // User Roles
  ROLES: {
    JOBSEEKER: "jobseeker",
    EMPLOYER: "employer",
    RSO: "rso",
    ADMIN: "admin",
  },

  // Account Status
  ACCOUNT_STATUS: {
    ACTIVE: "active",
    SUSPENDED: "suspended",
    PENDING: "pending",
    DEACTIVATED: "deactivated",
  },

  // Job Status
  JOB_STATUS: {
    DRAFT: "draft",
    ACTIVE: "active",
    PAUSED: "paused",
    CLOSED: "closed",
    FILLED: "filled",
  },

  // Application Status
  APPLICATION_STATUS: {
    APPLIED: "applied",
    UNDER_REVIEW: "under_review",
    SHORTLISTED: "shortlisted",
    INTERVIEW_SCHEDULED: "interview_scheduled",
    INTERVIEWED: "interviewed",
    OFFER_EXTENDED: "offer_extended",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    WITHDRAWN: "withdrawn",
  },

  // SSW Industries
  SSW_INDUSTRIES: [
    "Manufacturing",
    "Food and Beverage",
    "Building Cleaning Management",
    "Accommodation",
    "Agriculture",
    "Fishery",
    "Food Manufacturing",
    "Restaurant Industry",
    "Care Worker",
    "Shipbuilding",
    "Auto Repair",
    "Aviation",
    "Construction",
    "Machinery and Electrical",
  ],

  // JLPT Levels
  JLPT_LEVELS: ["N1", "N2", "N3", "N4", "N5", "None"],

  // File Types
  ALLOWED_FILE_TYPES: {
    DOCUMENTS: ["pdf", "doc", "docx"],
    IMAGES: ["jpg", "jpeg", "png", "webp"],
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
Mongoose Models
src/models/User.js (Complete CRUD Model)
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ROLES, ACCOUNT_STATUS } = require("../config/constants");

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
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.JOBSEEKER,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user profile
userSchema.virtual("profile", {
  ref: "UserProfile",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  const lockAccount = this.loginAttempts + 1 >= 5 && !this.isLocked();
  if (lockAccount) {
    updates.$set = { lockUntil: Date.now() + 2 *60* 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new Error("Account is temporarily locked. Please try again later.");
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
src/models/Job.js (Complete CRUD Model)
const mongoose = require("mongoose");
const {
  SSW_INDUSTRIES,
  JOB_STATUS,
  JLPT_LEVELS,
} = require("../config/constants");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },
    jobInfo: {
      title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
        maxlength: [200, "Job title cannot exceed 200 characters"],
      },
      titleJa: {
        type: String,
        trim: true,
      },
      jobCode: {
        type: String,
        unique: true,
        sparse: true,
      },
      industry: {
        type: String,
        required: [true, "Industry is required"],
        enum: SSW_INDUSTRIES,
      },
      category: String,
      employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Temporary"],
        default: "Full-time",
      },
    },
    description: {
      summary: {
        type: String,
        required: [true, "Job summary is required"],
        maxlength: [2000, "Summary cannot exceed 2000 characters"],
      },
      summaryJa: String,
      responsibilities: [String],
      responsibilitiesJa: [String],
    },
    requirements: {
      education: {
        type: String,
        enum: [
          "No requirement",
          "High School",
          "Associate",
          "Bachelor",
          "Master",
          "PhD",
        ],
      },
      experience: {
        required: Boolean,
        minimumYears: Number,
        preferredYears: Number,
        fieldOfExperience: String,
      },
      japaneseLevel: {
        minimum: {
          type: String,
          enum: JLPT_LEVELS,
        },
        preferred: {
          type: String,
          enum: JLPT_LEVELS,
        },
      },
      skills: [String],
      otherRequirements: [String],
    },
    compensation: {
      salary: {
        min: {
          type: Number,
          required: [true, "Minimum salary is required"],
          min: [0, "Salary cannot be negative"],
        },
        max: {
          type: Number,
          required: [true, "Maximum salary is required"],
          min: [0, "Salary cannot be negative"],
        },
        currency: {
          type: String,
          default: "JPY",
        },
        period: {
          type: String,
          enum: ["hourly", "daily", "monthly", "yearly"],
          default: "monthly",
        },
      },
      benefits: [String],
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
      },
      prefecture: {
        type: String,
        required: [true, "Prefecture is required"],
        index: true,
      },
      postalCode: String,
      country: {
        type: String,
        default: "Japan",
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          index: "2dsphere",
        },
      },
      remote: {
        type: Boolean,
        default: false,
      },
    },
    applicationInfo: {
      applicationDeadline: {
        type: Date,
        required: [true, "Application deadline is required"],
        index: true,
      },
      startDate: Date,
      positions: {
        type: Number,
        default: 1,
        min: [1, "At least 1 position must be available"],
      },
      positionsFilled: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    visaInfo: {
      sponsorshipProvided: {
        type: Boolean,
        default: true,
      },
      visaType: String,
      sswIndustry: String,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.DRAFT,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    statistics: {
      views: {
        type: Number,
        default: 0,
      },
      applications: {
        type: Number,
        default: 0,
      },
      shortlisted: {
        type: Number,
        default: 0,
      },
    },
    seo: {
      slug: {
        type: String,
        unique: true,
        sparse: true,
      },
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedAt: Date,
    closedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
jobSchema.index({ "jobInfo.industry": 1 });
jobSchema.index({ "location.prefecture": 1 });
jobSchema.index({ "requirements.japaneseLevel.minimum": 1 });
jobSchema.index({ "compensation.salary.min": 1 });
jobSchema.index({ status: 1, featured: 1, createdAt: -1 });
jobSchema.index({ "applicationInfo.applicationDeadline": 1 });

// Text search index
jobSchema.index({
  "jobInfo.title": "text",
  "description.summary": "text",
  "description.responsibilities": "text",
});

// Custom validation: max salary must be greater than min salary
jobSchema.path("compensation.salary.max").validate(function (value) {
  return value >= this.compensation.salary.min;
}, "Maximum salary must be greater than or equal to minimum salary");

// Custom validation: positions filled cannot exceed total positions
jobSchema.path("applicationInfo.positionsFilled").validate(function (value) {
  return value <= this.applicationInfo.positions;
}, "Positions filled cannot exceed total positions");

// Pre-save middleware to generate slug
jobSchema.pre("save", function (next) {
  if (this.isModified("jobInfo.title") && !this.seo.slug) {
    this.seo.slug =
      this.jobInfo.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      this._id.toString().slice(-6);
  }
  next();
});

// Pre-save middleware to set published date
jobSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === JOB_STATUS.ACTIVE &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to check if job is still open
jobSchema.methods.isOpen = function () {
  return (
    this.status === JOB_STATUS.ACTIVE &&
    this.applicationInfo.applicationDeadline > new Date() &&
    this.applicationInfo.positionsFilled < this.applicationInfo.positions
  );
};

// Method to increment views
jobSchema.methods.incrementViews = function () {
  this.statistics.views += 1;
  return this.save();
};

// Method to increment applications
jobSchema.methods.incrementApplications = function () {
  this.statistics.applications += 1;
  return this.save();
};

// Virtual for remaining positions
jobSchema.virtual("remainingPositions").get(function () {
  return this.applicationInfo.positions - this.applicationInfo.positionsFilled;
});

// Virtual for company details
jobSchema.virtual("company", {
  ref: "Company",
  localField: "companyId",
  foreignField: "_id",
  justOne: true,
});

// Static method to find active jobs
jobSchema.statics.findActiveJobs = function (filters = {}) {
  return this.find({
    status: JOB_STATUS.ACTIVE,
    "applicationInfo.applicationDeadline": { $gt: new Date() },
    ...filters,
  }).sort({ featured: -1, createdAt: -1 });
};

module.exports = mongoose.model("Job", jobSchema);
REST API Controllers
src/controllers/userController.js (Complete CRUD)
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../middleware/asyncHandler");

/**

- @desc    Get all users (Admin only)
- @route   GET /api/v1/users
- @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1)* limit;

  // Build query
  const queryObj = { ...req.query };
  const excludeFields = ["page", "limit", "sort", "fields"];
  excludeFields.forEach((field) => delete queryObj[field]);

  // Filter by role
  if (req.query.role) {
    queryObj.role = req.query.role;
  }

  // Filter by status
  if (req.query.accountStatus) {
    queryObj.accountStatus = req.query.accountStatus;
  }

  // Execute query
  const users = await User.find(queryObj)
    .select("-password")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await User.countDocuments(queryObj);

  res.status(200).json(
    new ApiResponse(200, "Users retrieved successfully", {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }),
  );
});

/**

- @desc    Get single user by ID
- @route   GET /api/v1/users/:id
- @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("profile");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", { user }));
});

/**

- @desc    Get current user
- @route   GET /api/v1/users/me
- @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("profile");

  res
    .status(200)
    .json(
      new ApiResponse(200, "Current user retrieved successfully", { user }),
    );
});

/**

- @desc    Update user
- @route   PUT /api/v1/users/:id
- @access  Private/Admin or Owner
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Check if user is updating their own profile or is admin
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return next(
      new ApiError(403, "You are not authorized to update this user"),
    );
  }

  // Fields that can be updated
  const allowedUpdates = ["email", "preferences"];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Don't allow password update through this endpoint
  if (req.body.password) {
    return next(
      new ApiError(400, "Use /api/v1/auth/update-password to update password"),
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", { user }));
});

/**

- @desc    Delete user
- @route   DELETE /api/v1/users/:id
- @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Prevent deleting admin users
  if (user.role === "admin") {
    return next(new ApiError(403, "Cannot delete admin users"));
  }

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, "User deleted successfully", null));
});

/**

- @desc    Update user status
- @route   PUT /api/v1/users/:id/status
- @access  Private/Admin
 */
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { accountStatus } = req.body;

  if (!accountStatus) {
    return next(new ApiError(400, "Please provide account status"));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { accountStatus },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User status updated successfully", { user }));
});
src/controllers/jobController.js (Complete CRUD)
const Job = require("../models/Job");
const Company = require("../models/Company");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../middleware/asyncHandler");

/**

- @desc    Get all jobs with filters
- @route   GET /api/v1/jobs
- @access  Public
 */
exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1)* limit;

  // Build query
  const query = { status: "active" };

  // Filter by industry
  if (req.query.industry) {
    query["jobInfo.industry"] = req.query.industry;
  }

  // Filter by prefecture
  if (req.query.prefecture) {
    query["location.prefecture"] = req.query.prefecture;
  }

  // Filter by Japanese level
  if (req.query.japaneseLevel) {
    query["requirements.japaneseLevel.minimum"] = req.query.japaneseLevel;
  }

  // Filter by employment type
  if (req.query.employmentType) {
    query["jobInfo.employmentType"] = req.query.employmentType;
  }

  // Salary range filter
  if (req.query.minSalary) {
    query["compensation.salary.min"] = {
      $gte: parseInt(req.query.minSalary, 10),
    };
  }

  if (req.query.maxSalary) {
    query["compensation.salary.max"] = {
      $lte: parseInt(req.query.maxSalary, 10),
    };
  }

  // Featured jobs only
  if (req.query.featured === "true") {
    query.featured = true;
  }

  // Visa sponsorship
  if (req.query.visaSponsorship === "true") {
    query["visaInfo.sponsorshipProvided"] = true;
  }

  // Text search
  let jobsQuery = Job.find(query);

  if (req.query.search) {
    jobsQuery = Job.find({
      ...query,
      $text: { $search: req.query.search },
    });
  }

  // Sorting
  let sortBy = "-createdAt";
  if (req.query.sort === "salary-asc") {
    sortBy = "compensation.salary.min";
  } else if (req.query.sort === "salary-desc") {
    sortBy = "-compensation.salary.min";
  } else if (req.query.sort === "deadline") {
    sortBy = "applicationInfo.applicationDeadline";
  }

  // Execute query
  const jobs = await jobsQuery
    .populate(
      "companyId",
      "companyInfo.companyName contactInfo.headquarters media",
    )
    .limit(limit)
    .skip(skip)
    .sort(sortBy);

  // Get total count
  const total = await Job.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Jobs retrieved successfully", {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }),
  );
});

/**

- @desc    Get single job by ID
- @route   GET /api/v1/jobs/:id
- @access  Public
 */
exports.getJobById = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate("companyId")
    .populate("createdBy", "email role");

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Increment view count
  await job.incrementViews();

  res
    .status(200)
    .json(new ApiResponse(200, "Job retrieved successfully", { job }));
});

/**

- @desc    Get job by slug
- @route   GET /api/v1/jobs/slug/:slug
- @access  Public
 */
exports.getJobBySlug = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ "seo.slug": req.params.slug })
    .populate("companyId")
    .populate("createdBy", "email role");

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Increment view count
  await job.incrementViews();

  res
    .status(200)
    .json(new ApiResponse(200, "Job retrieved successfully", { job }));
});

/**

- @desc    Create new job
- @route   POST /api/v1/jobs
- @access  Private/Employer
 */
exports.createJob = asyncHandler(async (req, res, next) => {
  // Check if user is employer
  if (req.user.role !== "employer" && req.user.role !== "admin") {
    return next(new ApiError(403, "Only employers can create jobs"));
  }

  // Get company associated with user
  const company = await Company.findOne({ userId: req.user.id });

  if (!company) {
    return next(new ApiError(404, "Please create a company profile first"));
  }

  // Add company ID and creator to request body
  req.body.companyId = company._id;
  req.body.createdBy = req.user.id;

  // Generate job code if not provided
  if (!req.body.jobCode) {
    const count = await Job.countDocuments({ companyId: company._id });
    req.body.jobCode = `${company.companyInfo.companyName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
  }

  const job = await Job.create(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, "Job created successfully", { job }));
});

/**

- @desc    Update job
- @route   PUT /api/v1/jobs/:id
- @access  Private/Employer/Owner
 */
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check ownership
  if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "You are not authorized to update this job"));
  }

  // Don't allow updating certain fields
  delete req.body.companyId;
  delete req.body.createdBy;
  delete req.body.statistics;

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", { job }));
});

/**

- @desc    Delete job
- @route   DELETE /api/v1/jobs/:id
- @access  Private/Employer/Owner
 */
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check ownership
  if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "You are not authorized to delete this job"));
  }

  await job.deleteOne();

  res.status(200).json(new ApiResponse(200, "Job deleted successfully", null));
});

/**

- @desc    Update job status
- @route   PUT /api/v1/jobs/:id/status
- @access  Private/Employer/Owner
 */
exports.updateJobStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ApiError(400, "Please provide status"));
  }

  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check ownership
  if (job.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "You are not authorized to update this job"));
  }

  job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Job status updated successfully", { job }));
});

/**

- @desc    Get jobs by company
- @route   GET /api/v1/jobs/company/:companyId
- @access  Public
 */
exports.getJobsByCompany = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1)* limit;

  const jobs = await Job.find({
    companyId: req.params.companyId,
    status: "active",
  })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments({
    companyId: req.params.companyId,
    status: "active",
  });

  res.status(200).json(
    new ApiResponse(200, "Company jobs retrieved successfully", {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }),
  );
});
Express Routes
src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes - require authentication
router.use(protect);

// Current user route
router.get("/me", getCurrentUser);

// Admin only routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id/status", authorize("admin"), updateUserStatus);
router.delete("/:id", authorize("admin"), deleteUser);

// User can update their own profile
router.put("/:id", updateUser);

module.exports = router;
src/routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  getJobBySlug,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobsByCompany,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateJobCreation,
  validateJobUpdate,
} = require("../validators/jobValidator");

// Public routes
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/slug/:slug", getJobBySlug);
router.get("/company/:companyId", getJobsByCompany);

// Protected routes - require authentication
router.use(protect);

// Employer/Admin routes
router.post(
  "/",
  authorize("employer", "admin"),
  validateJobCreation,
  createJob,
);
router.put(
  "/:id",
  authorize("employer", "admin"),
  validateJobUpdate,
  updateJob,
);
router.delete("/:id", authorize("employer", "admin"), deleteJob);
router.put("/:id/status", authorize("employer", "admin"), updateJobStatus);

module.exports = router;
src/routes/index.js (Route Aggregator)
const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const jobRoutes = require("./jobRoutes");
const applicationRoutes = require("./applicationRoutes");
const companyRoutes = require("./companyRoutes");
const rsoRoutes = require("./rsoRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/companies", companyRoutes);
router.use("/rsos", rsoRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
Middleware Implementation
src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("./asyncHandler");

/**

- Protect routes - Verify JWT token
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split[" "](1);
  }
  // Check for token in cookies (optional)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ApiError(401, "User not found"));
    }

    // Check if account is active
    if (req.user.accountStatus !== "active") {
      return next(new ApiError(403, "Your account is not active"));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }
});

/**

- Grant access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user.role}' is not authorized to access this route`,
        ),
      );
    }
    next();
  };
};
src/middleware/asyncHandler.js
/**
- Async handler to wrap async functions and catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
src/middleware/errorHandler.js
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`, {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys[err.keyValue](0);
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again";
    error = new ApiError(401, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again";
    error = new ApiError(401, message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
Utility Classes
src/utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
src/utils/ApiResponse.js
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    if (data) {
      this.data = data;
    }
    this.timestamp = new Date().toISOString();
  }
}

module.exports = ApiResponse;
src/utils/logger.js
const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "japanssw-api" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

// If we're not in production, log to console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
Main Application Files
src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "<http://localhost:8000>",
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize data - prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 *60* 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: "Too many requests from this IP, please try again later",
});

app.use("/api/", limiter);

// HTTP request logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
}

// Mount API routes
app.use("/api/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
server.js (Entry Point)
require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const logger = require("./src/utils/logger");

// Connect to MongoDB
connectDatabase();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
  logger.info(`📍 API URL: http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
Testing the API
Using cURL

# Health Check

curl <http://localhost:5000/api/v1/health>

# Register User

curl -X POST <http://localhost:5000/api/v1/auth/register> \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<test@example.com>",
    "password": "password123",
    "role": "jobseeker"
  }'

# Login

curl -X POST <http://localhost:5000/api/v1/auth/login> \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<test@example.com>",
    "password": "password123"
  }'

# Get All Jobs (with token)

curl <http://localhost:5000/api/v1/jobs> \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create Job (Employer)

curl -X POST <http://localhost:5000/api/v1/jobs> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobInfo": {
      "title": "Software Engineer",
      "industry": "Manufacturing"
    },
    "description": {
      "summary": "We are looking for..."
    },
    "compensation": {
      "salary": {
        "min": 250000,
        "max": 350000
      }
    },
    "location": {
      "city": "Tokyo",
      "prefecture": "Tokyo"
    },
    "applicationInfo": {
      "applicationDeadline": "2026-12-31"
    }
  }'
Using Postman
Import Collection

Create a new collection: "Japan SSW API"
Add environment variables: BASE_URL, JWT_TOKEN
Test Authentication

POST /api/v1/auth/register - Register new user
POST /api/v1/auth/login - Login and save token
Test CRUD Operations

GET /api/v1/jobs - List all jobs
GET /api/v1/jobs/:id - Get specific job
POST /api/v1/jobs - Create new job
PUT /api/v1/jobs/:id - Update job
DELETE /api/v1/jobs/:id - Delete job
Deployment
Deploy to Heroku

# Install Heroku CLI

brew install heroku/brew/heroku

# Login to Heroku

heroku login

# Create Heroku app

heroku create japanssw-api

# Set environment variables

heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy

git push heroku main

# View logs

heroku logs --tail
Deploy to AWS EC2

# SSH into EC2 instance

ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js

curl -fsSL <https://deb.nodesource.com/setup_18.x> | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository

git clone <https://github.com/your-repo/japanssw-backend.git>
cd japanssw-backend

# Install dependencies

npm install --production

# Install PM2

sudo npm install -g pm2

# Start application

pm2 start server.js --name japanssw-api

# Setup PM2 startup script

pm2 startup
pm2 save

# Install and configure Nginx

sudo apt install nginx
sudo nano /etc/nginx/sites-available/japanssw-api
Best Practices

1. Security
✅ Use HTTPS in production
✅ Implement rate limiting
✅ Sanitize user input
✅ Use helmet for security headers
✅ Hash passwords with bcrypt
✅ Implement JWT with expiration
✅ Validate all inputs
✅ Use environment variables for secrets
2. Performance
✅ Use database indexing
✅ Implement pagination
✅ Use connection pooling
✅ Cache frequently accessed data
✅ Optimize database queries
✅ Use compression middleware
3. Code Quality
✅ Follow RESTful conventions
✅ Use async/await consistently
✅ Handle errors properly
✅ Write descriptive comments
✅ Use consistent naming
✅ Implement logging
4. Maintenance
✅ Monitor application performance
✅ Set up automated backups
✅ Document API endpoints
✅ Write tests
✅ Use version control
✅ Keep dependencies updated
Next Steps
✅ Set up MongoDB Atlas
✅ Initialize project and install dependencies
✅ Create basic models and controllers
✅ Implement authentication
✅ Test all CRUD operations
✅ Add validation and error handling
✅ Deploy to production
✅ Monitor and optimize
Resources
Express.js Documentation
Mongoose Documentation
MongoDB Atlas Documentation
JWT Documentation
RESTful API Design
Document Version: 1.0
Last Updated: January 22, 2026
Author: Team Kaizen MMDC
