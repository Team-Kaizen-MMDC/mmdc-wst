const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    logo: {
      type: String,
      trim: true,
      // Allow absolute URLs (https://...) or relative paths (/assets/...)
      match: [/^(https?:\/\/.+|\/\S+)/, "Please provide a valid logo URL or relative path"],
    },

    // Company Details
    industry: {
      type: String,
      required: [true, "Industry is required"],
      enum: [
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
        "Logistics",
        "Other",
      ],
      index: true,
    },
    size: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1001-5000",
        "5000+",
      ],
    },
    founded: {
      type: Number,
      min: [1800, "Founded year seems too early"],
      max: [new Date().getFullYear(), "Founded year cannot be in the future"],
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid website URL"],
    },
    description: {
      type: String,
      required: [true, "Company description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    tagline: {
      type: String,
      maxlength: [200, "Tagline cannot exceed 200 characters"],
    },

    // Location
    location: {
      prefecture: {
        type: String,
        required: [true, "Prefecture is required"],
        index: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      address: {
        type: String,
        maxlength: [300, "Address cannot exceed 300 characters"],
      },
      postalCode: {
        type: String,
        match: [
          /^\d{3}-?\d{4}$/,
          "Please provide a valid Japanese postal code (e.g., 123-4567)",
        ],
      },
    },

    // Contact Info
    contact: {
      email: {
        type: String,
        required: [true, "Contact email is required"],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      },
      phone: {
        type: String,
        required: [true, "Contact phone is required"],
        trim: true,
        match: [/^[0-9\-\+\(\)\s]+$/, "Please provide a valid phone number"],
      },
      fax: {
        type: String,
        trim: true,
        match: [/^[0-9\-\+\(\)\s]+$/, "Please provide a valid fax number"],
      },
    },

    // Related Users
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company owner is required"],
      index: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Jobs
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    // Certifications & Compliance
    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        issuer: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        certificateUrl: {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Please provide a valid certificate URL"],
        },
      },
    ],
    licenses: [
      {
        type: String,
        trim: true,
      },
    ],

    // Verification & Status
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Social Media
    socialMedia: {
      linkedin: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/.+/,
          "Please provide a valid LinkedIn URL",
        ],
      },
      facebook: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?facebook\.com\/.+/,
          "Please provide a valid Facebook URL",
        ],
      },
      twitter: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/,
          "Please provide a valid Twitter/X URL",
        ],
      },
      instagram: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?instagram\.com\/.+/,
          "Please provide a valid Instagram URL",
        ],
      },
    },

    // SEO & Media
    images: [
      {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, "Please provide a valid image URL"],
      },
    ],
    videos: [
      {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, "Please provide a valid video URL"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
companySchema.index({ name: "text", description: "text" });
companySchema.index({ industry: 1, isActive: 1, isVerified: 1 });
companySchema.index({ "location.prefecture": 1, isActive: 1 });

// Virtual: jobCount
companySchema.virtual("jobCount").get(function () {
  return this.jobs ? this.jobs.length : 0;
});

// Virtual: employeeRange
companySchema.virtual("employeeRange").get(function () {
  if (!this.size) return null;
  const ranges = {
    "1-10": { min: 1, max: 10 },
    "11-50": { min: 11, max: 50 },
    "51-200": { min: 51, max: 200 },
    "201-500": { min: 201, max: 500 },
    "501-1000": { min: 501, max: 1000 },
    "1001-5000": { min: 1001, max: 5000 },
    "5000+": { min: 5001, max: null },
  };
  return ranges[this.size] || null;
});

// Pre-save: generate slug from name
companySchema.pre("save", function () {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

// Instance method: verify company
companySchema.methods.verify = async function (verifiedByUserId) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedByUserId;
  await this.save();
};

// Instance method: deactivate company
companySchema.methods.deactivate = async function () {
  this.isActive = false;
  await this.save();
};

// Query helper: active only
companySchema.query.active = function () {
  return this.where({ isActive: true });
};

// Query helper: verified only
companySchema.query.verified = function () {
  return this.where({ isVerified: true });
};

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
