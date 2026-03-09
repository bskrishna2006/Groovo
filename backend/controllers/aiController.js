const Groq = require('groq-sdk');
const Startup = require('../models/Startup');
const MentorshipRequest = require('../models/MentorshipRequest');
const FundingProposal = require('../models/FundingProposal');
const PatentApplication = require('../models/PatentApplication');
const AuditRequest = require('../models/AuditRequest');

// @desc    AI-powered startup health analysis
// @route   POST /api/ai/analyze-startup
exports.analyzeStartup = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY not configured in .env' });
    }

    const userId = req.user._id;

    // Gather all startup data
    const startup = await Startup.findOne({ owner: userId });
    const mentorships = await MentorshipRequest.find({ entrepreneur: userId });
    const funding = await FundingProposal.find({ entrepreneur: userId });
    const patents = await PatentApplication.find({ entrepreneur: userId });
    const audits = await AuditRequest.find({ entrepreneur: userId });

    // Build context for AI
    const startupData = {
      hasStartupProfile: !!startup,
      name: startup?.name || 'Not set',
      industry: startup?.industry || 'Not set',
      stage: startup?.stage || 'Not set',
      employees: startup?.employees || 'Not set',
      businessModel: startup?.businessModel || 'Not set',
      description: startup?.description || 'Not provided',
      fundingGoal: startup?.fundingGoal || 0,
      currentFunding: startup?.currentFunding || 0,
      mentorships: {
        total: mentorships.length,
        accepted: mentorships.filter(m => m.status === 'accepted').length,
        pending: mentorships.filter(m => m.status === 'pending').length,
      },
      funding: {
        total: funding.length,
        accepted: funding.filter(f => f.status === 'accepted').length,
        rejected: funding.filter(f => f.status === 'rejected').length,
        totalAmount: funding.filter(f => f.status === 'accepted').reduce((s, f) => s + (parseFloat(f.fundingAmount) || 0), 0),
      },
      patents: {
        total: patents.length,
        approved: patents.filter(p => p.status === 'approved').length,
        underReview: patents.filter(p => p.status === 'under_review').length,
      },
      audits: {
        total: audits.length,
        completed: audits.filter(a => a.status === 'completed').length,
        avgScore: audits.filter(a => a.score).length > 0
          ? Math.round(audits.filter(a => a.score).reduce((s, a) => s + a.score, 0) / audits.filter(a => a.score).length)
          : null,
      },
    };

    const prompt = `You are a startup advisor AI for the Groovo platform. Analyze the following startup data and provide a comprehensive health assessment.

STARTUP DATA:
${JSON.stringify(startupData, null, 2)}

Provide your analysis in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "overallGrade": "<A+/A/B+/B/C+/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "categories": [
    {
      "name": "Business Foundation",
      "score": <number 0-100>,
      "status": "<strong/moderate/weak>",
      "insight": "<1-2 sentence specific insight>"
    },
    {
      "name": "Funding & Financial Health",
      "score": <number 0-100>,
      "status": "<strong/moderate/weak>",
      "insight": "<1-2 sentence specific insight>"
    },
    {
      "name": "Mentorship & Network",
      "score": <number 0-100>,
      "status": "<strong/moderate/weak>",
      "insight": "<1-2 sentence specific insight>"
    },
    {
      "name": "IP & Innovation",
      "score": <number 0-100>,
      "status": "<strong/moderate/weak>",
      "insight": "<1-2 sentence specific insight>"
    },
    {
      "name": "Compliance & Audit",
      "score": <number 0-100>,
      "status": "<strong/moderate/weak>",
      "insight": "<1-2 sentence specific insight>"
    }
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>",
    "<actionable recommendation 4>"
  ],
  "nextSteps": "<What the entrepreneur should do right now in 1-2 sentences>"
}

Be realistic and constructive. If data is missing, suggest the entrepreneur fill it in. Score based on available data — incomplete profiles should get lower scores. Respond ONLY with the JSON object.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON if wrapped in code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseErr) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to parse AI response',
        raw: responseText 
      });
    }

    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
