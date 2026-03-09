const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/:userId', protect, getPublicProfile);

module.exports = router;
