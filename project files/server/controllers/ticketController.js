const Ticket = require('../models/Ticket');

// @desc    Get all tickets with filtering, search, pagination
// @route   GET /api/tickets
// @access  Public
const getTickets = async (req, res) => {
  try {
    const { search, status, priority, agentId, customerId } = req.query;

    const tickets = await Ticket.find();
    let filteredTickets = tickets;

    // Filter by customerId
    if (customerId) {
      filteredTickets = filteredTickets.filter(t => t.customerId === customerId);
    }

    // Filter by status
    if (status && status !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }

    // Filter by agentId
    if (agentId && agentId !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.assignedAgentId === agentId);
    }

    // Filter by search (searches ticketId, description)
    if (search) {
      const q = search.toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.ticketId.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      tickets: filteredTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tickets', error: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Public
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving ticket', error: error.message });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Public
const createTicket = async (req, res) => {
  try {
    const { customerId, description, priority, assignedAgentId } = req.body;

    if (!customerId || !description) {
      return res.status(400).json({ message: 'Customer ID and description are required' });
    }

    const ticket = await Ticket.create({
      customerId,
      description,
      priority: priority || 'Medium',
      assignedAgentId: assignedAgentId || '',
      comments: [],
      timeline: [{ event: 'Ticket Created', timestamp: new Date().toISOString() }],
      attachments: []
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error creating ticket', error: error.message });
  }
};

// @desc    Update ticket (status, priority, agent, comments, timeline, attachments)
// @route   PUT /api/tickets/:id
// @access  Public
const updateTicket = async (req, res) => {
  try {
    const { description, priority, status, assignedAgentId, comments, timeline, attachments, newComment } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Set timeline changes if status/agent changes
    const originalStatus = ticket.status;
    const originalAgent = ticket.assignedAgentId;

    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) {
      ticket.priority = priority;
      
      // Re-calculate SLA due date if priority changed
      let slaHours = 72;
      if (priority === 'Critical') slaHours = 4;
      else if (priority === 'High') slaHours = 24;
      else if (priority === 'Medium') slaHours = 72;
      else if (priority === 'Low') slaHours = 168;

      const due = new Date();
      due.setHours(due.getHours() + slaHours);
      ticket.dueDate = due.toISOString();
      
      ticket.timeline.push({
        event: `Priority updated to ${priority}`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (status !== undefined && status !== originalStatus) {
      ticket.status = status;
      ticket.timeline.push({
        event: `Status changed to ${status}`,
        timestamp: new Date().toISOString()
      });
    }

    if (assignedAgentId !== undefined && assignedAgentId !== originalAgent) {
      ticket.assignedAgentId = assignedAgentId;
      ticket.timeline.push({
        event: assignedAgentId ? `Ticket Assigned` : `Ticket Unassigned`,
        timestamp: new Date().toISOString()
      });
    }

    if (comments !== undefined) ticket.comments = comments;
    if (timeline !== undefined) ticket.timeline = timeline;
    if (attachments !== undefined) ticket.attachments = attachments;

    // Handle single new comment addition
    if (newComment && newComment.author && newComment.text) {
      ticket.comments.push({
        author: newComment.author,
        text: newComment.text,
        createdAt: new Date().toISOString()
      });
      ticket.timeline.push({
        event: `Comment added by ${newComment.author}`,
        timestamp: new Date().toISOString()
      });
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Public
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await Ticket.deleteOne({ _id: req.params.id });
    res.json({ message: 'Ticket removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};
