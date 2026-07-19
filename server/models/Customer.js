const mongoose = require('mongoose');
const { generateId } = require('../config/db');

const CustomerSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('cust') },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  status: { type: String, default: 'Lead' },
  ltv: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  notesList: [{
    id: { type: String, default: () => generateId('n') },
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  purchaseHistory: [{
    id: { type: String, default: () => generateId('p') },
    item: String,
    price: Number,
    date: { type: Date, default: Date.now }
  }],
  interactions: [{
    id: { type: String, default: () => generateId('i') },
    type: { type: String }, // Mongoose fix for reserved 'type' keyword
    summary: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
