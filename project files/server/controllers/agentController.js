const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agents', error: error.message });
  }
};

// @desc    Create new support agent
// @route   POST /api/agents
// @access  Public
const createAgent = async (req, res) => {
  try {
    const { name, email, phone, specialty, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const emailExists = await Agent.find({ email });
    // Note: wrapper find returns an object with `then` method if JSON, or mongoose collection.
    // Let's resolve the list to be safe.
    let list = [];
    if (typeof emailExists.then === 'function') {
      list = await new Promise(resolve => emailExists.then(resolve));
    } else {
      list = emailExists;
    }

    if (list.length > 0) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    const agent = await Agent.create({
      name,
      email,
      phone,
      specialty: specialty || 'General Support',
      status: status || 'Active'
    });

    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating support agent', error: error.message });
  }
};

// @desc    Update support agent status / details
// @route   PUT /api/agents/:id
// @access  Public
const updateAgent = async (req, res) => {
  try {
    const { name, email, phone, specialty, status } = req.body;

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (name !== undefined) agent.name = name;
    if (email !== undefined) agent.email = email;
    if (phone !== undefined) agent.phone = phone;
    if (specialty !== undefined) agent.specialty = specialty;
    if (status !== undefined) agent.status = status;

    const updatedAgent = await agent.save();
    res.json(updatedAgent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating support agent', error: error.message });
  }
};

// @desc    Delete support agent
// @route   DELETE /api/agents/:id
// @access  Public
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await Agent.deleteOne({ _id: req.params.id });
    res.json({ message: 'Agent removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting support agent', error: error.message });
  }
};

module.exports = {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent
};
