const models = require('../models');

exports.getTickets = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const filter = {};
    if (customerId) {
      filter.customerId = customerId;
    }
    const tickets = await models.Ticket.find(filter);
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { customerId, description, priority, status, assignedAgentId, dueDate } = req.body;
    if (!customerId || !description) {
      return res.status(400).json({ message: 'Customer ID and description are required' });
    }

    const newTicket = await models.Ticket.create({
      customerId,
      description,
      priority: priority || 'Medium',
      status: status || 'Open',
      assignedAgentId: assignedAgentId || '',
      dueDate: dueDate || new Date(Date.now() + 1440 * 60 * 1000).toISOString()
    });

    // Auto log interaction
    await models.Customer.findByIdAndUpdate(customerId, {
      $push: {
        interactions: {
          type: 'Ticket',
          summary: `Support Ticket created: ${newTicket.ticketId}`,
        }
      }
    });

    res.status(201).json(newTicket);
  } catch (err) {
    next(err);
  }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await models.Ticket.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await models.Ticket.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};
