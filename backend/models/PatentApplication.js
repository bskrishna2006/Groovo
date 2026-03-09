const mongoose = require('mongoose');

const patentApplicationSchema = new mongoose.Schema(
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
    inventionTitle: { type: String, required: [true, 'Invention title is required'] },
    patentType: { type: String, required: [true, 'Patent type is required'] },
    description: { type: String, required: [true, 'Description is required'] },
    technicalField: { type: String },
    problemSolved: { type: String },
    advantages: { type: String },
    priorArt: { type: String },
    inventors: { type: String },
    urgency: { type: String },
    budget: { type: String },
    services: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    patentOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    officerNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatentApplication', patentApplicationSchema);
