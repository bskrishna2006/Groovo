const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
    },
    areasOfHelp: [{ type: String }],
    message: { type: String, required: [true, 'Message is required'] },
    expectedDuration: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
