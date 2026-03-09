const MentorshipRequest = require('../models/MentorshipRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create mentorship request
// @route   POST /api/mentorship
exports.create = async (req, res) => {
  try {
    const request = await MentorshipRequest.create({
      ...req.body,
      entrepreneur: req.user._id,
    });

    // Create notification for the mentor
    await Notification.create({
      user: req.body.mentor,
      title: 'New Mentorship Request',
      message: `${req.user.fullName} has requested mentorship from you.`,
      type: 'mentorship_request',
      relatedId: request._id,
    });

    const populated = await request.populate([
      { path: 'entrepreneur', select: 'fullName email avatarUrl' },
      { path: 'mentor', select: 'fullName email avatarUrl expertise rating sessionsCompleted' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get mentorship requests (for entrepreneur or mentor)
// @route   GET /api/mentorship
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'entrepreneur') {
      filter = { entrepreneur: req.user._id };
    } else if (req.user.role === 'mentor') {
      filter = { mentor: req.user._id };
    }

    const requests = await MentorshipRequest.find(filter)
      .populate('entrepreneur', 'fullName email avatarUrl company')
      .populate('mentor', 'fullName email avatarUrl expertise rating sessionsCompleted')
      .populate('startup', 'name industry stage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update mentorship request status
// @route   PUT /api/mentorship/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = req.body.status;
    await request.save();

    // Notify entrepreneur
    const statusText = req.body.status === 'accepted' ? 'accepted' : 'declined';
    await Notification.create({
      user: request.entrepreneur,
      title: `Mentorship Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `${req.user.fullName} has ${statusText} your mentorship request.`,
      type: 'mentorship_update',
      relatedId: request._id,
    });

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get available mentors
// @route   GET /api/mentors
exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select(
      'fullName email company bio expertise rating sessionsCompleted avatarUrl location'
    );
    res.json({ success: true, data: mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
