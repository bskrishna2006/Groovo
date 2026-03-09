const express = require('express');
const router = express.Router();
const { getStats, getActivities, getRoleData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/activities', protect, getActivities);
router.get('/role-data', protect, getRoleData);

module.exports = router;
