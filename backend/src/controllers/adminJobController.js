const AdminJob = require('../models/adminJob'); 
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Create a job specifically for the Admin Dashboard
 */
exports.createAdminJob = asyncHandler(async (req, res) => {
    // Using AdminJob (the variable we defined on line 1)
    const newJob = await AdminJob.create(req.body);

    res.status(201).json(
        new ApiResponse(201, "Admin job created successfully", { job: newJob })
    );
});

/**
 * @desc    Get all jobs for the Admin Dashboard list
 */
exports.getAdminJobs = asyncHandler(async (req, res) => {
    // Using AdminJob (the variable we defined on line 1)
    const jobs = await AdminJob.find().sort("-createdAt");
    
    res.status(200).json(
        new ApiResponse(200, "Admin jobs retrieved successfully", { jobs })
    );
});

/**
 * @desc    Get a single job by ID for the modal
 */
exports.getAdminJob = asyncHandler(async (req, res) => {
    // We look for the ID that comes from the URL (req.params.id)
    const job = await AdminJob.findById(req.params.id);

    if (!job) {
        return res.status(404).json(new ApiResponse(404, "Job not found"));
    }

    res.status(200).json(
        new ApiResponse(200, "Job retrieved successfully", { job })
    );
});

/**
 * @desc    Update job details from the modal (Save button)
 */
exports.updateAdminJob = asyncHandler(async (req, res) => {
    const job = await AdminJob.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true
    });

    if (!job) {
        return res.status(404).json(new ApiResponse(404, "Job not found"));
    }

    res.status(200).json(
        new ApiResponse(200, "Job updated successfully", { job })
    );
});

/**
 * @desc    Delete job (Remove button)
 */
exports.deleteAdminJob = asyncHandler(async (req, res) => {
    const job = await AdminJob.findByIdAndDelete(req.params.id);

    if (!job) {
        return res.status(404).json(new ApiResponse(404, "Job not found"));
    }

    res.status(200).json(
        new ApiResponse(200, "Job removed successfully", null)
    );
});