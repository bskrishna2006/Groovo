const mongoose = require('mongoose');

const fundingProposalSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
    },
    fundingAmount: { type: String, required: [true, 'Funding amount is required'] },
    fundingStage: { type: String, required: [true, 'Funding stage is required'] },
    equityOffered: { type: String },
    useOfFunds: { type: String, required: [true, 'Use of funds is required'] },
    revenueModel: { type: String },
    marketSize: { type: String },
    competitiveAdvantage: { type: String },
    timeline: { type: String },
    additionalInfo: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'accepted', 'rejected'],
      default: 'submitted',
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    investorNotes: { type: String },
    aiAnalysis: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FundingProposal', fundingProposalSchema);
