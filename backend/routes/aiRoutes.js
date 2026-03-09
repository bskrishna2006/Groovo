const express = require('express');
const router = express.Router();
const { analyzeStartup } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/analyze-startup', protect, authorize('entrepreneur'), analyzeStartup);

module.exports = router;
