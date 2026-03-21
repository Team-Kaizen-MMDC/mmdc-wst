const express = require('express');
const router = express.Router();
const adminJobController = require('../controllers/adminJobController');
const { protect } = require('../middleware/auth'); // or your correct path

// DEBUG LOG
console.log("--- Loading AdminJobRoutes ---");

router
    .route('/')
    .get(protect, adminJobController.getAdminJobs)
    .post(protect, adminJobController.createAdminJob);

// ADD THIS SECTION BELOW
router
    .route('/:id')
    .get(adminJobController.getAdminJob)      // This handles the 404 you are getting
    .patch(adminJobController.updateAdminJob)  // This will handle the Save button later
    .delete(adminJobController.deleteAdminJob);

module.exports = router;