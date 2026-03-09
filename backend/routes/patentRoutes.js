const express = require('express');
const router = express.Router();
const { create, getAll, updateStatus } = require('../controllers/patentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('entrepreneur'), create);
router.get('/', protect, authorize('entrepreneur', 'patent_officer'), getAll);
router.put('/:id/status', protect, authorize('patent_officer'), updateStatus);

module.exports = router;
