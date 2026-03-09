const express = require('express');
const router = express.Router();
const { create, getAll, updateStatus, getMentors } = require('../controllers/mentorshipController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('entrepreneur'), create);
router.get('/', protect, authorize('entrepreneur', 'mentor'), getAll);
router.put('/:id/status', protect, authorize('mentor'), updateStatus);
router.get('/mentors', protect, getMentors);

module.exports = router;
