const PatentApplication = require('../models/PatentApplication');
const Notification = require('../models/Notification');
const Startup = require('../models/Startup');

// @desc    Create patent application
// @route   POST /api/patents
exports.create = async (req, res) => {
  try {
    const startup = await Startup.findOne({ owner: req.user._id });

    const application = await PatentApplication.create({
      ...req.body,
      entrepreneur: req.user._id,
      startup: startup ? startup._id : undefined,
    });

    const populated = await application.populate([
      { path: 'entrepreneur', select: 'fullName email avatarUrl' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get patent applications
// @route   GET /api/patents
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'entrepreneur') {
      filter = { entrepreneur: req.user._id };
    }
    // Patent officers see all

    const applications = await PatentApplication.find(filter)
      .populate('entrepreneur', 'fullName email avatarUrl company')
      .populate('startup', 'name industry')
      .populate('patentOfficer', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update patent application status
// @route   PUT /api/patents/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const application = await PatentApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = req.body.status;
    application.patentOfficer = req.user._id;
    if (req.body.officerNotes) {
      application.officerNotes = req.body.officerNotes;
    }
    await application.save();

    // Notify entrepreneur
    await Notification.create({
      user: application.entrepreneur,
      title: 'Patent Application Update',
      message: `Your patent "${application.inventionTitle}" has been ${req.body.status.replace('_', ' ')}.`,
      type: 'patent_update',
      relatedId: application._id,
    });

    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
