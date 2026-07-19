const mongoose = require('mongoose');
const { generateId } = require('../config/db');

const AgentSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('agent') },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  specialty: { type: String, default: '' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
