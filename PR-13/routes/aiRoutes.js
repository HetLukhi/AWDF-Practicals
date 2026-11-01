const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Practical 13 Core Route: Generate AI Description
router.post('/generate-description', aiController.generateDescription);

// Practical 13 Step 6: Test Failure / Graceful Degradation Path
router.post('/test-failure', aiController.testFailurePath);

module.exports = router;
