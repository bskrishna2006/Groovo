const express = require('express');
const router = express.Router();
const { create, getAll, updateStatus } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('entrepreneur'), create);
router.get('/', protect, authorize('entrepreneur', 'auditor'), getAll);
router.put('/:id/status', protect, authorize('auditor'), updateStatus);

module.exports = router;
