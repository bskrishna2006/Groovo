const FundingProposal = require('../models/FundingProposal');
const Notification = require('../models/Notification');
const Startup = require('../models/Startup');
const User = require('../models/User');
const MentorshipRequest = require('../models/MentorshipRequest');
const PatentApplication = require('../models/PatentApplication');
const AuditRequest = require('../models/AuditRequest');
const { sendFundingAccepted } = require('../utils/emailService');

// Helper: Generate AI analysis for a startup
const generateAIAnalysis = async (userId) => {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const startup = await Startup.findOne({ owner: userId });
    const user = await User.findById(userId).select('fullName company bio');
    const mentorships = await MentorshipRequest.find({ entrepreneur: userId });
    const patents = await PatentApplication.find({ entrepreneur: userId });
    const audits = await AuditRequest.find({ entrepreneur: userId });
    const funding = await FundingProposal.find({ entrepreneur: userId });

    const startupData = {
      entrepreneurName: user?.fullName || 'Unknown',
      company: user?.company || startup?.name || 'Not set',
      bio: user?.bio || 'Not provided',
      hasStartupProfile: !!startup,
      startupName: startup?.name || 'Not set',
      industry: startup?.industry || 'Not set',
      stage: startup?.stage || 'Not set',
      employees: startup?.employees || 'Not set',
      businessModel: startup?.businessModel || 'Not set',
      description: startup?.description || 'Not provided',
      location: startup?.location || 'Not set',
      mentorships: {
        total: mentorships.length,
        accepted: mentorships.filter(m => m.status === 'accepted').length,
      },
      fundingHistory: {
        totalProposals: funding.length,
        accepted: funding.filter(f => f.status === 'accepted').length,
      },
      patents: {
        total: patents.length,
        approved: patents.filter(p => p.status === 'approved').length,
      },
      audits: {
        total: audits.length,
        completed: audits.filter(a => a.status === 'completed').length,
        avgScore: audits.filter(a => a.score).length > 0
          ? Math.round(audits.filter(a => a.score).reduce((s, a) => s + a.score, 0) / audits.filter(a => a.score).length)
          : null,
      },
    };

    const prompt = `You are a startup investment analyst AI for the Groovo platform. An entrepreneur is submitting a funding proposal. Analyze their startup data and provide an investment viability assessment for potential investors.

STARTUP DATA:
${JSON.stringify(startupData, null, 2)}

Provide your analysis in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "investmentScore": <number 0-100>,
  "riskLevel": "<low/medium/high>",
  "investmentGrade": "<A+/A/B+/B/C+/C/D/F>",
  "summary": "<2-3 sentence investment assessment for investors>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risks": ["<risk 1>", "<risk 2>"],
  "categories": [
    {
      "name": "Business Viability",
      "score": <number 0-100>,
      "insight": "<1 sentence>"
    },
    {
      "name": "Team & Mentorship",
      "score": <number 0-100>,
      "insight": "<1 sentence>"
    },
    {
      "name": "Market Potential",
      "score": <number 0-100>,
      "insight": "<1 sentence>"
    },
    {
      "name": "IP & Innovation",
      "score": <number 0-100>,
      "insight": "<1 sentence>"
    },
    {
      "name": "Financial Readiness",
      "score": <number 0-100>,
      "insight": "<1 sentence>"
    }
  ],
  "recommendation": "<1-2 sentence overall recommendation for investors>"
}

Be realistic. If data is limited, note that. Respond ONLY with the JSON object.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (err) {
    console.error('AI Analysis Error:', err.message);
    return null;
  }
};

// @desc    Create funding proposal (auto-generates AI analysis)
// @route   POST /api/funding
exports.create = async (req, res) => {
  try {
    const startup = await Startup.findOne({ owner: req.user._id });

    // Create proposal first
    const proposal = await FundingProposal.create({
      ...req.body,
      entrepreneur: req.user._id,
      startup: startup ? startup._id : undefined,
    });

    // Auto-generate AI analysis in background
    generateAIAnalysis(req.user._id).then(async (analysis) => {
      if (analysis) {
        proposal.aiAnalysis = analysis;
        await proposal.save();
        console.log(`[AI] Analysis generated for proposal ${proposal._id}`);
      }
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

    if (req.body.status === 'accepted') {
      const entrepreneur = await User.findById(proposal.entrepreneur);
      if (entrepreneur?.email) {
        sendFundingAccepted(entrepreneur.email, proposal.investorNotes);
      }
    }

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
