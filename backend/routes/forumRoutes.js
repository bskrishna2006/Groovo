const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, addComment, toggleLike } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.post('/posts', protect, createPost);
router.get('/posts', protect, getPosts);
router.get('/posts/:id', protect, getPost);
router.post('/posts/:id/comments', protect, addComment);
router.post('/posts/:id/like', protect, toggleLike);

module.exports = router;
