const mongoose = require('mongoose');

const auditRequestSchema = new mongoose.Schema(
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
    auditType: { type: String, required: [true, 'Audit type is required'] },
    companySize: { type: String },
    industry: { type: String },
    urgency: { type: String },
    budget: { type: String },
    timeline: { type: String },
    auditAreas: [{ type: String }],
    specificConcerns: { type: String },
    expectedOutcome: { type: String },
    additionalInfo: { type: String },
    status: {
      type: String,
      enum: ['requested', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: { type: Number, min: 0, max: 100 },
    recommendations: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditRequest', auditRequestSchema);
