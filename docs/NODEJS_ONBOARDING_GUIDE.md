# Node.js Developer Onboarding Guide

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture & Folder Structure](#architecture--folder-structure)
3. [Application Flow](#application-flow)
4. [Core Concepts](#core-concepts)
5. [Routes](#routes)
6. [Controllers](#controllers)
7. [Models](#models)
8. [Middleware](#middleware)
9. [JWT Authentication](#jwt-authentication)
10. [Complete Request Flow Examples](#complete-request-flow-examples)
11. [Getting Started](#getting-started)

---

## Application Overview

This is a **Job Matching Platform** built with Node.js, Express.js, and MongoDB. The application connects job seekers with employers, allowing:

- **Job Seekers**: Create profiles, search jobs, submit applications
- **Employers**: Post jobs, review applications, manage company profiles
- **Admins/RSOs**: Oversee platform operations

### Technology Stack

```
Backend:
├── Node.js (Runtime)
├── Express.js (Web Framework)
├── MongoDB + Mongoose (Database & ODM)
├── JWT (Authentication)
├── Bcrypt.js (Password Hashing)
└── Swagger (API Documentation)

Frontend:
├── Vanilla JavaScript
├── Tailwind CSS
└── HTML5
```

---

## Architecture & Folder Structure

```mermaid
graph TD
    A[Backend Root] --> B[server.js - Entry Point]
    A --> C[config.js - Environment Config]
    A --> D[src/]

    D --> E[app.js - Express App Setup]
    D --> F[routes/ - API Endpoints]
    D --> G[controllers/ - Business Logic]
    D --> H[models/ - Database Schemas]
    D --> I[middleware/ - Request Processing]
    D --> J[utils/ - Helper Functions]
    D --> K[validators/ - Input Validation]
    D --> L[config/ - Database & Swagger]

    style B fill:#e1f5ff
    style E fill:#e1f5ff
    style F fill:#fff4e1
    style G fill:#ffe1e1
    style H fill:#e1ffe1
    style I fill:#f0e1ff
```

### Directory Breakdown

```
backend/
├── server.js                 # Application entry point - starts Express server
├── config.js                 # Centralized environment variables
├── package.json              # Dependencies and scripts
│
├── src/
│   ├── app.js                # Express app configuration & middleware setup
│   │
│   ├── routes/               # API route definitions (URL patterns)
│   │   ├── index.js          # Route aggregator
│   │   ├── authRoutes.js     # /api/v1/auth/* routes
│   │   ├── userRoutes.js     # /api/v1/users/* routes
│   │   ├── jobRoutes.js      # /api/v1/jobs/* routes
│   │   ├── applicationRoutes.js
│   │   ├── profileRoutes.js
│   │   └── companyRoutes.js
│   │
│   ├── controllers/          # Request handlers (business logic)
│   │   ├── authController.js # Authentication logic (register, login)
│   │   ├── userController.js # User CRUD operations
│   │   ├── jobController.js  # Job posting operations
│   │   └── ...
│   │
│   ├── models/               # Mongoose schemas (database structure)
│   │   ├── User.js           # User schema & methods
│   │   ├── Job.js            # Job posting schema
│   │   ├── Application.js    # Application schema
│   │   ├── UserProfile.js    # Extended profile info
│   │   └── Company.js        # Company schema
│   │
│   ├── middleware/           # Request processing functions
│   │   ├── auth.js           # JWT verification & authorization
│   │   ├── asyncHandler.js   # Error handling wrapper
│   │   └── errorHandler.js   # Global error handler
│   │
│   ├── utils/                # Helper utilities
│   │   ├── ApiError.js       # Custom error class
│   │   ├── ApiResponse.js    # Standardized response format
│   │   └── logger.js         # Logging utility
│   │
│   ├── validators/           # Input validation schemas
│   │
│   └── config/               # Configuration files
│       ├── database.js       # MongoDB connection setup
│       └── swagger.js        # API documentation config
```

---

## Application Flow

### High-Level Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Middleware
    participant Router
    participant Controller
    participant Model
    participant MongoDB

    Client->>Express: HTTP Request (e.g., POST /api/v1/auth/login)
    Express->>Middleware: Apply global middleware (helmet, cors, rate-limit)
    Middleware->>Router: Route to appropriate handler
    Router->>Middleware: Check auth middleware (if protected route)
    Middleware->>Controller: Execute controller function
    Controller->>Model: Call model methods
    Model->>MongoDB: Execute database query
    MongoDB-->>Model: Return data
    Model-->>Controller: Return processed data
    Controller-->>Express: Send JSON response
    Express-->>Client: HTTP Response
```

### Application Lifecycle

```mermaid
graph LR
    A[npm start] --> B[server.js]
    B --> C[Load .env]
    C --> D[createApp]
    D --> E[Configure Express]
    E --> F[Connect MongoDB]
    F --> G[Register Routes]
    G --> H[Setup Error Handler]
    H --> I[Start Listening on PORT]
    I --> J[Ready for Requests]

    style A fill:#e1f5ff
    style D fill:#ffe1e1
    style F fill:#e1ffe1
    style I fill:#fff4e1
```

---

## Core Concepts

### 1. **Express.js Framework**

Express is a minimal and flexible Node.js web framework that provides a robust set of features for web and mobile applications.

**Key Features:**

- Routing system
- Middleware support
- HTTP utilities
- Template rendering

**Basic Express Setup:**

```javascript
const express = require("express");
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello World" });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### 2. **Mongoose ODM**

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and their representation in MongoDB.

**Why Mongoose?**

- Schema definition
- Built-in validation
- Middleware (hooks)
- Query building
- Type casting

---

## Routes

Routes define the **URL patterns** and **HTTP methods** your API responds to. They map incoming requests to specific controller functions.

### Route Definition Pattern

```javascript
// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/me", protect, getMe);

module.exports = router;
```

### How Routes Are Registered

```javascript
// routes/index.js - Route Aggregator
const express = require("express");
const router = express.Router();

// Import individual route modules
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const userRoutes = require("./userRoutes");

// Mount routes at specific base paths
router.use("/auth", authRoutes); // All auth routes: /api/v1/auth/*
router.use("/jobs", jobRoutes); // All job routes: /api/v1/jobs/*
router.use("/users", userRoutes); // All user routes: /api/v1/users/*

module.exports = router;
```

```javascript
// app.js - Main app configuration
const registerRoutes = require("./routes");

const app = express();

// Mount all API routes under /api/v1
registerRoutes(app);

// Inside registerRoutes:
// app.use('/api/v1', routes);
```

### Complete URL Construction

```
Base URL: http://localhost:3000
API Prefix: /api/v1
Resource: /auth
Endpoint: /login

Full URL: http://localhost:3000/api/v1/auth/login
```

### Route with Parameters

```javascript
// Get specific job by ID
router.get("/:id", getJob);
// URL: GET /api/v1/jobs/507f1f77bcf86cd799439011

// Access in controller:
exports.getJob = async (req, res) => {
  const jobId = req.params.id; // "507f1f77bcf86cd799439011"
  // ... fetch job from database
};
```

### Route with Query Parameters

```javascript
// Search jobs with filters
router.get("/", getAllJobs);
// URL: GET /api/v1/jobs?location=Tokyo&type=fulltime

// Access in controller:
exports.getAllJobs = async (req, res) => {
  const { location, type } = req.query;
  // location = "Tokyo", type = "fulltime"
};
```

---

## Controllers

Controllers contain the **business logic** for each route. They handle:

- Input validation
- Database operations
- Response formatting
- Error handling

### Controller Structure

```javascript
// controllers/authController.js
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  // 1. Extract data from request body
  const { email, password, role } = req.body;

  // 2. Validate input
  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  // 3. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User already exists"));
  }

  // 4. Create new user
  const user = await User.create({
    email,
    password,
    role: role || "jobseeker",
  });

  // 5. Generate JWT token
  const token = user.getSignedJwtToken();

  // 6. Send response
  res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    }),
  );
});
```

### Key Controller Patterns

#### 1. **asyncHandler Wrapper**

Eliminates try-catch blocks by automatically catching async errors:

```javascript
// Without asyncHandler
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// With asyncHandler (cleaner!)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

#### 2. **Standardized Responses**

```javascript
// Success response
res.status(200).json(new ApiResponse(200, "Success message", { data }));

// Output:
// {
//   "success": true,
//   "statusCode": 200,
//   "message": "Success message",
//   "data": { ... }
// }
```

#### 3. **Error Handling**

```javascript
// Validation error
return next(new ApiError(400, "Invalid input"));

// Authentication error
return next(new ApiError(401, "Not authorized"));

// Not found error
return next(new ApiError(404, "Resource not found"));
```

---

## Models

Models define the **structure** of your data and provide an **interface** for interacting with MongoDB.

### Model Definition

```javascript
// models/User.js
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
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin", "rso"],
      default: "jobseeker",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile", // Reference to UserProfile model
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true, // Auto-creates createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual property (computed, not stored in DB)
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware (runs before saving to DB)
userSchema.pre("save", async function () {
  // Only hash password if it was modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method - available on user documents
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method - generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Static method - available on User model
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

module.exports = mongoose.model("User", userSchema);
```

### Model Relationships

```javascript
// One-to-One: User → UserProfile
const User = require("./User");
const UserProfile = require("./UserProfile");

// In controller:
const user = await User.findById(userId).populate("profile");
// user.profile will contain the full UserProfile document

// One-to-Many: Company → Jobs
const companyJobs = await Job.find({ company: companyId });

// Many-to-Many (through Application): User ↔ Job
const userApplications = await Application.find({ userId })
  .populate("jobId")
  .populate("userId");
```

---

## Middleware

Middleware functions have access to the request (`req`), response (`res`), and `next` function. They can:

- Execute code
- Modify request/response objects
- End the request-response cycle
- Call the next middleware

### Middleware Execution Flow

```mermaid
graph LR
    A[Request] --> B[Global Middleware]
    B --> C[helmet Security]
    C --> D[CORS]
    D --> E[Rate Limiting]
    E --> F[Body Parser]
    F --> G[Route Middleware]
    G --> H[Auth Middleware]
    H --> I[Controller]
    I --> J[Response]

    style A fill:#e1f5ff
    style H fill:#ffe1e1
    style I fill:#fff4e1
    style J fill:#e1ffe1
```

### Types of Middleware

#### 1. **Application-Level Middleware** (Applied to all routes)

```javascript
// app.js
const express = require("express");
const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Custom logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // MUST call next() to continue to next middleware
});
```

#### 2. **Router-Level Middleware** (Applied to specific routes)

```javascript
// routes/userRoutes.js
const { protect, authorize } = require("../middleware/auth");

// Applied to all routes in this file
router.use(protect);

// Applied to specific routes
router.delete("/:id", protect, authorize("admin"), deleteUser);
```

#### 3. **Error-Handling Middleware**

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, message.join(", "));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = new ApiError(400, "Duplicate field value entered");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;

// Registered last in app.js:
app.use(errorHandler);
```

#### 4. **Custom Middleware: asyncHandler**

Wraps async functions to catch errors automatically:

```javascript
// middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// Usage:
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
// If User.findById throws an error, asyncHandler catches it
// and passes it to the error handler
```

---

## JWT Authentication

JWT (JSON Web Token) is a secure way to transmit information between parties as a JSON object. In our app, it's used for **stateless authentication**.

### How JWT Authentication Works

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database

    Note over Client,Database: Registration/Login
    Client->>Server: POST /auth/login {email, password}
    Server->>Database: Find user by email
    Database-->>Server: User document
    Server->>Server: Verify password with bcrypt
    Server->>Server: Generate JWT with user ID
    Server-->>Client: {token: "eyJhbGc..."}

    Note over Client,Database: Accessing Protected Resource
    Client->>Server: GET /users/me<br/>Header: Authorization: Bearer eyJhbGc...
    Server->>Server: Verify JWT signature
    Server->>Server: Extract user ID from token
    Server->>Database: Find user by ID
    Database-->>Server: User document
    Server->>Server: Attach user to req.user
    Server->>Server: Execute controller
    Server-->>Client: {user data}
```

### JWT Structure

A JWT has three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTgzYjc5MzdjZGE1ZWU3YTQxMWUyZiIsInJvbGUiOiJqb2JzZWVrZXIiLCJpYXQiOjE3NDA1MzA1NTYsImV4cCI6MTc0MTEzNTM1Nn0.kQJ4xHqZ9p8b7Y3w6kVMnL2R5cXjA1u0tGsP9fN8eZ4

Header.Payload.Signature
```

1. **Header** (algorithm & token type):

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload** (data):

```json
{
  "id": "67e83b793cdca5ee7a411e2f",
  "role": "jobseeker",
  "iat": 1740530556,
  "exp": 1741135356
}
```

3. **Signature** (verifies token hasn't been tampered with):

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Generating JWT Tokens

```javascript
// models/User.js - Instance method
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id, // User's MongoDB ObjectId
      role: this.role, // User's role (jobseeker/employer/admin)
    },
    process.env.JWT_SECRET, // Secret key from environment
    {
      expiresIn: process.env.JWT_EXPIRE || "7d", // Token lifetime
    },
  );
};

// Usage in controller:
const user = await User.create({ email, password });
const token = user.getSignedJwtToken();
res.json({ token });
```

### Verifying JWT Tokens

```javascript
// middleware/auth.js
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // "Bearer eyJhbGc..." → "eyJhbGc..."
  }

  // 2. Check if token exists
  if (!token) {
    return next(new ApiError(401, "Not authorized"));
  }

  try {
    // 3. Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "67e83b79...", role: "jobseeker", iat: ..., exp: ... }

    // 4. Get user from database (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ApiError(401, "User not found"));
    }

    // 5. Check if account is active and not locked
    if (!req.user.isActive || req.user.isLocked) {
      return next(new ApiError(401, "Account is inactive or locked"));
    }

    // 6. User is authenticated - continue to controller
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
});

### Google OAuth (Sign-in with Google)

This project supports optional Google OAuth sign-in. The flow is:

- User clicks "Sign in with Google" on the frontend.
- Frontend navigates to a backend endpoint that initiates the OAuth flow (e.g., `/api/v1/auth/google`).
- After the user consents, Google redirects back to the configured callback (`/api/v1/auth/google/callback`) with an authorization `code`.
- The backend exchanges the `code` for tokens, fetches the user's profile (`scope=profile email`), finds or creates a local user record, and returns the application's JWT to the client.

Required environment variables (add to `backend/.env`):

- `GOOGLE_CLIENT_ID` — OAuth client ID from Google Cloud Console.
- `GOOGLE_CLIENT_SECRET` — OAuth client secret (keep this private).
- `GOOGLE_REDIRECT_URI` — Redirect URI registered in Google Cloud (e.g., `http://localhost:3000/api/v1/auth/google/callback`).

Backend implementation notes:

- Routes: typically `GET /api/v1/auth/google` (init) and `GET /api/v1/auth/google/callback` (callback).
- Scopes: request `profile` and `email` to obtain the user's name and verified email.
- When creating a user, store provider metadata (`provider: 'google'`, `providerId: googleId`) to support repeat logins.
- Consider `email_verified` before auto-creating accounts.

Testing locally:

1. Create credentials in Google Cloud Console (OAuth consent screen, Web application credentials).
2. Configure redirect URI for local dev (`http://localhost:3000/api/v1/auth/google/callback`).
3. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` to `backend/.env`.
4. Start the backend and trigger the flow from the frontend sign-in page.

Security guidance:

- Never commit `GOOGLE_CLIENT_SECRET` to source control. Use a secrets manager in production.
- Use HTTPS in production for redirect URIs.
- Limit allowed redirect URIs to those you control.
```

### Role-Based Authorization

```javascript
// middleware/auth.js
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized`),
      );
    }
    next();
  };
};

// Usage in routes:
router.delete("/:id", protect, authorize("admin"), deleteUser);
// Only admins can delete users

router.get(
  "/company/jobs",
  protect,
  authorize("employer", "admin"),
  getCompanyJobs,
);
// Employers and admins can view company jobs
```

### Client-Side Token Usage

```javascript
// Store token after login
localStorage.setItem("token", response.data.token);

// Include token in subsequent requests
fetch("http://localhost:3000/api/v1/users/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});
```

---

## Complete Request Flow Examples

### Example 1: User Registration (Public Route)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Router
    participant Controller
    participant Model
    participant MongoDB

    Client->>Express: POST /api/v1/auth/register<br/>{email, password, role}
    Express->>Express: Apply global middleware<br/>(helmet, cors, body-parser)
    Express->>Router: Match route → authRoutes.js
    Router->>Controller: Call register()
    Controller->>Controller: Validate input
    Controller->>Model: User.findOne({email})
    Model->>MongoDB: Query
    MongoDB-->>Model: null (user doesn't exist)
    Model-->>Controller: null
    Controller->>Model: User.create({email, password, role})
    Model->>Model: Hash password (pre-save hook)
    Model->>MongoDB: Insert document
    MongoDB-->>Model: New user document
    Model-->>Controller: User object
    Controller->>Model: user.getSignedJwtToken()
    Model-->>Controller: JWT token
    Controller->>Express: res.status(201).json({token, user})
    Express-->>Client: 201 Created<br/>{success: true, data: {token, user}}
```

**Step-by-Step Code Flow:**

```javascript
// 1. Client Request
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "jobseeker"
}

// 2. Express receives request → app.js
app.use(express.json()); // Parse JSON body
app.use('/api/v1', routes); // Route to API

// 3. Router matches route → routes/authRoutes.js
router.post('/register', register);

// 4. Controller executes → controllers/authController.js
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password'));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, 'User already exists'));
  }

  // Create user
  const user = await User.create({ email, password, role });
  // → Triggers pre-save hook to hash password

  // Generate token
  const token = user.getSignedJwtToken();

  // Send response
  res.status(201).json(
    new ApiResponse(201, 'User registered successfully', {
      token,
      user: { id: user._id, email: user.email, role: user.role }
    })
  );
});

// 5. Response sent to client
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67e83b793cdca5ee7a411e2f",
      "email": "john@example.com",
      "role": "jobseeker"
    }
  }
}
```

---

### Example 2: Get Current User (Protected Route)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Auth
    participant Router
    participant Controller
    participant Model
    participant MongoDB

    Client->>Express: GET /api/v1/auth/me<br/>Header: Authorization: Bearer token
    Express->>Router: Match route
    Router->>Auth: protect middleware
    Auth->>Auth: Extract & verify JWT
    Auth->>Model: User.findById(decoded.id)
    Model->>MongoDB: Query
    MongoDB-->>Model: User document
    Model-->>Auth: User object
    Auth->>Auth: Attach to req.user
    Auth->>Controller: next() → getMe()
    Controller->>Controller: Use req.user
    Controller->>Express: res.json(req.user)
    Express-->>Client: 200 OK {user data}
```

**Step-by-Step Code Flow:**

```javascript
// 1. Client Request (with JWT)
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. Router with middleware → routes/authRoutes.js
router.get('/me', protect, getMe);
//              ↑       ↑
//         middleware  controller

// 3. Auth middleware executes FIRST → middleware/auth.js
exports.protect = asyncHandler(async (req, res, next) => {
  // Extract token
  const token = req.headers.authorization.split(' ')[1];

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded = { id: "67e83b79...", role: "jobseeker" }

  // Get user from database
  req.user = await User.findById(decoded.id).select('-password');

  // Continue to controller
  next();
});

// 4. Controller executes → controllers/authController.js
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by protect middleware!
  const user = req.user;

  res.status(200).json(
    new ApiResponse(200, 'User retrieved successfully', { user })
  );
});

// 5. Response
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "67e83b793cdca5ee7a411e2f",
      "email": "john@example.com",
      "role": "jobseeker",
      "isActive": true,
      "createdAt": "2025-01-31T10:00:00.000Z"
    }
  }
}
```

---

### Example 3: Create Job Posting (Protected + Role-Based)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Auth
    participant Authorize
    participant Controller
    participant Job
    participant MongoDB

    Client->>Express: POST /api/v1/jobs<br/>Authorization: Bearer token<br/>{title, description, salary}
    Express->>Auth: protect middleware
    Auth->>Auth: Verify JWT → req.user
    Auth->>Authorize: authorize('employer', 'admin')
    Authorize->>Authorize: Check req.user.role
    alt User is employer/admin
        Authorize->>Controller: next() → createJob()
        Controller->>Job: Job.create({...})
        Job->>MongoDB: Insert document
        MongoDB-->>Job: New job document
        Job-->>Controller: Job object
        Controller-->>Client: 201 Created {job}
    else User is jobseeker
        Authorize-->>Client: 403 Forbidden<br/>"Not authorized"
    end
```

**Code Flow:**

```javascript
// 1. Route definition → routes/jobRoutes.js
router.post("/", protect, authorize("employer", "admin"), createJob);
//                  ↑          ↑                            ↑
//              auth     role check                   controller

// 2. Auth middleware (same as before)
exports.protect = asyncHandler(async (req, res, next) => {
  // ... verify JWT and attach user to req.user
  next();
});

// 3. Authorization middleware → middleware/auth.js
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // roles = ['employer', 'admin']
    // req.user.role = 'employer' (from protect middleware)

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized`),
      );
    }
    next(); // Role is authorized, continue to controller
  };
};

// 4. Controller → controllers/jobController.js
exports.createJob = asyncHandler(async (req, res) => {
  const { title, description, salary, location } = req.body;

  // Attach company from authenticated user
  const job = await Job.create({
    title,
    description,
    salary,
    location,
    company: req.user.company, // From req.user populated by protect
    postedBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Job created successfully", { job }));
});
```

---

## Getting Started

### 1. **Environment Setup**

```bash
# Install dependencies
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
MONGODB_URI=mongodb://localhost:27017/mmdc-wst
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d
PORT=3000
```

### 2. **Start Development Server**

```bash
npm run dev  # Uses nodemon for auto-restart
# or
npm start    # Production mode
```

### 3. **Test the API**

#### Using cURL:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","role":"jobseeker"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Get current user (use token from login response)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Using Postman:

1. Import the collection from `backend/postman/`
2. Set environment variables (base URL, token)
3. Test all endpoints interactively

### 4. **View API Documentation**

Visit: http://localhost:3000/api-docs

Interactive Swagger UI with all endpoints documented.

---

## Common Development Patterns

### Adding a New Feature (Complete Flow)

**Scenario:** Add a "Save Job" feature for job seekers

#### 1. **Create Model** (if needed)

```javascript
// models/SavedJob.js
const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate saves
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("SavedJob", savedJobSchema);
```

#### 2. **Create Controller**

```javascript
// controllers/savedJobController.js
const asyncHandler = require("../middleware/asyncHandler");
const SavedJob = require("../models/SavedJob");

exports.saveJob = asyncHandler(async (req, res) => {
  const savedJob = await SavedJob.create({
    user: req.user._id,
    job: req.body.jobId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Job saved successfully", { savedJob }));
});

exports.getSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await SavedJob.find({ user: req.user._id }).populate("job");

  res
    .status(200)
    .json(new ApiResponse(200, "Saved jobs retrieved", { savedJobs }));
});

exports.unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.findOneAndDelete({
    user: req.user._id,
    job: req.params.jobId,
  });

  res.status(200).json(new ApiResponse(200, "Job removed from saved"));
});
```

#### 3. **Create Routes**

```javascript
// routes/savedJobRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  saveJob,
  getSavedJobs,
  unsaveJob,
} = require("../controllers/savedJobController");

const router = express.Router();

// All routes require authentication and jobseeker role
router.use(protect);
router.use(authorize("jobseeker"));

router.post("/", saveJob);
router.get("/", getSavedJobs);
router.delete("/:jobId", unsaveJob);

module.exports = router;
```

#### 4. **Register Routes**

```javascript
// routes/index.js
const savedJobRoutes = require("./savedJobRoutes");

module.exports = function registerRoutes(app) {
  const router = express.Router();

  // ... existing routes
  router.use("/saved-jobs", savedJobRoutes);

  app.use("/api/v1", router);
};
```

#### 5. **Test**

```bash
# Save a job
curl -X POST http://localhost:3000/api/v1/saved-jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"67e83b79..."}'

# Get saved jobs
curl -X GET http://localhost:3000/api/v1/saved-jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Debugging Tips

### 1. **Enable Detailed Logging**

```javascript
// Add to app.js
const morgan = require("morgan");
app.use(morgan("dev")); // Logs all requests

// Console log in controllers
console.log("req.body:", req.body);
console.log("req.user:", req.user);
console.log("req.params:", req.params);
console.log("req.query:", req.query);
```

### 2. **Test Database Queries Directly**

```javascript
// Create a test script
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect("mongodb://localhost:27017/mmdc-wst");

async function test() {
  const users = await User.find();
  console.log(users);
  mongoose.connection.close();
}

test();
```

### 3. **Common Error Solutions**

| Error                                    | Cause                              | Solution                             |
| ---------------------------------------- | ---------------------------------- | ------------------------------------ |
| `JsonWebTokenError: invalid signature`   | Wrong JWT_SECRET or token tampered | Verify JWT_SECRET in .env            |
| `ValidationError: email is required`     | Missing field in request           | Check request body                   |
| `MongoServerError: E11000 duplicate key` | Unique constraint violation        | Check if resource already exists     |
| `Cannot set headers after they are sent` | Multiple res.send() calls          | Ensure only one response per request |

---

## Key Takeaways

1. **MVC Pattern**: Routes → Controllers → Models → Database
2. **Middleware Chain**: Request flows through middleware before reaching controllers
3. **JWT Authentication**: Stateless tokens for secure API access
4. **Error Handling**: Use asyncHandler + global error handler for clean code
5. **Mongoose**: ODM for schema validation, hooks, and relationships
6. **REST Principles**: Use proper HTTP methods and status codes

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Next Steps

1. Read through `backend/API_REFERENCE.md` for complete endpoint documentation
2. Explore `backend/DEVELOPER_GUIDE.md` for coding standards
3. Check `backend/postman/` for ready-to-use API test collections
4. Review existing controllers to understand business logic patterns
5. Start building features following the patterns in this guide

**Questions?** Check the project's GitHub issues or ask your team lead!
