const User = require('../models/User');

// @desc    Update own profile
// @route   PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['fullName', 'bio', 'company', 'location', 'avatarUrl', 'expertise', 'phone'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get own profile
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get public profile of another user
// @route   GET /api/profile/:userId
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('fullName role bio company location avatarUrl expertise rating sessionsCompleted');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
