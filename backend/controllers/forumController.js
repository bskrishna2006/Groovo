const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');

// @desc    Create forum post
// @route   POST /api/forum/posts
exports.createPost = async (req, res) => {
  try {
    const post = await ForumPost.create({
      ...req.body,
      author: req.user._id,
    });

    const populated = await post.populate('author', 'fullName email avatarUrl company');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all forum posts
// @route   GET /api/forum/posts
exports.getPosts = async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    let sortOption = { createdAt: -1 };

    if (sort === 'most-commented') sortOption = { commentsCount: -1 };
    if (sort === 'trending') sortOption = { likesCount: -1 };

    const posts = await ForumPost.find()
      .populate('author', 'fullName email avatarUrl company')
      .sort(sortOption);

    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single post with comments
// @route   GET /api/forum/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'fullName email avatarUrl company');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'fullName email avatarUrl')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: { post, comments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/forum/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      content: req.body.content,
      parentComment: req.body.parentComment || undefined,
    });

    // Update comments count
    post.commentsCount += 1;
    await post.save();

    const populated = await comment.populate('author', 'fullName email avatarUrl');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle like on post
// @route   POST /api/forum/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const index = post.likes.indexOf(userId);

    if (index > -1) {
      post.likes.splice(index, 1);
      post.likesCount -= 1;
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();
    res.json({ success: true, data: { likesCount: post.likesCount, liked: index === -1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
