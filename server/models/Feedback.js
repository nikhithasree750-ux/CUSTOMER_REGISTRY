const mongoose = require('mongoose');
const { generateId } = require('../config/db');

const FeedbackSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('fb') },
  customerId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
