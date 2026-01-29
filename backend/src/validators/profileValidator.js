const { body, param } = require("express-validator");

// Validation for creating/updating profile basic info
exports.profileBasicValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        throw new Error("Age must be between 18 and 100");
      }
      return true;
    }),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Invalid gender value"),
  body("nationality")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nationality cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Invalid phone number format"),
  body("postalCode")
    .optional()
    .trim()
    .matches(/^\d{3}-?\d{4}$/)
    .withMessage("Invalid Japanese postal code format (e.g., 123-4567)"),
];

// Validation for education entry
exports.educationValidator = [
  body("school").trim().notEmpty().withMessage("School name is required"),
  body("degree").trim().notEmpty().withMessage("Degree is required"),
  body("field").optional().trim(),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.startDate &&
        new Date(value) < new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("current").optional().isBoolean().withMessage("Current must be boolean"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Validation for experience entry
exports.experienceValidator = [
  body("company").trim().notEmpty().withMessage("Company name is required"),
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.startDate &&
        new Date(value) < new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("current").optional().isBoolean().withMessage("Current must be boolean"),
];

// Validation for skills
exports.skillsValidator = [
  body("skills").isArray().withMessage("Skills must be an array"),
  body("skills.*.name").trim().notEmpty().withMessage("Skill name is required"),
  body("skills.*.level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Invalid skill level"),
  body("skills.*.category").optional().trim(),
];

// Validation for certifications
exports.certificationsValidator = [
  body("certifications")
    .isArray()
    .withMessage("Certifications must be an array"),
  body("certifications.*.name")
    .trim()
    .notEmpty()
    .withMessage("Certification name is required"),
  body("certifications.*.issuer")
    .trim()
    .notEmpty()
    .withMessage("Issuer is required"),
  body("certifications.*.date")
    .notEmpty()
    .withMessage("Issue date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("certifications.*.expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  body("certifications.*.credentialId").optional().trim(),
];

// Validation for languages
exports.languagesValidator = [
  body("languages").isArray().withMessage("Languages must be an array"),
  body("languages.*.language")
    .trim()
    .notEmpty()
    .withMessage("Language is required"),
  body("languages.*.level")
    .isIn(["basic", "conversational", "fluent", "native"])
    .withMessage("Invalid language level"),
];

// Validation for availability
exports.availabilityValidator = [
  body("startDate").optional().isISO8601().withMessage("Invalid date format"),
  body("visaStatus")
    .optional()
    .isIn([
      "not-applicable",
      "student",
      "working",
      "ssw-1",
      "ssw-2",
      "spouse",
      "pr",
      "other",
    ])
    .withMessage("Invalid visa status"),
  body("relocate")
    .optional()
    .isBoolean()
    .withMessage("Relocate must be boolean"),
  body("remote").optional().isBoolean().withMessage("Remote must be boolean"),
];

// Validation for education/experience ID parameter
exports.idParamValidator = [
  param("edu_id").optional().isMongoId().withMessage("Invalid education ID"),
  param("exp_id").optional().isMongoId().withMessage("Invalid experience ID"),
];
