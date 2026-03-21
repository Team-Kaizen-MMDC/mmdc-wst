const Application = require("../models/Application");
const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * @desc    Apply to a job
 * @route   POST /api/v1/jobs/:jobId/apply
 * @access  Private (jobseeker)
 */
exports.applyToJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { coverLetter, resumePath } = req.body;

  // Check if job exists and is active
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  if (job.status !== "active") {
    return next(
      new ApiError(400, "This job is no longer accepting applications"),
    );
  }

  // Check if application deadline has passed
  if (job.applicationDeadline && new Date() > job.applicationDeadline) {
    return next(new ApiError(400, "Application deadline has passed"));
  }

  // Check if user already applied
  const existingApplication = await Application.findOne({
    applicant: req.user._id,
    job: jobId,
  });

  if (existingApplication) {
    return next(new ApiError(400, "You have already applied to this job"));
  }

  // Create application
  const application = await Application.create({
    applicant: req.user._id,
    job: jobId,
    coverLetter,
    resumePath,
    status: "submitted",
  });

  // Increment job views/applications counter
  await Job.findByIdAndUpdate(jobId, {
    $inc: { applicationCount: 1 },
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, application, "Application submitted successfully"),
    );
});

/**
 * @desc    Get current user's applications
 * @route   GET /api/v1/applications/me
 * @access  Private (jobseeker)
 */
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { applicant: req.user._id };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const applications = await Application.find(query)
    .populate({
      path: "job",
      select: "title location company",
      populate: { path: "company", select: "name" },
    })
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  res.json(
    new ApiResponse(200, "Applications retrieved successfully", {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }),
  );
});

/**
 * @desc    Get single application
 * @route   GET /api/v1/applications/:id
 * @access  Private (applicant or employer/admin)
 */
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ApiError(404, "Application not found"));
  }

  // Check authorization
  const isApplicant =
    application.applicant._id.toString() === req.user._id.toString();
  const isEmployer = req.user.role === "employer" || req.user.role === "admin";

  if (!isApplicant && !isEmployer) {
    return next(new ApiError(403, "Not authorized to view this application"));
  }

  // Hide employer notes from applicant
  if (isApplicant && !isEmployer) {
    application.employerNotes = undefined;
  }

  res.json(new ApiResponse(200, "Success", application));
});

/**
 * @desc    Withdraw application
 * @route   PUT /api/v1/applications/:id/withdraw
 * @access  Private (applicant)
 */
exports.withdrawApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ApiError(404, "Application not found"));
  }

  // Check if user is the applicant
  if (application.applicant._id.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(403, "Not authorized to withdraw this application"),
    );
  }

  // Check if application can be withdrawn
  if (!application.canWithdraw()) {
    return next(
      new ApiError(
        `Cannot withdraw application with status: ${application.status}`,
        400,
      ),
    );
  }

  application.status = "withdrawn";
  application.modifiedBy = req.user._id;
  await application.save();

  res.json(
    new ApiResponse(200, "Application withdrawn successfully", application),
  );
});

/**
 * @desc    Get applications for a specific job
 * @route   GET /api/v1/jobs/:jobId/applications
 * @access  Private (employer/admin)
 */
exports.getJobApplications = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ApiError(404, "Job not found"));
  }

  // Check authorization (employer must own the job's company or be admin)
  if (req.user.role === "employer") {
    if (
      !req.user.company ||
      req.user.company.toString() !== job.company.toString()
    ) {
      return next(
        new ApiError(403, "Not authorized to view applications for this job"),
      );
    }
  }

  const query = { job: jobId };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const applications = await Application.find(query)
    .populate({
      path: "applicant",
      select: "email profile",
      populate: {
        path: "profile",
        select:
          "firstName lastName nationality japaneseLevel skills experience education",
      },
    })
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  // Get status summary
  const statusSummary = await Application.aggregate([
    { $match: { job: job._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json(
    new ApiResponse(200, "Job applications retrieved successfully", {
      applications,
      statusSummary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }),
  );
});

/**
 * @desc    Get aggregated applications summary for employer's company
 * @route   GET /api/v1/jobs/my/applications/summary
 * @access  Private (employer/admin)
 */
exports.getCompanyApplicationsSummary = asyncHandler(async (req, res, next) => {
  // Admins may pass companyId as query param; employers use req.user.company
  const { companyId } = req.query;
  let company = null;

  if (req.user.role === "admin" && companyId) {
    company = companyId;
  } else {
    if (!req.user.company) {
      return next(new ApiError(400, "No company associated with user"));
    }
    company = req.user.company;
  }

  // Find jobs for the company
  const jobs = await Job.find({ company }).select("_id title").lean();
  const jobIds = jobs.map((j) => j._id);

  if (jobIds.length === 0) {
    return res.json(
      new ApiResponse(200, "No jobs found for company", {
        jobs: [],
        totalApplications: 0,
        statusSummary: [],
        recentApplications: [],
      }),
    );
  }

  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

  const statusSummary = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const recentApplications = await Application.find({ job: { $in: jobIds } })
    .populate({
      path: "applicant",
      select: "email profile",
      populate: { path: "profile", select: "firstName lastName nationality" },
    })
    .populate({ path: "job", select: "title" })
    .sort("-createdAt")
    .limit(10);

  res.json(
    new ApiResponse(200, "Company applications summary retrieved", {
      jobs,
      totalApplications,
      statusSummary,
      recentApplications,
    }),
  );
});

/**
 * @desc    Update application status
 * @route   PUT /api/v1/applications/:id/status
 * @access  Private (employer/admin)
 */
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, notes, interview } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ApiError(404, "Application not found"));
  }

  // Check authorization
  const job = await Job.findById(application.job);
  if (req.user.role === "employer") {
    if (
      !req.user.company ||
      req.user.company.toString() !== job.company.toString()
    ) {
      return next(
        new ApiError(403, "Not authorized to update this application"),
      );
    }
  }

  // Validate status transition
  const validStatuses = [
    "submitted",
    "reviewing",
    "interview",
    "offer",
    "accepted",
    "rejected",
  ];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(`Invalid status: ${status}`, 400));
  }

  application.status = status;
  application.modifiedBy = req.user._id;

  // Add interview details if status is interview
  if (status === "interview" && interview) {
    application.interview = interview;
  }

  // Add rejection reason if provided
  if (status === "rejected" && notes) {
    application.rejectionReason = notes;
  }

  await application.save();

  res.json(
    new ApiResponse(
      200,
      "Application status updated successfully",
      application,
    ),
  );
});

/**
 * @desc    Add employer notes to application
 * @route   PUT /api/v1/applications/:id/notes
 * @access  Private (employer/admin)
 */
exports.addEmployerNotes = asyncHandler(async (req, res, next) => {
  const { notes } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ApiError(404, "Application not found"));
  }

  // Check authorization
  const job = await Job.findById(application.job);
  if (req.user.role === "employer") {
    if (
      !req.user.company ||
      req.user.company.toString() !== job.company.toString()
    ) {
      return next(
        new ApiError(403, "Not authorized to update this application"),
      );
    }
  }

  application.employerNotes = notes;
  await application.save();

  res.json(new ApiResponse(200, "Notes added successfully", application));
});
