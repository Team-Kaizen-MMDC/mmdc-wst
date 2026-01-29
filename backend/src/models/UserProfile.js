const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
    },
    field: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  { _id: true },
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Certification name is required"],
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const languageSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["basic", "conversational", "fluent", "native"],
      required: [true, "Language level is required"],
    },
  },
  { _id: true },
);

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
    },
    // Contact Information
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    prefecture: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    // Professional Information
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    languages: [languageSchema],
    // Japanese Language Level
    japaneseLevel: {
      type: String,
      enum: ["none", "N5", "N4", "N3", "N2", "N1"],
      default: "none",
    },
    // Availability
    availability: {
      startDate: {
        type: Date,
      },
      visaStatus: {
        type: String,
        enum: [
          "not-applicable",
          "student",
          "working",
          "ssw-1",
          "ssw-2",
          "spouse",
          "pr",
          "other",
        ],
      },
      relocate: {
        type: Boolean,
        default: true,
      },
      remote: {
        type: Boolean,
        default: false,
      },
    },
    // File Paths (for future file upload functionality)
    resumePath: {
      type: String,
    },
    cvPath: {
      type: String,
    },
    photoPath: {
      type: String,
    },
    // Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
// Note: `user` is declared as `unique: true` on the field above; avoid duplicate index declarations.
// Removed explicit `user` index to prevent duplicate-index warnings from Mongoose.
userProfileSchema.index({ nationality: 1 });
userProfileSchema.index({ japaneseLevel: 1 });
userProfileSchema.index({ "availability.visaStatus": 1 });

// Virtual for full name
userProfileSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userProfileSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Method to check profile completion
userProfileSchema.methods.checkProfileCompletion = function () {
  const requiredFields = [
    this.firstName,
    this.lastName,
    this.dateOfBirth,
    this.nationality,
    this.phone,
  ];
  const hasBasicInfo = requiredFields.every((field) => field);
  const hasEducation = this.education && this.education.length > 0;
  const hasExperience = this.experience && this.experience.length > 0;
  const hasSkills = this.skills && this.skills.length > 0;

  return hasBasicInfo && hasEducation && (hasExperience || hasSkills);
};

// Pre-save middleware to update profileCompleted status
userProfileSchema.pre("save", function () {
  this.profileCompleted = this.checkProfileCompletion();
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
