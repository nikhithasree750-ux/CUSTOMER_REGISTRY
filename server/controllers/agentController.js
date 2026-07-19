const models = require('../models');

exports.getAgents = async (req, res, next) => {
  try {
    const agents = await models.Agent.find({});
    res.json(agents);
  } catch (err) {
    next(err);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { name, email, phone, specialty, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existing = await models.Agent.find({ email });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Agent with this email already registered' });
    }

    const newAgent = await models.Agent.create({
      name,
      email,
      phone: phone || '',
      specialty: specialty || '',
      status: status || 'Active'
    });

    res.status(201).json(newAgent);
  } catch (err) {
    next(err);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await models.Agent.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await models.Agent.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
};
