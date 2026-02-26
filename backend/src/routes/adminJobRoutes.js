const express = require('express');
const router = express.Router();
const adminJobController = require('../controllers/adminJobController');

// DEBUG LOG
console.log("--- Loading AdminJobRoutes ---");
console.log("Controller methods:", Object.keys(adminJobController));

router
    .route('/')
    .get(adminJobController.getAdminJobs)
    .post(adminJobController.createAdminJob);

module.exports = router;