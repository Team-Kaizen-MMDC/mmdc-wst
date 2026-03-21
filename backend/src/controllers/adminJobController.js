//adminJobController.js

const Job = require("../models/Job");
const Company = require("../models/Company");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function mapAdminPayloadToJob(body, userId) {
  return {
    company: body.company,
    postedBy: userId,

    title: body.title,
    industry: body.industry,
    category: body.category || "General",

    summary: body.summary,
    responsibilities: body.responsibilities || "",
    requirements: body.requirements || "",
    benefits: body.benefits || "",

    requiredEducation: body.requiredEducation || "None",
    japaneseLevel: body.japaneseLevel || "N4",

    requiredExperience: {
      years: Number(body.requiredExperience?.years || 0),
      description: body.requiredExperience?.description || "",
    },

    requiredSkills: toArray(body.requiredSkills),
    requiredCertifications: toArray(body.requiredCertifications),

    compensation: {
      salaryMin: Number(body.compensation?.salaryMin || 0),
      salaryMax: Number(
        body.compensation?.salaryMax ?? body.compensation?.salaryMin ?? 0
      ),
      currency: body.compensation?.currency || "JPY",
      period: body.compensation?.period || "monthly",
      bonuses: body.compensation?.bonuses || "",
      overtimePay:
        body.compensation?.overtimePay === true ||
        body.compensation?.overtimePay === "true",
    },

    location: {
      prefecture: body.location?.prefecture || "",
      city: body.location?.city || "",
      address: body.location?.address || "",
      remote:
        body.location?.remote === true ||
        body.location?.remote === "true",
      remoteType: body.location?.remoteType || "None",
    },

    workConditions: {
      workHours: body.workConditions?.workHours || "",
      daysOff: body.workConditions?.daysOff || "",
      vacation: body.workConditions?.vacation || "",
      insurance: body.workConditions?.insurance || "",
      probationPeriod: body.workConditions?.probationPeriod || "",
    },

    applicationInfo: {
      deadline: body.applicationInfo?.deadline || null,
      startDate: body.applicationInfo?.startDate || null,
      contactEmail: body.applicationInfo?.contactEmail || "",
      contactPhone: body.applicationInfo?.contactPhone || "",
      applicationUrl: body.applicationInfo?.applicationUrl || "",
      applicationMethod: body.applicationInfo?.applicationMethod || "Platform",
    },

    status: body.status || "active",
    visibility: body.visibility || "public",

    featured: body.featured === true || body.featured === "true",
    urgent: body.urgent === true || body.urgent === "true",
  };
}

/**
 * @desc    Create a job from Admin Dashboard
 */
exports.createAdminJob = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.body.company);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const payload = mapAdminPayloadToJob(req.body, req.user.id);
  const newJob = await Job.create(payload);

  res.status(201).json(
    new ApiResponse(201, "Admin job created successfully", { job: newJob })
  );
});

/**
 * @desc    Get all jobs for Admin Dashboard
 */
exports.getAdminJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isDeleted: false })
    .populate({
      path: "company",
      select: "name industry location.prefecture location.city isVerified",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    })
    .sort("-createdAt");

  res.status(200).json(
    new ApiResponse(200, "Admin jobs retrieved successfully", { jobs })
  );
});

/**
 * @desc    Get a single admin job by ID
 */
exports.getAdminJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate({
      path: "company",
      select: "name industry location.prefecture location.city isVerified",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Job retrieved successfully", { job })
  );
});

/**
 * @desc    Update admin job
 */
exports.updateAdminJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const payload = mapAdminPayloadToJob(
    {
      ...job.toObject(),
      ...req.body,
      company: req.body.company || job.company,
    },
    job.postedBy
  );

  Object.assign(job, payload);
  await job.save();

  await job.populate([
    {
      path: "company",
      select: "name industry location.prefecture location.city isVerified",
    },
    {
      path: "postedBy",
      select: "email role",
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Job updated successfully", { job })
  );
});

/**
 * @desc    Soft delete admin job
 */
exports.deleteAdminJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  await job.softDelete();

  res.status(200).json(
    new ApiResponse(200, "Job removed successfully", null)
  );
});