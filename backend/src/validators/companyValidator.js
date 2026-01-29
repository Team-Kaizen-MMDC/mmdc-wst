const { body, param, query } = require("express-validator");

// Validation for creating companies
exports.companyCreateValidator = [
  body("name")
    .notEmpty()
    .withMessage("Company name is required")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Company name cannot exceed 200 characters"),

  body("logo").optional().isURL().withMessage("Logo must be a valid URL"),

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

  body("size")
    .optional()
    .isIn([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1001-5000",
      "5000+",
    ])
    .withMessage("Invalid company size"),

  body("founded")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(
      `Founded year must be between 1800 and ${new Date().getFullYear()}`,
    ),

  body("website").optional().isURL().withMessage("Website must be a valid URL"),

  body("description")
    .notEmpty()
    .withMessage("Company description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("tagline")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Tagline cannot exceed 200 characters"),

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

  body("location.postalCode")
    .optional()
    .matches(/^\d{3}-?\d{4}$/)
    .withMessage(
      "Please provide a valid Japanese postal code (e.g., 123-4567)",
    ),

  // Contact info
  body("contact.email")
    .notEmpty()
    .withMessage("Contact email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("contact.phone")
    .notEmpty()
    .withMessage("Contact phone is required")
    .matches(/^[0-9\-\+\(\)\s]+$/)
    .withMessage("Please provide a valid phone number"),

  body("contact.fax")
    .optional()
    .matches(/^[0-9\-\+\(\)\s]+$/)
    .withMessage("Please provide a valid fax number"),

  // Certifications
  body("certifications")
    .optional()
    .isArray()
    .withMessage("Certifications must be an array"),

  body("certifications.*.name")
    .if(body("certifications").exists())
    .notEmpty()
    .withMessage("Certification name is required")
    .trim(),

  body("certifications.*.issuer").optional().trim(),

  body("certifications.*.date")
    .optional()
    .isISO8601()
    .withMessage("Invalid certification date format"),

  body("certifications.*.expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid expiry date format"),

  body("certifications.*.certificateUrl")
    .optional()
    .isURL()
    .withMessage("Certificate URL must be valid"),

  // Licenses
  body("licenses")
    .optional()
    .isArray()
    .withMessage("Licenses must be an array")
    .custom((licenses) => {
      if (licenses && licenses.some((license) => typeof license !== "string")) {
        throw new Error("All licenses must be strings");
      }
      return true;
    }),

  // Social Media
  body("socialMedia.linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid")
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.+/)
    .withMessage("Please provide a valid LinkedIn URL"),

  body("socialMedia.facebook")
    .optional()
    .isURL()
    .withMessage("Facebook URL must be valid")
    .matches(/^https?:\/\/(www\.)?facebook\.com\/.+/)
    .withMessage("Please provide a valid Facebook URL"),

  body("socialMedia.twitter")
    .optional()
    .isURL()
    .withMessage("Twitter/X URL must be valid")
    .matches(/^https?:\/\/(www\.)?(twitter|x)\.com\/.+/)
    .withMessage("Please provide a valid Twitter/X URL"),

  body("socialMedia.instagram")
    .optional()
    .isURL()
    .withMessage("Instagram URL must be valid")
    .matches(/^https?:\/\/(www\.)?instagram\.com\/.+/)
    .withMessage("Please provide a valid Instagram URL"),

  // Images and videos
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array")
    .custom((images) => {
      if (
        images &&
        images.some(
          (img) => typeof img !== "string" || !img.match(/^https?:\/\/.+/),
        )
      ) {
        throw new Error("All images must be valid URLs");
      }
      return true;
    }),

  body("videos")
    .optional()
    .isArray()
    .withMessage("Videos must be an array")
    .custom((videos) => {
      if (
        videos &&
        videos.some(
          (vid) => typeof vid !== "string" || !vid.match(/^https?:\/\/.+/),
        )
      ) {
        throw new Error("All videos must be valid URLs");
      }
      return true;
    }),
];

// Validation for updating companies
exports.companyUpdateValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Company name cannot exceed 200 characters"),

  body("logo").optional().isURL().withMessage("Logo must be a valid URL"),

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

  body("size")
    .optional()
    .isIn([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1001-5000",
      "5000+",
    ])
    .withMessage("Invalid company size"),

  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("contact.email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("contact.phone")
    .optional()
    .matches(/^[0-9\-\+\(\)\s]+$/)
    .withMessage("Please provide a valid phone number"),

  body("location.prefecture").optional().trim(),

  body("location.city").optional().trim(),

  body("website").optional().isURL().withMessage("Website must be a valid URL"),
];

// Validation for company query parameters
exports.companyQueryValidator = [
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

  query("size")
    .optional()
    .isIn([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1001-5000",
      "5000+",
    ])
    .withMessage("Invalid size filter"),

  query("verified")
    .optional()
    .isBoolean()
    .withMessage("Verified must be a boolean"),

  query("sort")
    .optional()
    .matches(/^-?(name|createdAt|updatedAt|founded)$/)
    .withMessage("Invalid sort field"),
];

// Validation for company ID parameter
exports.companyIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Company ID is required")
    .custom((value) => {
      // Allow either MongoDB ObjectId or slug
      if (value.match(/^[0-9a-fA-F]{24}$/) || value.match(/^[a-z0-9-]+$/)) {
        return true;
      }
      throw new Error("Invalid company ID or slug");
    }),
];

// Validation for adding admin
exports.addAdminValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
];

// Validation for removing admin
exports.removeAdminValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
];
