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
  uploadResume,
  getResume,
  deleteResume,
} = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *   post:
 *     summary: Create user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               japaneseLevel:
 *                 type: string
 *                 enum: [N5, N4, N3, N2, N1, Native]
 *     responses:
 *       201:
 *         description: Profile created
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router
  .route("/")
  .get(getProfile)
  .post(createProfile)
  .put(updateProfile)
  .delete(deleteProfile);

/**
 * @swagger
 * /api/v1/profile/education:
 *   post:
 *     summary: Add education entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               school:
 *                 type: string
 *               degree:
 *                 type: string
 *               field:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               current:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Education added
 */
router.route("/education").post(addEducation);

/**
 * @swagger
 * /api/v1/profile/education/{edu_id}:
 *   put:
 *     summary: Update education entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: edu_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Education updated
 *   delete:
 *     summary: Delete education entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: edu_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Education deleted
 */
router.route("/education/:edu_id").put(updateEducation).delete(deleteEducation);

/**
 * @swagger
 * /api/v1/profile/experience:
 *   post:
 *     summary: Add work experience
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               current:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Experience added
 */
router.route("/experience").post(addExperience);

/**
 * @swagger
 * /api/v1/profile/experience/{exp_id}:
 *   put:
 *     summary: Update experience entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exp_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experience updated
 *   delete:
 *     summary: Delete experience entry
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exp_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experience deleted
 */
router
  .route("/experience/:exp_id")
  .put(updateExperience)
  .delete(deleteExperience);

/**
 * @swagger
 * /api/v1/profile/skills:
 *   put:
 *     summary: Update skills
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [Beginner, Intermediate, Advanced, Expert]
 *                     category:
 *                       type: string
 *     responses:
 *       200:
 *         description: Skills updated
 */
router.route("/skills").put(updateSkills);

/**
 * @swagger
 * /api/v1/profile/languages:
 *   put:
 *     summary: Update languages
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Languages updated
 */
router.route("/languages").put(updateLanguages);

/**
 * @swagger
 * /api/v1/profile/certifications:
 *   put:
 *     summary: Update certifications
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certifications updated
 */
router.route("/certifications").put(updateCertifications);

/**
 * @swagger
 * /api/v1/profile/availability:
 *   put:
 *     summary: Update availability preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.route("/availability").put(updateAvailability);

/**
 * @swagger
 * /api/v1/profile/resume:
 *   post:
 *     summary: Upload or overwrite resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume uploaded
 *   get:
 *     summary: Get presigned URL for resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume URL
 */
// Use explicit route handlers to support middleware arrays
// Helper to normalize handler(s) (support arrays exported from controller)
const _ensureHandlers = (h) => (Array.isArray(h) ? h : [h]);

router.post("/resume", ..._ensureHandlers(uploadResume));
router.get("/resume", ..._ensureHandlers(getResume));
router.put("/resume", ..._ensureHandlers(uploadResume));
router.delete("/resume", ..._ensureHandlers(deleteResume));

module.exports = router;
