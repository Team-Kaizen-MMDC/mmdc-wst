// jobRoutes.js

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
const {
  applyToJob,
  getJobApplications,
  getCompanyApplicationsSummary,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");
const { validateApplication } = require("../validators/applicationValidator");

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/company/:companyId", getJobsByCompany);
router.get("/:id", getJob);

// Everything below requires auth
router.use(protect);

router.get("/my/jobs", getMyJobs);
// Aggregated applications summary for employer's company
router.get(
  "/my/applications/summary",
  authorize("employer", "admin"),
  getCompanyApplicationsSummary,
);

router.get("/admin/stats", authorize("admin"), getJobStats);

// Only platform admins can create jobs via this endpoint. Other employer flows still use employer authorization.
router.post("/", authorize("admin"), createJob);
router.put("/:id", authorize("employer", "admin"), updateJob);
router.delete("/:id", authorize("employer", "admin"), deleteJob);

router.post(
  "/:jobId/apply",
  authorize("jobseeker"),
  validateApplication,
  applyToJob,
);

router.get(
  "/:jobId/applications",
  authorize("employer", "admin"),
  getJobApplications,
);

module.exports = router;

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: Get all jobs with filtering and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: prefecture
 *         schema:
 *           type: string
 *         description: Filter by prefecture
 *       - in: query
 *         name: japaneseLevel
 *         schema:
 *           type: string
 *           enum: [N5, N4, N3, N2, N1]
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search
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
 *         description: Jobs retrieved with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                     pagination:
 *                       type: object
 */
router.get("/", getJobs);

/**
 * @swagger
 * /api/v1/jobs/company/{companyId}:
 *   get:
 *     summary: Get all jobs for a specific company
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company jobs retrieved
 */
router.get("/company/:companyId", getJobsByCompany);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get("/:id", getJob);

// Protected routes (Employer)
router.use(protect);

/**
 * @swagger
 * /api/v1/jobs/my/jobs:
 *   get:
 *     summary: Get employer's posted jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer jobs retrieved
 */
router.get("/my/jobs", getMyJobs);

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - title
 *               - industry
 *             properties:
 *               company:
 *                 type: string
 *                 description: Company ID
 *               title:
 *                 type: string
 *               industry:
 *                 type: string
 *               summary:
 *                 type: string
 *               japaneseLevel:
 *                 type: string
 *                 enum: [N5, N4, N3, N2, N1]
 *               compensation:
 *                 type: object
 *                 properties:
 *                   salaryMin:
 *                     type: number
 *                   salaryMax:
 *                     type: number
 *                   currency:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   prefecture:
 *                     type: string
 *                   city:
 *                     type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post("/", authorize("employer", "admin"), createJob);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   put:
 *     summary: Update job posting
 *     tags: [Jobs]
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
 *         description: Job updated
 *   delete:
 *     summary: Delete job posting (soft delete)
 *     tags: [Jobs]
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
 *         description: Job deleted
 */
router.put("/:id", authorize("employer", "admin"), updateJob);
router.delete("/:id", authorize("employer", "admin"), deleteJob);

/**
 * @swagger
 * /api/v1/jobs/admin/stats:
 *   get:
 *     summary: Get job statistics (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job statistics
 */
router.get("/admin/stats", authorize("admin"), getJobStats);

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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 maxLength: 2000
 *               resumePath:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Already applied or job closed
 */
router.post(
  "/:jobId/apply",
  authorize("jobseeker"),
  validateApplication,
  applyToJob,
);

/**
 * @swagger
 * /api/v1/jobs/{jobId}/applications:
 *   get:
 *     summary: Get applications for a job (Employer/Admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Applications retrieved
 */
router.get(
  "/:jobId/applications",
  authorize("employer", "admin"),
  getJobApplications,
);

module.exports = router;
