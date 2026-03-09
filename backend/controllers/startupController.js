const Startup = require('../models/Startup');

// @desc    Create or update startup profile
// @route   POST /api/startups
exports.createOrUpdate = async (req, res) => {
  try {
    let startup = await Startup.findOne({ owner: req.user._id });

    if (startup) {
      startup = await Startup.findByIdAndUpdate(startup._id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      startup = await Startup.create({ ...req.body, owner: req.user._id });
    }

    res.status(201).json({ success: true, data: startup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get own startup
// @route   GET /api/startups/mine
exports.getMine = async (req, res) => {
  try {
    const startup = await Startup.findOne({ owner: req.user._id });
    res.json({ success: true, data: startup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all startups
// @route   GET /api/startups
exports.getAll = async (req, res) => {
  try {
    const startups = await Startup.find().populate('owner', 'fullName email avatarUrl');
    res.json({ success: true, data: startups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single startup
// @route   GET /api/startups/:id
exports.getById = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).populate('owner', 'fullName email avatarUrl');
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    res.json({ success: true, data: startup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
