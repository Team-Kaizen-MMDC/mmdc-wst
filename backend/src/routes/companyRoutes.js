const express = require("express");
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  verifyCompany,
  addCompanyAdmin,
  removeCompanyAdmin,
  getCompanyStats,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getCompanies);
router.get("/:idOrSlug", getCompany);

// Protected routes
router.use(protect);

router.post("/", authorize("employer", "admin"), createCompany);
router.put("/:id", authorize("employer", "admin"), updateCompany);
router.delete("/:id", authorize("employer", "admin"), deleteCompany);

// Admin management routes
router.post("/:id/admins", authorize("employer", "admin"), addCompanyAdmin);
router.delete(
  "/:id/admins/:userId",
  authorize("employer", "admin"),
  removeCompanyAdmin,
);

// Admin only routes
router.put("/:id/verify", authorize("admin"), verifyCompany);
router.get("/admin/stats", authorize("admin"), getCompanyStats);

module.exports = router;
