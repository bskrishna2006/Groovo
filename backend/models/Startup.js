const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: { type: String, required: [true, 'Description is required'] },
    industry: { type: String, required: [true, 'Industry is required'] },
    stage: {
      type: String,
      enum: ['idea', 'mvp', 'early-revenue', 'growth', 'scale'],
    },
    employees: { type: String },
    website: { type: String },
    location: { type: String },
    foundedYear: { type: Number },
    businessModel: { type: String },
    fundingGoal: { type: Number, default: 0 },
    currentFunding: { type: Number, default: 0 },
    pitchDeckUrl: { type: String },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Startup', startupSchema);
