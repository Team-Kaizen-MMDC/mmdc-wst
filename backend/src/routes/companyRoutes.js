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
  getMyCompany,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     parameters:
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
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Companies retrieved
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
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 */
router.get("/", getCompanies);

/**
 * @swagger
 * /api/v1/companies/{idOrSlug}:
 *   get:
 *     summary: Get company by ID or slug
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID or slug
 *     responses:
 *       200:
 *         description: Company retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 */

// Private helper route for logged-in employer/admin
router.get("/my-company", protect, getMyCompany);

// Public single company route
router.get("/:idOrSlug", getCompany);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - industry
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tech Innovation Corp
 *               industry:
 *                 type: string
 *                 example: Manufacturing
 *               size:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   prefecture:
 *                     type: string
 *                   city:
 *                     type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created
 */
router.post("/", authorize("employer", "admin"), createCompany);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Companies]
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
 *         description: Company updated
 *   delete:
 *     summary: Delete company
 *     tags: [Companies]
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
 *         description: Company deleted
 */
router.put("/:id", authorize("employer", "admin"), updateCompany);
router.delete("/:id", authorize("employer", "admin"), deleteCompany);

/**
 * @swagger
 * /api/v1/companies/{id}/admins:
 *   post:
 *     summary: Add company admin
 *     tags: [Companies]
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
 *         description: Admin added
 */
router.post("/:id/admins", authorize("employer", "admin"), addCompanyAdmin);

/**
 * @swagger
 * /api/v1/companies/{id}/admins/{userId}:
 *   delete:
 *     summary: Remove company admin
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin removed
 */
router.delete(
  "/:id/admins/:userId",
  authorize("employer", "admin"),
  removeCompanyAdmin,
);

/**
 * @swagger
 * /api/v1/companies/{id}/verify:
 *   put:
 *     summary: Verify company (Admin only)
 *     tags: [Companies]
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
 *         description: Company verified
 */
router.put("/:id/verify", authorize("admin"), verifyCompany);

/**
 * @swagger
 * /api/v1/companies/admin/stats:
 *   get:
 *     summary: Get company statistics (Admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company statistics
 */

router.get("/admin/stats", authorize("admin"), getCompanyStats);

module.exports = router;
