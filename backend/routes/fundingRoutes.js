const express = require('express');
const router = express.Router();
const { create, getAll, updateStatus } = require('../controllers/fundingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('entrepreneur'), create);
router.get('/', protect, authorize('entrepreneur', 'investor'), getAll);
router.put('/:id/status', protect, authorize('investor'), updateStatus);

module.exports = router;
