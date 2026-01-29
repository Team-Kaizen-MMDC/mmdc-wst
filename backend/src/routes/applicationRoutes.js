const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getApplication,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus,
  addEmployerNotes,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");
const { validateApplication } = require("../validators/applicationValidator");

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 maxLength: 2000
 *                 example: I am very interested in this position...
 *               resumePath:
 *                 type: string
 *                 example: /uploads/resumes/resume.pdf
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Already applied or job not accepting applications
 *       404:
 *         description: Job not found
 */
// This route will be mounted under /api/v1/jobs in jobRoutes.js
// router.post("/:jobId/apply", authorize("jobseeker"), validateApplication, applyToJob);

/**
 * @swagger
 * /api/v1/applications/me:
 *   get:
 *     summary: Get current user's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, reviewing, interview, offer, accepted, rejected, withdrawn]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get("/me", authorize("jobseeker"), getMyApplications);

/**
 * @swagger
 * /api/v1/applications/{id}:
 *   get:
 *     summary: Get single application details
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application retrieved
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.get("/:id", getApplication);

/**
 * @swagger
 * /api/v1/applications/{id}/withdraw:
 *   put:
 *     summary: Withdraw application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *       400:
 *         description: Cannot withdraw application in current status
 *       403:
 *         description: Not authorized
 */
router.put("/:id/withdraw", authorize("jobseeker"), withdrawApplication);

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   put:
 *     summary: Update application status (Employer/Admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, reviewing, interview, offer, accepted, rejected]
 *               notes:
 *                 type: string
 *               interview:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
 *                   notes:
 *                     type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Not authorized
 */
router.put(
  "/:id/status",
  authorize("employer", "admin"),
  updateApplicationStatus,
);

/**
 * @swagger
 * /api/v1/applications/{id}/notes:
 *   put:
 *     summary: Add employer notes to application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Notes added successfully
 */
router.put("/:id/notes", authorize("employer", "admin"), addEmployerNotes);

module.exports = router;

// Export applyToJob for use in jobRoutes
module.exports.applyToJob = applyToJob;
