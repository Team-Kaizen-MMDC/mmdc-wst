const mongoose = require("mongoose");

const adminJobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },
    industry: {
      type: String,
      required: [true, "Industry/Category is required"]
    },
    location: {
      prefecture: { type: String, required: true },
      city: { type: String }
    },
    compensation: {
      salaryMin: { type: Number },
      salaryMax: { type: Number },
      currency: { type: String, default: "JPY" }
    },
    summary: { type: String }, // Maps to "Job Description"
    employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract"],
        default: "Full-time"
    },
    // FLATTENED FIELDS (No more nesting)
    preferWorkLocation: { type: String }, 
    supportSponsorship: { type: String },
    japaneseLanguage: { type: String },
    nativeLanguage: { type: String },

    status: {
      type: String,
      enum: ["active", "closed", "archived"],
      default: "active"
    },
    isAdminPost: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true 
  }
);

const AdminJob = mongoose.model("AdminJob", adminJobSchema);
module.exports = AdminJob;