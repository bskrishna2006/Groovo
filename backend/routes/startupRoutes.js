const express = require('express');
const router = express.Router();
const { createOrUpdate, getMine, getAll, getById } = require('../controllers/startupController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('entrepreneur'), createOrUpdate);
router.get('/mine', protect, authorize('entrepreneur'), getMine);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);

module.exports = router;
