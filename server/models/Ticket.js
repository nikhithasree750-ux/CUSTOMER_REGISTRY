const mongoose = require('mongoose');
const { generateId } = require('../config/db');

const TicketSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('tkt') },
  ticketId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Open' },
  assignedAgentId: { type: String, default: '' },
  comments: [{
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    url: String
  }],
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
