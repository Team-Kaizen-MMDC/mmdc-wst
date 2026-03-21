# Node.js REST API with MongoDB Atlas — Complete CRUD Implementation Guide

## Overview

This guide provides a step-by-step implementation of a production-ready Node.js REST API with full CRUD (Create, Read, Update, Delete) operations using MongoDB Atlas as the database backend for the Japan SSW platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Project Structure](#project-structure)
- [Installation & Configuration](#installation--configuration)
- [MongoDB Connection Setup](#mongodb-connection-setup)
- [Mongoose Models](#mongoose-models)
- [REST API Controllers](#rest-api-controllers)
- [Authentication Examples — Password Hashing](#authentication-examples--password-hashing)
- [Express Routes](#express-routes)
- [Middleware Implementation](#middleware-implementation)
- [Main Application Files](#main-application-files)
- [Testing the API](#testing-the-api)
- [Using Postman](#using-postman)
- [Deployment](#deployment)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)
- [Resources](#resources)

## Prerequisites

### Required Software

- Node.js: v18.x or higher
- npm: v9.x or higher
- MongoDB Atlas account (free tier available)
- Postman or similar API testing tool
- Git
- Code editor (VS Code recommended)

### Required Knowledge

- JavaScript ES6+
- Asynchronous programming (Promises, async/await)
- HTTP methods (GET, POST, PUT, DELETE)
- RESTful API principles
- Basic MongoDB concepts

## Project Setup

### Step 1: Initialize Project

```bash
# Create project directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Initialize Git repository
git init
```

### Step 2: Install Dependencies

```bash
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
```

### Package Descriptions

| Package                | Purpose                            |
| ---------------------- | ---------------------------------- |
| express                | Web framework for Node.js          |
| mongoose               | MongoDB ODM (Object Data Modeling) |
| dotenv                 | Environment variable management    |
| cors                   | Cross-Origin Resource Sharing      |
| helmet                 | Security headers                   |
| morgan                 | HTTP request logger                |
| bcryptjs               | Password hashing                   |
| jsonwebtoken           | JWT authentication                 |
| express-validator      | Request validation                 |
| express-rate-limit     | API rate limiting                  |
| express-mongo-sanitize | NoSQL injection prevention         |
| winston                | Logging library                    |
| multer                 | File upload handling               |
| nodemon                | Auto-restart during development    |

## Project Structure

````text
backend/
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
```bash
# Health Check
curl http://localhost:3000/api/v1/health

# Register User
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get All Jobs (with token)
curl http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create Job (Employer)
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobInfo": {
      "title": "Software Engineer",
      "industry": "Manufacturing"
    },
    "description": {
      "summary": "We are looking for..."}
  }'
````

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

````

1. Create `.env.example`

Use the repo's canonical backend template at `backend/.env.example` and copy it to `.env` before running locally. The example below mirrors the canonical template.

```env
# Node / server
NODE_ENV=development
PORT=3000

# MongoDB Atlas (preferred: full SRV URI)
MONGODB_URI=

# Or provide components instead of full URI
MONGODB_USER=
MONGODB_PASS=
MONGODB_HOST=
MONGODB_DB=japanssw_db

# Collections
CONTENT_COLLECTION=contents
ABOUT_COLLECTION=about

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (SendGrid)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@japanssw.com
FROM_NAME="Japan SSW Platform"

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
````

## MongoDB Connection Setup

File: `src/config/database.js`

```js
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

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB Atlas");
    });

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
```

## Mongoose Models

File examples (add these under `src/models/`): label as `js` in code blocks.

### `src/models/User.js`

```js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin", "rso"],
      default: "jobseeker",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
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
userSchema.index({ isActive: 1 });

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function () {
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

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const needsLock = this.loginAttempts + 1 >= 5 && !this.isLocked;

  if (needsLock) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
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

module.exports = mongoose.model("User", userSchema);
```

### `src/models/Job.js`

```js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by user is required"],
    },
    jobInfo: {
      title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
        maxlength: [200, "Job title cannot exceed 200 characters"],
      },
      industry: {
        type: String,
        required: [true, "Industry is required"],
        enum: [
          "Manufacturing",
          "Construction",
          "Agriculture",
          "Nursing Care",
          "Building Cleaning",
          "Material Processing",
          "Industrial Machinery",
          "Electric and Electronics",
          "Shipbuilding",
          "Auto Repair",
          "Aviation",
          "Accommodation",
          "Food Service",
          "Foodstuff and Beverage",
        ],
      },
      category: {
        type: String,
        enum: ["full-time", "part-time", "contract", "ssw1", "ssw2"],
        default: "ssw1",
      },
    },
    description: {
      summary: {
        type: String,
        required: [true, "Job summary is required"],
        minlength: [50, "Summary must be at least 50 characters"],
        maxlength: [2000, "Summary cannot exceed 2000 characters"],
      },
      responsibilities: [String],
      requirements: [String],
      benefits: [String],
    },
    requirements: {
      education: {
        type: String,
        enum: [
          "high-school",
          "vocational",
          "bachelors",
          "masters",
          "phd",
          "any",
        ],
        default: "any",
      },
      japaneseLevel: {
        type: String,
        enum: ["N5", "N4", "N3", "N2", "N1", "native", "any"],
        default: "N4",
      },
      experience: {
        required: {
          type: Boolean,
          default: false,
        },
        years: {
          type: Number,
          min: 0,
        },
      },
      skills: [String],
      certifications: [String],
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
          enum: ["hourly", "monthly", "yearly"],
          default: "monthly",
        },
      },
      bonuses: {
        type: String,
      },
      overtime: {
        type: String,
      },
    },
    location: {
      prefecture: {
        type: String,
        required: [true, "Prefecture is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      address: String,
      remote: {
        type: Boolean,
        default: false,
      },
      remoteType: {
        type: String,
        enum: ["full", "hybrid", "none"],
        default: "none",
      },
    },
    workConditions: {
      workHours: {
        type: String,
        default: "8:00-17:00",
      },
      daysOff: [String],
      vacation: String,
      insurance: [String],
    },
    applicationInfo: {
      applicationDeadline: {
        type: Date,
        required: [true, "Application deadline is required"],
      },
      startDate: Date,
      contactEmail: String,
      contactPhone: String,
      applicationUrl: String,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed", "filled", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "rso-only"],
      default: "public",
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
jobSchema.index({ "jobInfo.industry": 1 });
jobSchema.index({ "location.prefecture": 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ "applicationInfo.applicationDeadline": 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ featured: -1, createdAt: -1 });

// Text index for search
jobSchema.index({
  "jobInfo.title": "text",
  "description.summary": "text",
  "requirements.skills": "text",
});

// Virtual for application count
jobSchema.virtual("applicationCount").get(function () {
  return this.applications ? this.applications.length : 0;
});

// Virtual to check if job is expired
jobSchema.virtual("isExpired").get(function () {
  return this.applicationInfo.applicationDeadline < new Date();
});

// Pre-save middleware to set expiration
jobSchema.pre("save", function (next) {
  if (this.isModified("applicationInfo.applicationDeadline")) {
    this.expiresAt = this.applicationInfo.applicationDeadline;
  }
  next();
});

// Static method to find active jobs
jobSchema.statics.findActive = function (filter = {}) {
  return this.find({
    ...filter,
    status: "active",
    "applicationInfo.applicationDeadline": { $gt: new Date() },
  });
};

// Method to increment view count
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Job", jobSchema);
```

> Note: The full model code is unchanged; include it in the `src/models/` files as provided in the original guide. Use `js` fenced code blocks when pasting the model code.

## REST API Controllers

File examples (put under `src/controllers/`), use language `js` for code blocks.

### `src/controllers/userController.js`

```js
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined)
    filter.isActive = req.query.isActive === "true";

  // Execute query
  const users = await User.find(filter)
    .select("-password")
    .populate("profile", "firstName lastName")
    .populate("company", "companyName")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

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

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("profile")
    .populate("company");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Check authorization - users can only view their own data unless admin
  if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to access this user"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", { user }));
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Check authorization
  if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to update this user"));
  }

  // Fields that can be updated
  const allowedUpdates = ["email", "isActive"];

  // Only admin can change role
  if (req.user.role === "admin") {
    allowedUpdates.push("role");
  }

  // Filter updates to only allowed fields
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", { user }));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Soft delete - set isActive to false
  await User.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json(new ApiResponse(200, "User deleted successfully", null));
});

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("profile")
    .populate("company");

  res
    .status(200)
    .json(
      new ApiResponse(200, "Current user retrieved successfully", { user }),
    );
});

// @desc    Update password
// @route   PUT /api/v1/users/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ApiError(401, "Current password is incorrect"));
  }

  // Set new password
  user.password = req.body.newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully", null));
});
```

### `src/controllers/jobController.js`

```js
const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    filter.status = "active"; // Default to active jobs
  }

  // Filter by industry
  if (req.query.industry) {
    filter["jobInfo.industry"] = req.query.industry;
  }

  // Filter by location
  if (req.query.prefecture) {
    filter["location.prefecture"] = req.query.prefecture;
  }
  if (req.query.city) {
    filter["location.city"] = new RegExp(req.query.city, "i");
  }

  // Filter by salary range
  if (req.query.minSalary) {
    filter["compensation.salary.min"] = {
      $gte: parseInt(req.query.minSalary, 10),
    };
  }

  // Filter by Japanese level
  if (req.query.japaneseLevel) {
    filter["requirements.japaneseLevel"] = req.query.japaneseLevel;
  }

  // Search by text
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Featured jobs
  if (req.query.featured === "true") {
    filter.featured = true;
  }

  // Execute query
  const jobs = await Job.find(filter)
    .populate("company", "companyName logo location")
    .populate("postedBy", "email")
    .limit(limit)
    .skip(skip)
    .sort(req.query.sort || "-createdAt");

  const total = await Job.countDocuments(filter);

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

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate("company")
    .populate("postedBy", "email")
    .populate({
      path: "applications",
      select: "applicant status createdAt",
      populate: { path: "applicant", select: "email profile" },
    });

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Increment view count (don't await)
  job
    .incrementViews()
    .catch((err) => console.error("Failed to increment views:", err));

  res
    .status(200)
    .json(new ApiResponse(200, "Job retrieved successfully", { job }));
});

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private/Employer
exports.createJob = asyncHandler(async (req, res, next) => {
  // Add postedBy and company from authenticated user
  req.body.postedBy = req.user.id;

  if (req.user.role === "employer") {
    if (!req.user.company) {
      return next(
        new ApiError(400, "Employer must have an associated company"),
      );
    }
    req.body.company = req.user.company;
  }

  const job = await Job.create(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, "Job created successfully", { job }));
});

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private/Employer
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check ownership
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to update this job"));
  }

  // Don't allow updating certain fields
  delete req.body.postedBy;
  delete req.body.company;
  delete req.body.views;
  delete req.body.applications;

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", { job }));
});

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private/Employer
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check ownership
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to delete this job"));
  }

  // Soft delete - change status to archived
  job.status = "archived";
  await job.save();

  res.status(200).json(new ApiResponse(200, "Job deleted successfully", null));
});

// @desc    Get jobs by company
// @route   GET /api/v1/jobs/company/:companyId
// @access  Public
exports.getJobsByCompany = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({
    company: req.params.companyId,
    status: "active",
  })
    .populate("company", "companyName logo")
    .sort("-createdAt");

  res
    .status(200)
    .json(
      new ApiResponse(200, "Company jobs retrieved successfully", { jobs }),
    );
});

// @desc    Get my posted jobs
// @route   GET /api/v1/jobs/my-jobs
// @access  Private/Employer
exports.getMyJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({ postedBy: req.user.id })
    .populate("company", "companyName")
    .sort("-createdAt");

  res
    .status(200)
    .json(new ApiResponse(200, "Your jobs retrieved successfully", { jobs }));
});
```

## Authentication examples — password hashing

Below are small examples showing how to use the password helpers in `src/utils/password.js` for registration, login, and a Mongoose pre-save hook. These are intentionally minimal — adapt to your app's validation, error handling, and response style.

### Registration (controller snippet)

```js
const { hashPassword } = require("../utils/password");
const User = require("../models/User");

// POST /api/v1/auth/register
async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    // validate inputs (not shown)

    // Hash the password before saving
    const passwordHash = await hashPassword(password);

    const user = new User({ email, password: passwordHash, role });
    await user.save();

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    next(err);
  }
}
```

### Login (controller snippet)

```js
const { comparePassword } = require("../utils/password");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
}
```

### Mongoose Model — pre-save hook (User model)

```js
// In src/models/User.js
const mongoose = require("mongoose");
const { hashPassword } = require("../utils/password");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["jobseeker", "employer", "admin"],
    default: "jobseeker",
  },
});

userSchema.pre("save", async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified("password")) return next();
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
```

## Express Routes

Place route files under `src/routes/`. Example files: `userRoutes.js`, `jobRoutes.js`, `index.js`.

Use `js` fenced blocks when adding the route code.

## Middleware Implementation

Add middleware under `src/middleware/` (e.g., `auth.js`, `asyncHandler.js`, `errorHandler.js`) — include code blocks labeled `js`.

### Important fix notes

- Several previous code blocks in this document were missing language tags; they've been standardized to use `bash`, `json`, `env`, or `js` where applicable so markdown linters will not warn about missing fenced-code languages.
- The package list was converted into a Markdown table to satisfy table-format rules.
- Angle-bracketed URLs/addresses in `.env` examples were changed to plain text (no angle brackets) to avoid link-fragment linter warnings.

## Main Application Files

### `src/app.js`

```js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize data
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/v1", require("./routes"));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

### `server.js`

```js
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const logger = require("./src/utils/logger");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(`Error: ${err.name} - ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Connect to database
connectDatabase();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(`Error: ${err.name} - ${err.message}`);
  logger.error(err.stack);

  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    logger.info("💥 Process terminated!");
  });
});

module.exports = server;
```

## Testing the API

Using cURL (replace placeholders appropriately):

```bash
# Health Check
curl http://localhost:5000/api/v1/health

# Register User
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get All Jobs (with token)
curl http://localhost:5000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create Job (Employer)
curl -X POST http://localhost:5000/api/v1/jobs \
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

# Apply to Job (Jobseeker)
curl -X POST http://localhost:5000/api/v1/jobs/65job123abc456def/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "coverLetter": "I am very interested in this position and have 3 years of relevant experience.",
    "resumePath": "https://japanssw-s3-bucket.s3.ap-southeast-1.amazonaws.com/resumes/abc123.pdf"
  }'

# Get My Applications (Jobseeker) — optional filters: ?status=reviewing&page=1&limit=10
curl http://localhost:5000/api/v1/applications/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get Single Application
curl http://localhost:5000/api/v1/applications/65app123abc456def \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Withdraw Application (Jobseeker)
curl -X PUT http://localhost:5000/api/v1/applications/65app123abc456def/withdraw \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update Application Status (Employer)
curl -X PUT http://localhost:5000/api/v1/applications/65app123abc456def/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "interview",
    "notes": "Shortlisted — scheduling interview",
    "interview": {
      "date": "2026-02-05T10:00:00.000Z",
      "location": "Company Office, Meeting Room A",
      "notes": "Please bring your resume"
    }
  }'

# Add Employer Notes
curl -X PUT http://localhost:5000/api/v1/applications/65app123abc456def/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"notes": "Strong candidate — schedule final interview."}'
```

## Using Postman

- Create a new collection: "Japan SSW API"
- Add environment variables: `BASE_URL`, `JWT_TOKEN`
- Test authentication endpoints and then CRUD operations for `/jobs`, `/users`, etc.

## Deployment

Examples for Vercel, Heroku, and AWS EC2 (commands are correctly fenced as `bash`).

### Vercel

Vercel offers seamless deployment for Node.js applications with automatic HTTPS, global CDN, and serverless functions.

#### Prerequisites

- Vercel account (free tier available)
- Vercel CLI or GitHub integration

#### Option 1: Vercel CLI Deployment

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd backend

# Deploy to Vercel
vercel

# Follow prompts to configure project
# Set up project name, framework preset, build settings

# Deploy to production
vercel --prod
```

#### Option 2: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (if applicable)
   - **Build Command**: Leave empty or use `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

6. Add environment variables in Vercel dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-connection-string`
   - `JWT_SECRET=your-jwt-secret`
   - `JWT_EXPIRE=7d`
   - `RATE_LIMIT_WINDOW_MS=900000`
   - `RATE_LIMIT_MAX_REQUESTS=100`
   - Add any other required environment variables

7. Click "Deploy"

#### Configuration File: `vercel.json`

Create a `vercel.json` file in your backend root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Important Vercel Notes

- **Serverless Architecture**: Vercel runs Node.js apps as serverless functions with a 10-second execution timeout on the Hobby plan (60s on Pro).
- **Cold Starts**: First requests may be slower due to serverless function initialization.
- **Persistent Connections**: MongoDB connection pooling works, but connections may close between invocations. Use `mongoose.connect()` with proper options.
- **File Storage**: Vercel's filesystem is read-only. Use external storage (AWS S3, Cloudinary) for file uploads.
- **Environment Variables**: Always set in Vercel dashboard, not in `.env` files.

#### Vercel Deployment Commands

```bash
# Deploy to preview environment
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]

# View project information
vercel inspect [deployment-url]
```

#### Continuous Deployment

Vercel automatically deploys:

- **Production**: Commits pushed to `main` or `master` branch
- **Preview**: Pull requests and other branches get unique preview URLs

#### Custom Domain Setup

1. Go to your project in Vercel dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. HTTPS is automatically configured

### Heroku (high level)

```bash
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
```

### AWS EC2 (high level)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-repo/japanssw-backend.git
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
```

## Best Practices

### Security

- Use HTTPS in production
- Implement rate limiting
- Sanitize user input
- Use helmet for security headers
- Hash passwords with bcrypt
- Implement JWT with expiration
- Validate all inputs
- Use environment variables for secrets

### Performance

- Use database indexing
- Implement pagination
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries
- Use compression middleware

### Code Quality

- Follow RESTful conventions
- Use async/await consistently
- Handle errors properly
- Write descriptive comments
- Use consistent naming
- Implement logging

### Maintenance

- Monitor application performance
- Set up automated backups
- Document API endpoints
- Write tests
- Use version control
- Keep dependencies updated

## Next Steps

- Set up MongoDB Atlas
- Initialize project and install dependencies
- Create basic models and controllers
- Implement authentication
- Test all CRUD operations
- Add validation and error handling
- Deploy to production
- Monitor and optimize

## Resources

- Express.js Documentation
- Mongoose Documentation
- MongoDB Atlas Documentation
- JWT Documentation
- RESTful API Design

Document Version: 1.0  
Last Updated: January 22, 2026  
Author: Team Kaizen MMDC
