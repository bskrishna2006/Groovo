const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName role avatarUrl')
      .populate('receiver', 'fullName role avatarUrl');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get conversations list (unique users you've chatted with)
// @route   GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unique user IDs the current user has messaged or been messaged by
    const sentTo = await Message.distinct('receiver', { sender: userId });
    const receivedFrom = await Message.distinct('sender', { receiver: userId });

    // Merge unique user IDs
    const userIdSet = new Set([
      ...sentTo.map(id => id.toString()),
      ...receivedFrom.map(id => id.toString()),
    ]);

    const conversations = [];

    for (const otherUserId of userIdSet) {
      // Get the last message in this conversation
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .populate('sender', 'fullName role avatarUrl')
        .populate('receiver', 'fullName role avatarUrl');

      // Count unread messages from this user
      const unreadCount = await Message.countDocuments({
        sender: otherUserId,
        receiver: userId,
        read: false,
      });

      // Get the other user info
      const otherUser = await User.findById(otherUserId).select('fullName role avatarUrl email');

      if (otherUser && lastMessage) {
        conversations.push({
          user: otherUser,
          lastMessage: {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isMine: lastMessage.sender._id.toString() === userId.toString(),
          },
          unreadCount,
        });
      }
    }

    // Sort by last message time (newest first)
    conversations.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName role avatarUrl')
      .populate('receiver', 'fullName role avatarUrl');

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (for starting new conversations)
// @route   GET /api/messages/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('fullName role avatarUrl email')
      .sort({ role: 1, fullName: 1 });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get total unread message count
// @route   GET /api/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });

    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
