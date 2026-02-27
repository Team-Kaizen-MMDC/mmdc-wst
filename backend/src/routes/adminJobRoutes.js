const express = require('express');
const router = express.Router();
const adminJobController = require('../controllers/adminJobController');

// DEBUG LOG
console.log("--- Loading AdminJobRoutes ---");

router
    .route('/')
    .get(adminJobController.getAdminJobs)
    .post(adminJobController.createAdminJob);

// ADD THIS SECTION BELOW
router
    .route('/:id')
    .get(adminJobController.getAdminJob)      // This handles the 404 you are getting
    .patch(adminJobController.updateAdminJob)  // This will handle the Save button later
    .delete(adminJobController.deleteAdminJob);

module.exports = router;