const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  getUsers,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/users', protect, getUsers);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);

module.exports = router;
