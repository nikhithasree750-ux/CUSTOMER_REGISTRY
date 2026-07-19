const models = require('../models');

exports.getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await models.Feedback.find({});
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    const { customerId, rating, comment } = req.body;
    if (!customerId || !rating) {
      return res.status(400).json({ message: 'Customer ID and rating are required' });
    }

    const newFb = await models.Feedback.create({
      customerId,
      rating: Number(rating),
      comment: comment || ''
    });

    // Append to customer interactions
    await models.Customer.findByIdAndUpdate(customerId, {
      $push: {
        interactions: {
          type: 'Call',
          summary: `Submitted star feedback: "${comment || ''}" (${rating} Stars)`
        }
      }
    });

    res.status(201).json(newFb);
  } catch (err) {
    next(err);
  }
};
