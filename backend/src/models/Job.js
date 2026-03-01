  const mongoose = require("mongoose");

  const jobSchema = new mongoose.Schema(
    {
      // References
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Company reference is required"],
        index: true,
      },
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Posted by user is required"],
        index: true,
      },

      // Job Basic Info
      title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
        maxlength: [200, "Job title cannot exceed 200 characters"],
        index: true,
      },
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
      category: {
        type: String,
        trim: true,
        maxlength: [100, "Category cannot exceed 100 characters"],
      },

      // Description
      summary: {
        type: String,
        required: [true, "Job summary is required"],
        maxlength: [500, "Summary cannot exceed 500 characters"],
      },
      responsibilities: {
        type: String,
        required: [true, "Job responsibilities are required"],
        maxlength: [2000, "Responsibilities cannot exceed 2000 characters"],
      },
      requirements: {
        type: String,
        maxlength: [2000, "Requirements cannot exceed 2000 characters"],
      },
      benefits: {
        type: String,
        maxlength: [1000, "Benefits cannot exceed 1000 characters"],
      },

      // Required Qualifications
      requiredEducation: {
        type: String,
        enum: [
          "None",
          "High School",
          "Vocational",
          "Associate",
          "Bachelor",
          "Master",
          "Doctorate",
        ],
        default: "None",
      },
      japaneseLevel: {
        type: String,
        enum: ["None", "N5", "N4", "N3", "N2", "N1"],
        default: "N4",
        index: true,
      },
      requiredExperience: {
        years: {
          type: Number,
          min: [0, "Experience years cannot be negative"],
          default: 0,
        },
        description: {
          type: String,
          maxlength: [500, "Experience description cannot exceed 500 characters"],
        },
      },
      requiredSkills: [
        {
          type: String,
          trim: true,
        },
      ],
      requiredCertifications: [
        {
          type: String,
          trim: true,
        },
      ],

      // Compensation
      compensation: {
        salaryMin: {
          type: Number,
          required: [true, "Minimum salary is required"],
          min: [0, "Salary cannot be negative"],
        },
        salaryMax: {
          type: Number,
          required: [true, "Maximum salary is required"],
          min: [0, "Salary cannot be negative"],
          validate: {
            validator: function (value) {
              return value >= this.compensation.salaryMin;
            },
            message:
              "Maximum salary must be greater than or equal to minimum salary",
          },
        },
        currency: {
          type: String,
          default: "JPY",
          enum: ["JPY", "USD", "EUR", "PHP", "VND", "IDR"],
        },
        period: {
          type: String,
          default: "monthly",
          enum: ["hourly", "daily", "monthly", "yearly"],
        },
        bonuses: {
          type: String,
          maxlength: [500, "Bonuses description cannot exceed 500 characters"],
        },
        overtimePay: {
          type: Boolean,
          default: true,
        },
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
        remote: {
          type: Boolean,
          default: false,
          index: true,
        },
        remoteType: {
          type: String,
          enum: ["None", "Partial", "Full"],
          default: "None",
        },
      },

      // Work Conditions
      workConditions: {
        workHours: {
          type: String,
          maxlength: [200, "Work hours description cannot exceed 200 characters"],
        },
        daysOff: {
          type: String,
          maxlength: [200, "Days off description cannot exceed 200 characters"],
        },
        vacation: {
          type: String,
          maxlength: [300, "Vacation description cannot exceed 300 characters"],
        },
        insurance: {
          type: String,
          maxlength: [300, "Insurance description cannot exceed 300 characters"],
        },
        probationPeriod: {
          type: String,
          maxlength: [100, "Probation period cannot exceed 100 characters"],
        },
      },

      // Application Info
      applicationInfo: {
        deadline: {
          type: Date,
          required: [true, "Application deadline is required"],
          index: true,
        },
        startDate: {
          type: Date,
          required: [true, "Expected start date is required"],
        },
        contactEmail: {
          type: String,
          trim: true,
          lowercase: true,
          match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        contactPhone: {
          type: String,
          trim: true,
          match: [/^[0-9\-\+\(\)\s]+$/, "Please provide a valid phone number"],
        },
        applicationUrl: {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Please provide a valid URL"],
        },
        applicationMethod: {
          type: String,
          enum: ["Platform", "Email", "External URL", "Phone"],
          default: "Platform",
        },
      },

      // Status & Visibility
      status: {
        type: String,
        enum: ["draft", "active", "closed", "filled", "archived"],
        default: "active",
        index: true,
      },
      visibility: {
        type: String,
        enum: ["public", "private", "rso-only"],
        default: "public",
        index: true,
      },

      // Analytics
      views: {
        type: Number,
        default: 0,
        min: [0, "Views cannot be negative"],
      },
      applications: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Application",
        },
      ],

      // Special Flags
      featured: {
        type: Boolean,
        default: false,
        index: true,
      },
      urgent: {
        type: Boolean,
        default: false,
      },

      // Soft Delete
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
      deletedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    },
  );

  // Indexes for search performance
  jobSchema.index({ title: "text", summary: "text", responsibilities: "text" });
  jobSchema.index({ industry: 1, status: 1, isDeleted: 1 });
  jobSchema.index({ "location.prefecture": 1, status: 1, isDeleted: 1 });
  jobSchema.index({ "compensation.salaryMin": 1, "compensation.salaryMax": 1 });
  jobSchema.index({ japaneseLevel: 1, status: 1 });
  jobSchema.index({ "applicationInfo.deadline": 1, status: 1 });
  jobSchema.index({ featured: 1, status: 1, createdAt: -1 });
  jobSchema.index({ createdAt: -1 });

  // Virtual: applicationCount
  jobSchema.virtual("applicationCount").get(function () {
    return this.applications ? this.applications.length : 0;
  });

  // Virtual: isExpired
  jobSchema.virtual("isExpired").get(function () {
    return this.applicationInfo.deadline < new Date();
  });

  // Virtual: daysUntilDeadline
  jobSchema.virtual("daysUntilDeadline").get(function () {
    const now = new Date();
    const deadline = new Date(this.applicationInfo.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  });

  // Instance method: increment views
  jobSchema.methods.incrementViews = async function () {
    this.views += 1;
    await this.save({ validateBeforeSave: false });
  };

  // Instance method: soft delete
  jobSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.status = "archived";
    await this.save({ validateBeforeSave: false });
  };

  // Query helper: exclude deleted
  jobSchema.query.notDeleted = function () {
    return this.where({ isDeleted: false });
  };

  // Pre-save: validate deadline
  jobSchema.pre("save", function () {
    if (this.isNew && this.applicationInfo.deadline < new Date()) {
      throw new Error("Application deadline cannot be in the past");
    }
    if (this.applicationInfo.startDate < this.applicationInfo.deadline) {
      throw new Error("Start date must be after application deadline");
    }
  });

  // Pre-save: auto-close expired jobs
  jobSchema.pre("save", function () {
    if (this.status === "active" && this.applicationInfo.deadline < new Date()) {
      this.status = "closed";
    }
  });

  

  const Job = mongoose.model("Job", jobSchema);

  module.exports = Job;
