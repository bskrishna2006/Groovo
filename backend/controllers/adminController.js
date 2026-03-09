const User = require('../models/User');
const Startup = require('../models/Startup');
const MentorshipRequest = require('../models/MentorshipRequest');
const FundingProposal = require('../models/FundingProposal');
const PatentApplication = require('../models/PatentApplication');
const AuditRequest = require('../models/AuditRequest');
const ForumPost = require('../models/ForumPost');
const Message = require('../models/Message');

// @desc    Get admin platform stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // User counts by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalUsers = await User.countDocuments();

    // Request counts
    const totalMentorships = await MentorshipRequest.countDocuments();
    const totalFunding = await FundingProposal.countDocuments();
    const totalPatents = await PatentApplication.countDocuments();
    const totalAudits = await AuditRequest.countDocuments();
    const totalStartups = await Startup.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Active counts
    const activeMentorships = await MentorshipRequest.countDocuments({ status: 'accepted' });
    const acceptedFunding = await FundingProposal.countDocuments({ status: 'accepted' });
    const approvedPatents = await PatentApplication.countDocuments({ status: 'approved' });
    const completedAudits = await AuditRequest.countDocuments({ status: 'completed' });

    // Recent users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Activity by day (last 7 days)
    const activityByDay = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      const usersJoined = await User.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });
      const messagesCount = await Message.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      activityByDay.push({
        day: dayLabel,
        users: usersJoined,
        messages: messagesCount,
        total: usersJoined + messagesCount,
      });
    }

    // Recent users list
    const recentUsers = await User.find()
      .select('fullName email role createdAt avatarUrl')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisWeek,
        usersByRole: usersByRole.map((r) => ({
          role: r._id === 'patent_officer' ? 'Patent Officer' : r._id.charAt(0).toUpperCase() + r._id.slice(1),
          count: r.count,
        })),
        requests: {
          mentorships: totalMentorships,
          funding: totalFunding,
          patents: totalPatents,
          audits: totalAudits,
        },
        active: {
          mentorships: activeMentorships,
          funding: acceptedFunding,
          patents: approvedPatents,
          audits: completedAudits,
        },
        totalStartups,
        totalForumPosts,
        totalMessages,
        activityByDay,
        recentUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
