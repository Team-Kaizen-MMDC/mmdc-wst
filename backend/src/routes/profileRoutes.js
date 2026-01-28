const express = require("express");
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  updateSkills,
  updateCertifications,
  updateLanguages,
  updateAvailability,
} = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Main profile routes
router
  .route("/")
  .get(getProfile)
  .post(createProfile)
  .put(updateProfile)
  .delete(deleteProfile);

// Education routes
router.route("/education").post(addEducation);
router.route("/education/:edu_id").put(updateEducation).delete(deleteEducation);

// Experience routes
router.route("/experience").post(addExperience);
router
  .route("/experience/:exp_id")
  .put(updateExperience)
  .delete(deleteExperience);

// Skills, certifications, languages, availability routes
router.route("/skills").put(updateSkills);
router.route("/certifications").put(updateCertifications);
router.route("/languages").put(updateLanguages);
router.route("/availability").put(updateAvailability);

module.exports = router;
