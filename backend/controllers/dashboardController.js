const MentorshipRequest = require('../models/MentorshipRequest');
const FundingProposal = require('../models/FundingProposal');
const PatentApplication = require('../models/PatentApplication');
const AuditRequest = require('../models/AuditRequest');
const Startup = require('../models/Startup');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats based on user role
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let stats = {};

    if (role === 'entrepreneur') {
      const mentors = await MentorshipRequest.countDocuments({ entrepreneur: userId, status: 'accepted' });
      const funding = await FundingProposal.find({ entrepreneur: userId });
      const totalFunding = funding.filter(f => f.status === 'accepted').length;
      const patents = await PatentApplication.countDocuments({ entrepreneur: userId });
      const audits = await AuditRequest.find({ entrepreneur: userId, status: 'completed' });
      const avgScore = audits.length > 0
        ? Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length)
        : 0;

      stats = {
        activeMentors: mentors,
        fundingProposals: funding.length,
        acceptedFunding: totalFunding,
        patentsFiled: patents,
        auditScore: avgScore,
      };
    } else if (role === 'investor') {
      const proposals = await FundingProposal.countDocuments({ status: 'submitted' });
      const reviewed = await FundingProposal.countDocuments({ investor: userId });
      const accepted = await FundingProposal.countDocuments({ investor: userId, status: 'accepted' });

      stats = {
        activeProposals: proposals,
        reviewedProposals: reviewed,
        investmentsMade: accepted,
      };
    } else if (role === 'mentor') {
      const active = await MentorshipRequest.countDocuments({ mentor: userId, status: 'accepted' });
      const completed = await MentorshipRequest.countDocuments({ mentor: userId, status: 'completed' });
      const pending = await MentorshipRequest.countDocuments({ mentor: userId, status: 'pending' });

      stats = {
        activeMentees: active,
        completedSessions: completed,
        pendingRequests: pending,
      };
    } else if (role === 'auditor') {
      const active = await AuditRequest.countDocuments({ auditor: userId, status: { $in: ['assigned', 'in_progress'] } });
      const completed = await AuditRequest.countDocuments({ auditor: userId, status: 'completed' });
      const pending = await AuditRequest.countDocuments({ status: 'requested' });

      stats = {
        activeAudits: active,
        completedAudits: completed,
        pendingRequests: pending,
      };
    } else if (role === 'patent_officer') {
      const active = await PatentApplication.countDocuments({ patentOfficer: userId, status: 'under_review' });
      const completed = await PatentApplication.countDocuments({ patentOfficer: userId, status: { $in: ['approved', 'rejected'] } });
      const pending = await PatentApplication.countDocuments({ status: 'submitted' });

      stats = {
        activeApplications: active,
        completedReviews: completed,
        pendingApplications: pending,
      };
    }

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({ user: userId, read: false });
    stats.unreadNotifications = unreadNotifications;

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get recent activities for current user
// @route   GET /api/dashboard/activities
exports.getActivities = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
