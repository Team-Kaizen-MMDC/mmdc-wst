const { body, param, query } = require("express-validator");

// Validation for creating/updating jobs
exports.jobCreateValidator = [
  body("company")
    .notEmpty()
    .withMessage("Company is required")
    .isMongoId()
    .withMessage("Invalid company ID"),

  body("title")
    .notEmpty()
    .withMessage("Job title is required")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Job title cannot exceed 200 characters"),

  body("industry")
    .notEmpty()
    .withMessage("Industry is required")
    .isIn([
      "Manufacturing",
      "Nursing Care",
      "Construction",
      "Agriculture",
      "Food Service",
      "Hospitality",
      "Food Processing",
      "Industrial Machinery",
      "Electric & Electronics",
      "Building Cleaning",
      "Shipbuilding",
      "Auto Repair",
      "Aviation",
      "Accommodation",
      "Other",
    ])
    .withMessage("Invalid industry"),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters"),

  body("summary")
    .notEmpty()
    .withMessage("Job summary is required")
    .isLength({ max: 500 })
    .withMessage("Summary cannot exceed 500 characters"),

  body("responsibilities")
    .notEmpty()
    .withMessage("Job responsibilities are required")
    .isLength({ max: 2000 })
    .withMessage("Responsibilities cannot exceed 2000 characters"),

  body("requirements")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Requirements cannot exceed 2000 characters"),

  body("benefits")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Benefits cannot exceed 1000 characters"),

  // Required qualifications
  body("requiredEducation")
    .optional()
    .isIn([
      "None",
      "High School",
      "Vocational",
      "Associate",
      "Bachelor",
      "Master",
      "Doctorate",
    ])
    .withMessage("Invalid education level"),

  body("japaneseLevel")
    .optional()
    .isIn(["None", "N5", "N4", "N3", "N2", "N1"])
    .withMessage("Invalid Japanese level"),

  body("requiredExperience.years")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience years must be a non-negative integer"),

  body("requiredSkills")
    .optional()
    .isArray()
    .withMessage("Required skills must be an array")
    .custom((skills) => {
      if (skills && skills.some((skill) => typeof skill !== "string")) {
        throw new Error("All skills must be strings");
      }
      return true;
    }),

  // Compensation
  body("compensation.salaryMin")
    .notEmpty()
    .withMessage("Minimum salary is required")
    .isNumeric()
    .withMessage("Minimum salary must be a number")
    .custom((value) => value >= 0)
    .withMessage("Minimum salary cannot be negative"),

  body("compensation.salaryMax")
    .notEmpty()
    .withMessage("Maximum salary is required")
    .isNumeric()
    .withMessage("Maximum salary must be a number")
    .custom((value, { req }) => {
      if (value < req.body.compensation.salaryMin) {
        throw new Error(
          "Maximum salary must be greater than or equal to minimum salary",
        );
      }
      return true;
    }),

  body("compensation.currency")
    .optional()
    .isIn(["JPY", "USD", "EUR", "PHP", "VND", "IDR"])
    .withMessage("Invalid currency"),

  body("compensation.period")
    .optional()
    .isIn(["hourly", "daily", "monthly", "yearly"])
    .withMessage("Invalid compensation period"),

  // Location
  body("location.prefecture")
    .notEmpty()
    .withMessage("Prefecture is required")
    .trim(),

  body("location.city").notEmpty().withMessage("City is required").trim(),

  body("location.address")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Address cannot exceed 300 characters"),

  body("location.remote")
    .optional()
    .isBoolean()
    .withMessage("Remote must be a boolean"),

  body("location.remoteType")
    .optional()
    .isIn(["None", "Partial", "Full"])
    .withMessage("Invalid remote type"),

  // Application info
  body("applicationInfo.deadline")
    .notEmpty()
    .withMessage("Application deadline is required")
    .isISO8601()
    .withMessage("Invalid deadline date format")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Application deadline cannot be in the past");
      }
      return true;
    }),

  body("applicationInfo.startDate")
    .notEmpty()
    .withMessage("Expected start date is required")
    .isISO8601()
    .withMessage("Invalid start date format")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.applicationInfo.deadline)) {
        throw new Error("Start date must be after application deadline");
      }
      return true;
    }),

  body("applicationInfo.contactEmail")
    .optional()
    .isEmail()
    .withMessage("Invalid contact email")
    .normalizeEmail(),

  body("applicationInfo.contactPhone")
    .optional()
    .matches(/^[0-9\-\+\(\)\s]+$/)
    .withMessage("Invalid phone number format"),

  body("applicationInfo.applicationUrl")
    .optional()
    .isURL()
    .withMessage("Invalid application URL"),

  body("applicationInfo.applicationMethod")
    .optional()
    .isIn(["Platform", "Email", "External URL", "Phone"])
    .withMessage("Invalid application method"),

  // Status and visibility
  body("status")
    .optional()
    .isIn(["draft", "active", "closed", "filled", "archived"])
    .withMessage("Invalid status"),

  body("visibility")
    .optional()
    .isIn(["public", "private", "rso-only"])
    .withMessage("Invalid visibility"),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),

  body("urgent").optional().isBoolean().withMessage("Urgent must be a boolean"),
];

// Validation for updating jobs
exports.jobUpdateValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Job title cannot exceed 200 characters"),

  body("industry")
    .optional()
    .isIn([
      "Manufacturing",
      "Nursing Care",
      "Construction",
      "Agriculture",
      "Food Service",
      "Hospitality",
      "Food Processing",
      "Industrial Machinery",
      "Electric & Electronics",
      "Building Cleaning",
      "Shipbuilding",
      "Auto Repair",
      "Aviation",
      "Accommodation",
      "Other",
    ])
    .withMessage("Invalid industry"),

  body("summary")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Summary cannot exceed 500 characters"),

  body("responsibilities")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Responsibilities cannot exceed 2000 characters"),

  body("compensation.salaryMin")
    .optional()
    .isNumeric()
    .withMessage("Minimum salary must be a number")
    .custom((value) => value >= 0)
    .withMessage("Minimum salary cannot be negative"),

  body("compensation.salaryMax")
    .optional()
    .isNumeric()
    .withMessage("Maximum salary must be a number")
    .custom((value, { req }) => {
      if (
        req.body.compensation?.salaryMin &&
        value < req.body.compensation.salaryMin
      ) {
        throw new Error(
          "Maximum salary must be greater than or equal to minimum salary",
        );
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["draft", "active", "closed", "filled", "archived"])
    .withMessage("Invalid status"),
];

// Validation for job query parameters
exports.jobQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("industry")
    .optional()
    .isIn([
      "Manufacturing",
      "Nursing Care",
      "Construction",
      "Agriculture",
      "Food Service",
      "Hospitality",
      "Food Processing",
      "Industrial Machinery",
      "Electric & Electronics",
      "Building Cleaning",
      "Shipbuilding",
      "Auto Repair",
      "Aviation",
      "Accommodation",
      "Other",
    ])
    .withMessage("Invalid industry filter"),

  query("japaneseLevel")
    .optional()
    .isIn(["None", "N5", "N4", "N3", "N2", "N1"])
    .withMessage("Invalid Japanese level filter"),

  query("minSalary")
    .optional()
    .isNumeric()
    .withMessage("Min salary must be a number"),

  query("maxSalary")
    .optional()
    .isNumeric()
    .withMessage("Max salary must be a number"),

  query("remote")
    .optional()
    .isBoolean()
    .withMessage("Remote must be a boolean"),

  query("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),

  query("status")
    .optional()
    .isIn(["draft", "active", "closed", "filled", "archived"])
    .withMessage("Invalid status filter"),

  query("sort")
    .optional()
    .matches(
      /^-?(createdAt|updatedAt|views|compensation\.salaryMin|compensation\.salaryMax|title)$/,
    )
    .withMessage("Invalid sort field"),
];

// Validation for job ID parameter
exports.jobIdValidator = [
  param("id").isMongoId().withMessage("Invalid job ID"),
];

// Validation for company ID parameter
exports.companyIdValidator = [
  param("companyId").isMongoId().withMessage("Invalid company ID"),
];
