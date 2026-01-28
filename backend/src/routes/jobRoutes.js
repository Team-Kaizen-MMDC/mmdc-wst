const express = require("express");
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCompany,
  getMyJobs,
  getJobStats,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/company/:companyId", getJobsByCompany);
router.get("/:id", getJob);

// Protected routes (Employer)
router.use(protect);

router.get("/my/jobs", getMyJobs);
router.post("/", authorize("employer", "admin"), createJob);
router.put("/:id", authorize("employer", "admin"), updateJob);
router.delete("/:id", authorize("employer", "admin"), deleteJob);

// Admin only routes
router.get("/admin/stats", authorize("admin"), getJobStats);

module.exports = router;
