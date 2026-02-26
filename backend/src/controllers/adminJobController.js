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