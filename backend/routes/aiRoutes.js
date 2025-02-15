const express = require('express');
const router = express.Router();
const { generateSummary } = require('../controllers/aiController');
const { protectRoutes } = require('../middleware/authMiddleware');

router.post('/generate-summary', protectRoutes, generateSummary);

module.exports = router; 