const mongoose = require('mongoose');
const { generateId } = require('../config/db');

const UserSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('user') },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, default: 'Agent' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
