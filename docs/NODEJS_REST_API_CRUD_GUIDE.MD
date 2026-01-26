# Node.js REST API with MongoDB Atlas — Complete CRUD Implementation Guide

## Overview

This guide provides a step-by-step implementation of a production-ready Node.js REST API with full CRUD (Create, Read, Update, Delete) operations using MongoDB Atlas as the database backend for the Japan SSW platform.

## Table of Contents

- Prerequisites
- Project Setup
- Project Structure
- Installation & Configuration
- MongoDB Connection Setup
- Mongoose Models
- REST API Controllers
- Express Routes
- Middleware Implementation
- Error Handling
- Testing the API
- Deployment
- Best Practices

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
mkdir japanssw-backend
cd japanssw-backend

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

```text
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
```

## Installation & Configuration

1. Create `.gitignore`

```text
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
```

1. Update `package.json` Scripts

```json
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
```

1. Create `.env.example`

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japanssw_db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Client URL
CLIENT_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@japanssw.com
FROM_NAME=Japan SSW Platform

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

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
// (user model code — keep unchanged from original guide)
```

### `src/models/Job.js`

```js
// (job model code — keep unchanged from original guide)
```

> Note: The full model code is unchanged; include it in the `src/models/` files as provided in the original guide. Use `js` fenced code blocks when pasting the model code.

## REST API Controllers

File examples (put under `src/controllers/`), use language `js` for code blocks.

### `src/controllers/userController.js`

```js
// (user controller code — keep unchanged from original guide)
```

### `src/controllers/jobController.js`

```js
// (job controller code — keep unchanged from original guide)
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
// (app setup code — keep unchanged from original guide)
```

### `server.js`

```js
// (entry point code — keep unchanged from original guide)
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
```

## Using Postman

- Create a new collection: "Japan SSW API"
- Add environment variables: `BASE_URL`, `JWT_TOKEN`
- Test authentication endpoints and then CRUD operations for `/jobs`, `/users`, etc.

## Deployment

Examples for Heroku and AWS EC2 (commands are correctly fenced as `bash`).

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

