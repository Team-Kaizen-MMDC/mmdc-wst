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
      // Adjusted to match your jobPost.js payload
      salaryMin: { type: Number },
      salaryMax: { type: Number },
      currency: { type: String, default: "JPY" }
    },
    // Matches the keys in your jobPost.js payload
    summary: { type: String },
    responsibilities: { type: String },
    
    // Kept these for your logic
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