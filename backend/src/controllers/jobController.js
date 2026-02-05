const Job = require("../models/Job");
const Company = require("../models/Company");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Get all jobs with filters, search, and pagination
 * @route   GET /api/v1/jobs
 * @access  Public
 */
exports.getJobs = asyncHandler(async (req, res) => {
  const {
    // Pagination
    page = 1,
    limit = 10,
    // Filters
    industry,
    prefecture,
    city,
    minSalary,
    maxSalary,
    japaneseLevel,
    remote,
    status,
    featured,
    // Search
    search,
    // Sorting
    sort = "-createdAt",
  } = req.query;

  // Build query
  const query = { isDeleted: false };

  // Industry filter
  if (industry) {
    query.industry = industry;
  }

  // Location filters
  if (prefecture) {
    query["location.prefecture"] = prefecture;
  }
  if (city) {
    query["location.city"] = new RegExp(city, "i");
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    query["compensation.salaryMin"] = {};
    if (minSalary) {
      query["compensation.salaryMin"].$gte = Number(minSalary);
    }
    if (maxSalary) {
      query["compensation.salaryMax"] = { $lte: Number(maxSalary) };
    }
  }

  // Japanese level filter
  if (japaneseLevel) {
    const levelOrder = { None: 0, N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
    const requestedLevel = levelOrder[japaneseLevel];
    const acceptableLevels = Object.keys(levelOrder).filter(
      (level) => levelOrder[level] <= requestedLevel,
    );
    query.japaneseLevel = { $in: acceptableLevels };
  }

  // Remote work filter
  if (remote !== undefined) {
    query["location.remote"] = remote === "true";
  }

  // Status filter (default to active for public access)
  if (status) {
    query.status = status;
  } else {
    query.status = "active";
  }

  // Featured filter
  if (featured !== undefined) {
    query.featured = featured === "true";
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  let jobsQuery = Job.find(query)
    .populate({
      path: "company",
      select: "name logo industry location.prefecture location.city isVerified",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    })
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  // If text search is used, include search score
  if (search) {
    jobsQuery = jobsQuery
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  }

  const jobs = await jobsQuery;

  // Get total count
  const total = await Job.countDocuments(query);

  // Pagination info
  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
    hasNext: pageNum < Math.ceil(total / limitNum),
    hasPrev: pageNum > 1,
  };

  res.status(200).json(
    new ApiResponse(200, "Jobs retrieved successfully", {
      jobs,
      pagination,
    }),
  );
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false })
    .populate({
      path: "company",
      select:
        "name logo industry size founded website description location contact isVerified",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // Increment views (fire and forget)
  job
    .incrementViews()
    .catch((err) => console.error("Failed to increment views:", err));

  res
    .status(200)
    .json(new ApiResponse(200, "Job retrieved successfully", { job }));
});

/**
 * @desc    Create new job
 * @route   POST /api/v1/jobs
 * @access  Private (Employer only)
 */
exports.createJob = asyncHandler(async (req, res) => {
  // Verify company exists and user has access
  const company = await Company.findById(req.body.company);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check if user owns or is admin of the company
  const isOwner = company.owner.toString() === req.user.id;
  const isAdmin = company.admins.some(
    (admin) => admin.toString() === req.user.id,
  );

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to post jobs for this company",
    );
  }

  // Add postedBy field
  req.body.postedBy = req.user.id;

  const job = await Job.create(req.body);

  // Add job to company's jobs array
  company.jobs.push(job._id);
  await company.save();

  const populatedJob = await Job.findById(job._id)
    .populate({
      path: "company",
      select: "name logo industry location.prefecture location.city",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    });

  res
    .status(201)
    .json(
      new ApiResponse(201, "Job created successfully", { job: populatedJob }),
    );
});

/**
 * @desc    Update job
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (Employer - owner only)
 */
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findOne({ _id: req.params.id, isDeleted: false });

  if (!job) {
    return next(new ApiError(404, "Job not found or has been archived"));
  }

  // Check ownership
  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, "You do not have permission to update this job");
  }

  // Prevent updating certain fields
  const protectedFields = ['postedBy', 'company', 'views', 'applications'];
  protectedFields.forEach(field => delete req.body[field]);

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "company",
      select: "name logo industry location.prefecture location.city",
    })
    .populate({
      path: "postedBy",
      select: "email role",
    });

  res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", { job }));
});

/**
 * @desc    Delete job (soft delete)
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Employer - owner only)
 */
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // Check ownership
  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, "You do not have permission to delete this job");
  }

  // Soft delete
  await job.softDelete();

  res.status(200).json(new ApiResponse(200, "Job deleted successfully", null));
});

/**
 * @desc    Get jobs by company
 * @route   GET /api/v1/jobs/company/:companyId
 * @access  Public
 */
exports.getJobsByCompany = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = "active" } = req.query;

  const company = await Company.findById(req.params.companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const query = {
    company: req.params.companyId,
    isDeleted: false,
    status,
  };

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const jobs = await Job.find(query)
    .populate({
      path: "company",
      select: "name logo industry location.prefecture location.city isVerified",
    })
    .skip(skip)
    .limit(limitNum)
    .sort("-createdAt");

  const total = await Job.countDocuments(query);

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  };

  res.status(200).json(
    new ApiResponse(200, "Company jobs retrieved successfully", {
      jobs,
      pagination,
    }),
  );
});

/**
 * @desc    Get employer's own jobs
 * @route   GET /api/v1/jobs/my-jobs
 * @access  Private (Employer only)
 */
exports.getMyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {
    postedBy: req.user.id,
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const jobs = await Job.find(query)
    .populate({
      path: "company",
      select: "name logo industry location.prefecture location.city",
    })
    .skip(skip)
    .limit(limitNum)
    .sort("-createdAt");

  const total = await Job.countDocuments(query);

  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  };

  res.status(200).json(
    new ApiResponse(200, "Your jobs retrieved successfully", {
      jobs,
      pagination,
    }),
  );
});

/**
 * @desc    Get job statistics (for admin/analytics)
 * @route   GET /api/v1/jobs/stats
 * @access  Private (Admin only)
 */
exports.getJobStats = asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const industryStats = await Job.aggregate([
    {
      $match: { isDeleted: false, status: "active" },
    },
    {
      $group: {
        _id: "$industry",
        count: { $sum: 1 },
        avgSalaryMin: { $avg: "$compensation.salaryMin" },
        avgSalaryMax: { $avg: "$compensation.salaryMax" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const prefectureStats = await Job.aggregate([
    {
      $match: { isDeleted: false, status: "active" },
    },
    {
      $group: {
        _id: "$location.prefecture",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Job statistics retrieved successfully", {
      statusStats: stats,
      industryStats,
      prefectureStats,
    }),
  );
});
