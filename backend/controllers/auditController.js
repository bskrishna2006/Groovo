const AuditRequest = require('../models/AuditRequest');
const Notification = require('../models/Notification');
const Startup = require('../models/Startup');

// @desc    Create audit request
// @route   POST /api/audits
exports.create = async (req, res) => {
  try {
    const startup = await Startup.findOne({ owner: req.user._id });

    const audit = await AuditRequest.create({
      ...req.body,
      entrepreneur: req.user._id,
      startup: startup ? startup._id : undefined,
    });

    const populated = await audit.populate([
      { path: 'entrepreneur', select: 'fullName email avatarUrl' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get audit requests
// @route   GET /api/audits
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'entrepreneur') {
      filter = { entrepreneur: req.user._id };
    }
    // Auditors see all

    const audits = await AuditRequest.find(filter)
      .populate('entrepreneur', 'fullName email avatarUrl company')
      .populate('startup', 'name industry')
      .populate('auditor', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: audits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update audit request status
// @route   PUT /api/audits/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const audit = await AuditRequest.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit request not found' });
    }

    audit.status = req.body.status;
    audit.auditor = req.user._id;
    if (req.body.score !== undefined) audit.score = req.body.score;
    if (req.body.recommendations) audit.recommendations = req.body.recommendations;
    await audit.save();

    // Notify entrepreneur
    await Notification.create({
      user: audit.entrepreneur,
      title: 'Audit Request Update',
      message: `Your audit request has been updated to: ${req.body.status.replace('_', ' ')}.`,
      type: 'audit_update',
      relatedId: audit._id,
    });

    res.json({ success: true, data: audit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
