const Feedback = require('../models/Feedback');

// @desc    Get all feedback reviews
// @route   GET /api/feedbacks
// @access  Public
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    // Resolve standard list from Mongoose / JSON wrapper
    let list = [];
    if (feedbacks && typeof feedbacks.then === 'function') {
      list = await new Promise(resolve => feedbacks.then(resolve));
    } else {
      list = feedbacks || [];
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving feedback reviews', error: error.message });
  }
};

// @desc    Create new customer feedback rating
// @route   POST /api/feedbacks
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const { customerId, rating, comment } = req.body;

    if (!customerId || !rating) {
      return res.status(400).json({ message: 'Customer ID and rating value are required' });
    }

    const feedback = await Feedback.create({
      customerId,
      rating: parseInt(rating),
      comment: comment || ''
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: 'Error saving feedback rating', error: error.message });
  }
};

module.exports = {
  getFeedbacks,
  createFeedback
};
