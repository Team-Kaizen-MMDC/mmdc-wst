const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
      index: true,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "reviewing",
        "interview",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "submitted",
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
    },
    resumePath: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "submitted",
            "reviewing",
            "interview",
            "offer",
            "accepted",
            "rejected",
            "withdrawn",
          ],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    employerNotes: {
      type: String,
      maxlength: [1000, "Employer notes cannot exceed 1000 characters"],
    },
    interview: {
      date: Date,
      location: String,
      notes: String,
      interviewers: [String],
    },
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate applications
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

// Add status to history on creation and updates
applicationSchema.pre("save", async function () {
  // On creation, add initial status
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.applicant,
      date: new Date(),
      notes: "Application submitted",
    });
  }
  // On updates, add status change to history
  else if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.modifiedBy || this.applicant,
      date: new Date(),
    });
  }
});

// Virtual for days since application
applicationSchema.virtual("daysSinceApplication").get(function () {
  const diffTime = Math.abs(new Date() - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if applicant can withdraw
applicationSchema.methods.canWithdraw = function () {
  return ["submitted", "reviewing", "interview"].includes(this.status);
};

// Method to check if employer can update status
applicationSchema.methods.canUpdateStatus = function () {
  return !["accepted", "rejected", "withdrawn"].includes(this.status);
};

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
