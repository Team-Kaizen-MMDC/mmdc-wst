const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Japan SSW Platform API",
      version: "1.0.0",
      description:
        "REST API for Japan Specified Skilled Worker (SSW) job platform - connects Filipino jobseekers with Japanese employers",
      contact: {
        name: "API Support",
        email: "support@japanssw.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.japanssw.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            stack: {
              type: "string",
              description: "Stack trace (development only)",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            role: {
              type: "string",
              enum: ["jobseeker", "employer", "admin", "rso"],
              example: "jobseeker",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            isEmailVerified: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            user: {
              type: "string",
              description: "User ID reference",
            },
            firstName: {
              type: "string",
              example: "Maria",
            },
            lastName: {
              type: "string",
              example: "Santos",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other", "prefer-not-to-say"],
            },
            nationality: {
              type: "string",
              example: "Philippines",
            },
            japaneseLevel: {
              type: "string",
              enum: ["N5", "N4", "N3", "N2", "N1", "Native"],
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  school: { type: "string" },
                  degree: { type: "string" },
                  field: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  current: { type: "boolean" },
                },
              },
            },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  current: { type: "boolean" },
                },
              },
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  level: {
                    type: "string",
                    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
                  },
                  category: { type: "string" },
                },
              },
            },
          },
        },
        Company: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            name: {
              type: "string",
              example: "Tech Innovation Corp",
            },
            slug: {
              type: "string",
              example: "tech-innovation-corp",
            },
            industry: {
              type: "string",
              example: "Manufacturing",
            },
            size: {
              type: "string",
              example: "201-500",
            },
            description: {
              type: "string",
            },
            location: {
              type: "object",
              properties: {
                prefecture: { type: "string" },
                city: { type: "string" },
                postalCode: { type: "string" },
              },
            },
            isVerified: {
              type: "boolean",
            },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            company: {
              type: "string",
              description: "Company ID reference",
            },
            title: {
              type: "string",
              example: "Manufacturing Engineer",
            },
            industry: {
              type: "string",
              example: "Manufacturing",
            },
            summary: {
              type: "string",
            },
            japaneseLevel: {
              type: "string",
              enum: ["N5", "N4", "N3", "N2", "N1"],
            },
            compensation: {
              type: "object",
              properties: {
                salaryMin: { type: "number" },
                salaryMax: { type: "number" },
                currency: { type: "string", example: "JPY" },
                period: { type: "string", example: "monthly" },
              },
            },
            location: {
              type: "object",
              properties: {
                prefecture: { type: "string" },
                city: { type: "string" },
                remote: { type: "boolean" },
              },
            },
            status: {
              type: "string",
              enum: ["draft", "active", "closed", "filled", "archived"],
            },
            views: {
              type: "number",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Profile",
        description: "User profile management",
      },
      {
        name: "Jobs",
        description: "Job listings and search",
      },
      {
        name: "Companies",
        description: "Company profiles",
      },
      {
        name: "Applications",
        description: "Job applications and employer management",
      },
      {
        name: "Users",
        description: "User management and account operations",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to route files with JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
