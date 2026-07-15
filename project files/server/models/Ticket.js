const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Mongoose Schema
const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true }, // Links to Customer Wrapper ID
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    assignedAgentId: { type: String, default: '' }, // Links to Agent Wrapper ID
    comments: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    timeline: [
      {
        event: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    attachments: [
      {
        filename: { type: String },
        url: { type: String }
      }
    ],
    dueDate: { type: Date }
  },
  { timestamps: true }
);

const MongooseTicket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// 2. Local File DB Fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tickets.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const now = new Date();
    const getFutureDate = (hours) => {
      const d = new Date();
      d.setHours(d.getHours() + hours);
      return d.toISOString();
    };
    
    // Seed initial tickets
    const seedTickets = [
      {
        _id: 'tkt_1',
        ticketId: 'TKT-2026-001',
        customerId: 'cust_1', // Sarah Connor
        description: 'Need assistance setting up biometric scanners with AI core integrations.',
        priority: 'Critical',
        status: 'In Progress',
        assignedAgentId: 'agent_2', // Priya Sharma (Technical)
        comments: [
          {
            author: 'Sarah Connor',
            text: 'I keep getting authorization errors on node-7.',
            createdAt: now.toISOString()
          },
          {
            author: 'Priya Sharma',
            text: 'I am running configuration patches on the main gateway now.',
            createdAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString()
          }
        ],
        timeline: [
          { event: 'Ticket Created', timestamp: now.toISOString() },
          { event: 'Assigned to Priya Sharma', timestamp: new Date(now.getTime() + 5 * 60 * 1000).toISOString() },
          { event: 'Patches deployed', timestamp: new Date(now.getTime() + 15 * 60 * 1000).toISOString() }
        ],
        attachments: [
          { filename: 'error_log.txt', url: '/files/error_log.txt' }
        ],
        dueDate: getFutureDate(4), // Critical is 4 hours
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        _id: 'tkt_2',
        ticketId: 'TKT-2026-002',
        customerId: 'cust_4', // Bruce Wayne
        description: 'Armored logistic unit specifications have inconsistent lock timing delays.',
        priority: 'High',
        status: 'Open',
        assignedAgentId: '',
        comments: [],
        timeline: [
          { event: 'Ticket Created', timestamp: now.toISOString() }
        ],
        attachments: [],
        dueDate: getFutureDate(24), // High is 24 hours
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        _id: 'tkt_3',
        ticketId: 'TKT-2026-003',
        customerId: 'cust_3', // Peter Parker
        description: 'Invoice verification issues for monthly camera equipment insurance coverage.',
        priority: 'Medium',
        status: 'Resolved',
        assignedAgentId: 'agent_1', // Rahul Kumar (Billing)
        comments: [
          {
            author: 'Rahul Kumar',
            text: 'Corrected invoice item mismatch. Peter confirmed resolved.',
            createdAt: now.toISOString()
          }
        ],
        timeline: [
          { event: 'Ticket Created', timestamp: now.toISOString() },
          { event: 'Assigned to Rahul Kumar', timestamp: now.toISOString() },
          { event: 'Status changed to Resolved', timestamp: now.toISOString() }
        ],
        attachments: [],
        dueDate: getFutureDate(72), // Medium is 3 days
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedTickets, null, 2), 'utf-8');
  }
};

const readJSONData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading Ticket JSON DB:', err);
    return [];
  }
};

const writeJSONData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing Ticket JSON DB:', err);
  }
};

let useMongoose = false;

const setDbMode = (mode) => {
  useMongoose = mode;
};

const TicketWrapper = {
  getMode: () => useMongoose ? 'MongoDB' : 'LocalJSON',

  countDocuments: async (query = {}) => {
    if (useMongoose) {
      return MongooseTicket.countDocuments(query);
    }
    const all = readJSONData();
    let list = all;
    if (query.status) list = list.filter(t => t.status === query.status);
    if (query.priority) list = list.filter(t => t.priority === query.priority);
    return list.length;
  },

  find: (query = {}) => {
    if (useMongoose) {
      return MongooseTicket.find(query);
    }
    const all = readJSONData();
    let list = all;
    if (query.customerId) list = list.filter(t => t.customerId === query.customerId);
    if (query.status) list = list.filter(t => t.status === query.status);
    if (query.priority) list = list.filter(t => t.priority === query.priority);
    
    return {
      sort: function() { return this; },
      then: (resolve) => {
        resolve(list);
      }
    };
  },

  findById: async (id) => {
    if (useMongoose) {
      return MongooseTicket.findById(id);
    }
    const all = readJSONData();
    const ticket = all.find(t => t._id === id);
    if (!ticket) return null;
    return {
      ...ticket,
      save: async function() {
        const list = readJSONData();
        const idx = list.findIndex(t => t._id === id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            customerId: this.customerId,
            description: this.description,
            priority: this.priority,
            status: this.status,
            assignedAgentId: this.assignedAgentId,
            comments: this.comments,
            timeline: this.timeline,
            attachments: this.attachments,
            dueDate: this.dueDate,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(list);
          return list[idx];
        }
        return this;
      }
    };
  },

  findOne: async (query = {}) => {
    if (useMongoose) {
      return MongooseTicket.findOne(query);
    }
    const all = readJSONData();
    const ticket = all.find(t => {
      if (query.ticketId && t.ticketId !== query.ticketId) return false;
      return true;
    });
    if (!ticket) return null;
    return {
      ...ticket,
      save: async function() {
        const list = readJSONData();
        const idx = list.findIndex(t => t._id === this._id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            customerId: this.customerId,
            description: this.description,
            priority: this.priority,
            status: this.status,
            assignedAgentId: this.assignedAgentId,
            comments: this.comments,
            timeline: this.timeline,
            attachments: this.attachments,
            dueDate: this.dueDate,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(list);
          return list[idx];
        }
        return this;
      }
    };
  },

  create: async (ticketData) => {
    if (useMongoose) {
      return MongooseTicket.create(ticketData);
    }
    const all = readJSONData();
    
    // Generate SLA date
    let slaHours = 72; // default 3 days
    if (ticketData.priority === 'Critical') slaHours = 4;
    else if (ticketData.priority === 'High') slaHours = 24;
    else if (ticketData.priority === 'Medium') slaHours = 72;
    else if (ticketData.priority === 'Low') slaHours = 168; // 7 days

    const due = new Date();
    due.setHours(due.getHours() + slaHours);

    const ticketCount = all.length + 1;
    const formattedId = `TKT-2026-${String(ticketCount).padStart(3, '0')}`;

    const newTicket = {
      _id: 'tkt_' + Math.random().toString(36).substr(2, 9),
      ticketId: formattedId,
      customerId: ticketData.customerId,
      description: ticketData.description,
      priority: ticketData.priority || 'Medium',
      status: ticketData.status || 'Open',
      assignedAgentId: ticketData.assignedAgentId || '',
      comments: ticketData.comments || [],
      timeline: ticketData.timeline || [{ event: 'Ticket Created', timestamp: new Date().toISOString() }],
      attachments: ticketData.attachments || [],
      dueDate: ticketData.dueDate || due.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.push(newTicket);
    writeJSONData(all);
    return newTicket;
  },

  deleteOne: async (query = {}) => {
    if (useMongoose) {
      return MongooseTicket.deleteOne(query);
    }
    const id = query._id;
    const all = readJSONData();
    const filtered = all.filter(t => t._id !== id);
    if (all.length === filtered.length) return { deletedCount: 0 };
    writeJSONData(filtered);
    return { deletedCount: 1 };
  },

  setDbMode
};

module.exports = TicketWrapper;
