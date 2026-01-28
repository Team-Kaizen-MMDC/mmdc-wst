const { body, param, query } = require("express-validator");

exports.validateApplication = [
  body("coverLetter")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Cover letter cannot exceed 2000 characters")
    .trim(),
  body("resumePath")
    .optional()
    .isString()
    .withMessage("Resume path must be a string"),
];

exports.validateApplicationStatusUpdate = [
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "submitted",
      "reviewing",
      "interview",
      "offer",
      "accepted",
      "rejected",
    ])
    .withMessage("Invalid status"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters")
    .trim(),
  body("interview.date")
    .optional()
    .isISO8601()
    .withMessage("Invalid interview date format"),
  body("interview.location")
    .optional()
    .isString()
    .withMessage("Interview location must be a string")
    .trim(),
  body("interview.notes")
    .optional()
    .isString()
    .withMessage("Interview notes must be a string")
    .trim(),
];

exports.validateEmployerNotes = [
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("notes")
    .notEmpty()
    .withMessage("Notes are required")
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters")
    .trim(),
];

exports.validateApplicationQuery = [
  query("status")
    .optional()
    .isIn([
      "submitted",
      "reviewing",
      "interview",
      "offer",
      "accepted",
      "rejected",
      "withdrawn",
    ])
    .withMessage("Invalid status filter"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
