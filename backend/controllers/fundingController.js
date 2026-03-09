const FundingProposal = require('../models/FundingProposal');
const Notification = require('../models/Notification');
const Startup = require('../models/Startup');

// @desc    Create funding proposal
// @route   POST /api/funding
exports.create = async (req, res) => {
  try {
    // Find entrepreneur's startup
    const startup = await Startup.findOne({ owner: req.user._id });

    const proposal = await FundingProposal.create({
      ...req.body,
      entrepreneur: req.user._id,
      startup: startup ? startup._id : undefined,
    });

    const populated = await proposal.populate([
      { path: 'entrepreneur', select: 'fullName email avatarUrl' },
      { path: 'startup', select: 'name industry stage location employees' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get funding proposals
// @route   GET /api/funding
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'entrepreneur') {
      filter = { entrepreneur: req.user._id };
    }
    // Investors see all proposals

    const proposals = await FundingProposal.find(filter)
      .populate('entrepreneur', 'fullName email avatarUrl company')
      .populate('startup', 'name industry stage location employees description')
      .populate('investor', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: proposals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update funding proposal status (by investor)
// @route   PUT /api/funding/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const proposal = await FundingProposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    proposal.status = req.body.status;
    proposal.investor = req.user._id;
    if (req.body.investorNotes) {
      proposal.investorNotes = req.body.investorNotes;
    }
    await proposal.save();

    // Notify entrepreneur
    const statusMap = {
      under_review: 'is reviewing',
      accepted: 'is interested in',
      rejected: 'has passed on',
    };
    const action = statusMap[req.body.status] || 'updated';

    await Notification.create({
      user: proposal.entrepreneur,
      title: 'Funding Proposal Update',
      message: `${req.user.fullName} ${action} your funding proposal.`,
      type: 'funding_update',
      relatedId: proposal._id,
    });

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
