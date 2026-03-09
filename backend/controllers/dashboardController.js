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
      const fundingAll = await FundingProposal.find({ entrepreneur: userId });
      const accepted = fundingAll.filter(f => f.status === 'accepted');
      const patents = await PatentApplication.countDocuments({ entrepreneur: userId });
      const audits = await AuditRequest.find({ entrepreneur: userId, status: 'completed' });
      const avgScore = audits.length > 0
        ? Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length)
        : 0;

      // Calculate funding amounts
      const seedFunded = accepted
        .filter(f => (f.fundingStage || '').toLowerCase().includes('seed'))
        .reduce((sum, f) => sum + (parseFloat(f.fundingAmount) || 0), 0);
      const seriesAFunded = accepted
        .filter(f => (f.fundingStage || '').toLowerCase().includes('series'))
        .reduce((sum, f) => sum + (parseFloat(f.fundingAmount) || 0), 0);

      // Get startup health
      const startup = await Startup.findOne({ owner: userId });

      stats = {
        activeMentors: mentors,
        fundingProposals: fundingAll.length,
        acceptedFunding: accepted.length,
        patentsFiled: patents,
        auditScore: avgScore,
        seedFunded,
        seriesAFunded,
        seedGoal: startup?.seedGoal || 250000,
        seriesAGoal: startup?.seriesAGoal || 1000000,
        startupHealth: startup ? {
          businessPlan: startup.businessPlanStatus || 'pending',
          legalStructure: startup.legalStructureStatus || 'pending',
          ipProtection: startup.ipProtectionStatus || (patents > 0 ? 'in_progress' : 'pending'),
          marketValidation: startup.marketValidationStatus || 'pending',
        } : null,
        // Request statuses
        mentorshipRequests: await MentorshipRequest.find({ entrepreneur: userId })
          .populate('mentor', 'fullName')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        fundingRequests: fundingAll.slice(0, 5),
        patentRequests: await PatentApplication.find({ entrepreneur: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        auditRequests: await AuditRequest.find({ entrepreneur: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      };
    } else if (role === 'investor') {
      const allProposals = await FundingProposal.find({})
        .populate('entrepreneur', 'fullName avatarUrl')
        .populate('startup', 'name industry location employees stage')
        .sort({ createdAt: -1 });

      const myReviewed = allProposals.filter(p => p.investor && p.investor.toString() === userId.toString());
      const myAccepted = myReviewed.filter(p => p.status === 'accepted');

      stats = {
        activeProposals: allProposals.filter(p => p.status === 'submitted').length,
        reviewedProposals: myReviewed.length,
        investmentsMade: myAccepted.length,
        totalInvested: myAccepted.reduce((sum, p) => sum + (parseFloat(p.fundingAmount) || 0), 0),
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
      .limit(20);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get role-specific list data (mentees, audits, patents)
// @route   GET /api/dashboard/role-data
exports.getRoleData = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let data = [];

    if (role === 'mentor') {
      data = await MentorshipRequest.find({ mentor: userId })
        .populate('entrepreneur', 'fullName avatarUrl company')
        .sort({ createdAt: -1 });
      
      // Map to frontend shape
      data = data.map(r => ({
        _id: r._id,
        name: r.entrepreneur?.fullName || 'Unknown',
        company: r.entrepreneur?.company || 'Startup',
        image: r.entrepreneur?.avatarUrl || '',
        status: r.status,
        message: r.message,
        areasOfHelp: r.areasOfHelp,
        createdAt: r.createdAt,
      }));
    } else if (role === 'auditor') {
      data = await AuditRequest.find({ $or: [{ auditor: userId }, { status: 'requested' }] })
        .populate('entrepreneur', 'fullName company')
        .sort({ createdAt: -1 });
      
      data = data.map(r => ({
        _id: r._id,
        company: r.entrepreneur?.company || r.entrepreneur?.fullName || 'Startup',
        type: r.auditType || 'General Audit',
        status: r.status,
        auditAreas: r.auditAreas,
        score: r.score,
        urgency: r.urgency,
        createdAt: r.createdAt,
      }));
    } else if (role === 'patent_officer') {
      data = await PatentApplication.find({ $or: [{ patentOfficer: userId }, { status: 'submitted' }] })
        .populate('entrepreneur', 'fullName company')
        .sort({ createdAt: -1 });
      
      data = data.map(r => ({
        _id: r._id,
        title: r.inventionTitle,
        applicant: r.entrepreneur?.company || r.entrepreneur?.fullName || 'Startup',
        patentType: r.patentType,
        description: r.description,
        status: r.status,
        urgency: r.urgency,
        createdAt: r.createdAt,
      }));
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
