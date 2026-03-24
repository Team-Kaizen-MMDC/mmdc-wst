const Company = require("../models/Company");
const Job = require("../models/Job");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Get all companies with filters and pagination
 * @route   GET /api/v1/companies
 * @access  Public
 */
exports.getCompanies = asyncHandler(async (req, res) => {
  const {
    // Pagination
    page = 1,
    limit = 10,
    // Filters
    industry,
    prefecture,
    size,
    verified,
    featured,
    // Search
    search,
    // Sorting
    sort = "-createdAt",
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (industry)    query.industry = industry;
  if (prefecture)  query["location.prefecture"] = prefecture;
  if (size)        query.size = size;
  if (verified !== undefined) query.isVerified = verified === "true";
  if (featured === "true")    query.featured = true;

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  let companiesQuery = Company.find(query)
    .select("-admins -__v")
    .populate({
      path: "owner",
      select: "email",
    })
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  // If text search is used, include search score
  // If text search is used, sort by relevance
if (search) {
  companiesQuery = companiesQuery.sort({ score: { $meta: "textScore" } });
}

  const companies = await companiesQuery;

  // Get total count
  const total = await Company.countDocuments(query);

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
    new ApiResponse(200, "Companies retrieved successfully", {
      companies,
      pagination,
    }),
  );
});

/**
 * @desc    Get single company by ID or slug
 * @route   GET /api/v1/companies/:idOrSlug
 * @access  Public
 */
exports.getCompany = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const mongoose = require("mongoose");

  // Build a smart query
  let query = { isActive: true };
  
  // Check if it's a valid MongoDB ID
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    query._id = idOrSlug;
  } else {
    // If not a valid ID, search only by slug
    query.slug = idOrSlug;
  }

  let company = await Company.findOne(query)
    .populate({ path: "owner", select: "email" })
    .populate({
      path: "jobs",
      match: { isDeleted: false, status: "active" },
      select: "title industry location.prefecture compensation.salaryMin compensation.salaryMax applicationInfo.deadline",
      options: { limit: 10, sort: "-createdAt" },
    });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  res.status(200).json(new ApiResponse(200, "Company retrieved successfully", { company }));
});

/**
 * @desc    Create new company
 * @route   POST /api/v1/companies
 * @access  Private (Employer/Admin only)
 */
exports.createCompany = asyncHandler(async (req, res) => {
  // Check if company name already exists
  const existingCompany = await Company.findOne({ name: req.body.name });
  if (existingCompany) {
    throw new ApiError(400, "Company with this name already exists");
  }

  // Set owner to current user
  req.body.owner = req.user.id;

  const company = await Company.create(req.body);

  const populatedCompany = await Company.findById(company._id).populate({
    path: "owner",
    select: "email",
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, "Company created successfully", {
        company: populatedCompany,
      }),
    );
});

/**
 * @desc    Update company
 * @route   PUT /api/v1/companies/:id
 * @access  Private (Owner/Admin only)
 */
exports.updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findOne({ _id: req.params.id, isActive: true });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check ownership (owner or admin)
  const isOwner = company.owner.toString() === req.user.id;
  const isAdmin = company.admins.some(
    (admin) => admin.toString() === req.user.id,
  );
  const isSystemAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin && !isSystemAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to update this company",
    );
  }

  // Prevent updating certain fields
  delete req.body.owner;
  delete req.body.jobs;
  delete req.body.isVerified;
  delete req.body.verifiedAt;
  delete req.body.verifiedBy;

  company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: "owner",
    select: "email",
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Company updated successfully", { company }));
});

/**
 * @desc    Delete company (soft delete)
 * @route   DELETE /api/v1/companies/:id
 * @access  Private (Owner/Admin only)
 */
exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, isActive: true });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check ownership
  const isOwner = company.owner.toString() === req.user.id;
  const isSystemAdmin = req.user.role === "admin";

  if (!isOwner && !isSystemAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to delete this company",
    );
  }

  // Deactivate company
  await company.deactivate();

  // Also soft delete all associated jobs
  await Job.updateMany(
    { company: company._id },
    { isDeleted: true, deletedAt: new Date(), status: "archived" },
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Company deleted successfully", null));
});

/**
 * @desc    Verify company (Admin only)
 * @route   PUT /api/v1/companies/:id/verify
 * @access  Private (Admin only)
 */
exports.verifyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (company.isVerified) {
    throw new ApiError(400, "Company is already verified");
  }

  await company.verify(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Company verified successfully", { company }));
});

/**
 * @desc    Add admin to company
 * @route   POST /api/v1/companies/:id/admins
 * @access  Private (Owner only)
 */
exports.addCompanyAdmin = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check ownership
  if (company.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Only the company owner can add admins");
  }

  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if user is already an admin
  if (company.admins.includes(userId)) {
    throw new ApiError(400, "User is already an admin");
  }

  company.admins.push(userId);
  await company.save();

  const populatedCompany = await Company.findById(company._id)
    .populate({
      path: "owner",
      select: "email",
    })
    .populate({
      path: "admins",
      select: "email role",
    });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Admin added successfully", {
        company: populatedCompany,
      }),
    );
});

/**
 * @desc    Remove admin from company
 * @route   DELETE /api/v1/companies/:id/admins/:userId
 * @access  Private (Owner only)
 */
exports.removeCompanyAdmin = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Check ownership
  if (company.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Only the company owner can remove admins");
  }

  company.admins = company.admins.filter(
    (admin) => admin.toString() !== req.params.userId,
  );
  await company.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Admin removed successfully", { company }));
});

/**
 * @desc    Get company statistics (for admin/analytics)
 * @route   GET /api/v1/companies/stats
 * @access  Private (Admin only)
 */
exports.getCompanyStats = asyncHandler(async (req, res) => {
  const totalCompanies = await Company.countDocuments({ isActive: true });
  const verifiedCompanies = await Company.countDocuments({
    isActive: true,
    isVerified: true,
  });

  const industryStats = await Company.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$industry",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const sizeStats = await Company.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$size",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const prefectureStats = await Company.aggregate([
    {
      $match: { isActive: true },
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
    new ApiResponse(200, "Company statistics retrieved successfully", {
      totalCompanies,
      verifiedCompanies,
      verificationRate:
        totalCompanies > 0
          ? ((verifiedCompanies / totalCompanies) * 100).toFixed(2) + "%"
          : "0%",
      industryStats,
      sizeStats,
      prefectureStats,
    }),
  );
});
