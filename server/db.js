const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper to load env variables manually if dotenv is not present
const loadEnv = () => {
  if (fs.existsSync('.env')) {
    const envText = fs.readFileSync('.env', 'utf8');
    envText.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length > 1) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
};
loadEnv();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/customer_registry';
const DATA_DIR = path.join(__dirname, 'data');

let isMongo = false;

// Custom ID Generator matching client
const generateId = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

// Define Schemas
const UserSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('user') },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

const AgentSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('agent') },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  specialty: { type: String, default: '' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

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
    type: { type: String },
    summary: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

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

const FeedbackSchema = new mongoose.Schema({
  _id: { type: String, default: () => generateId('fb') },
  customerId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });

// Models
const User = mongoose.model('User', UserSchema);
const Agent = mongoose.model('Agent', AgentSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// JSON file database helpers
const getJSONPath = (collectionName) => path.join(DATA_DIR, `${collectionName}.json`);

const readJSON = (collectionName) => {
  const filePath = getJSONPath(collectionName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${collectionName}.json, returning empty array:`, err);
    return [];
  }
};

const writeJSON = (collectionName, data) => {
  const filePath = getJSONPath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${collectionName}.json:`, err);
  }
};

// Seed MongoDB database with JSON seed files
const seedMongo = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding MongoDB database from local JSON files...');
      const usersData = readJSON('users');
      const agentsData = readJSON('agents');
      const customersData = readJSON('customers');
      const ticketsData = readJSON('tickets');
      const feedbacksData = readJSON('feedbacks');

      if (usersData.length > 0) await User.insertMany(usersData);
      if (agentsData.length > 0) await Agent.insertMany(agentsData);
      if (customersData.length > 0) await Customer.insertMany(customersData);
      if (ticketsData.length > 0) await Ticket.insertMany(ticketsData);
      if (feedbacksData.length > 0) await Feedback.insertMany(feedbacksData);

      console.log('MongoDB seeding completed successfully.');
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    // Connect with a 3-second timeout so it falls back quickly if MongoDB is offline
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongo = true;
    console.log('Successfully connected to MongoDB! Primary database activated.');
    await seedMongo();
  } catch (err) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not connect to MongoDB. Activating local JSON file database fallback.');
    isMongo = false;
  }
};

// Database CRUD interface mapping dynamically
const dbService = {
  // Users
  users: {
    find: async (filter = {}) => {
      if (isMongo) return await User.find(filter).lean();
      const users = readJSON('users');
      return users.filter(u => {
        return Object.entries(filter).every(([key, val]) => u[key] === val);
      });
    },
    findOne: async (filter = {}) => {
      if (isMongo) return await User.findOne(filter).lean();
      const users = readJSON('users');
      return users.find(u => {
        return Object.entries(filter).every(([key, val]) => u[key] === val);
      }) || null;
    },
    findById: async (id) => {
      if (isMongo) return await User.findById(id).lean();
      const users = readJSON('users');
      return users.find(u => u._id === id) || null;
    },
    create: async (data) => {
      if (isMongo) {
        const u = new User(data);
        return (await u.save()).toObject();
      }
      const users = readJSON('users');
      const newUser = {
        _id: data._id || generateId('user'),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        role: data.role || 'Agent',
        avatar: data.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJSON('users', users);
      return newUser;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongo) return await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const users = readJSON('users');
      const idx = users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      users[idx] = {
        ...users[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJSON('users', users);
      return users[idx];
    }
  },

  // Agents
  agents: {
    find: async (filter = {}) => {
      if (isMongo) return await Agent.find(filter).lean();
      const agents = readJSON('agents');
      return agents.filter(a => {
        return Object.entries(filter).every(([key, val]) => a[key] === val);
      });
    },
    create: async (data) => {
      if (isMongo) {
        const a = new Agent(data);
        return (await a.save()).toObject();
      }
      const agents = readJSON('agents');
      const newAgent = {
        _id: data._id || generateId('agent'),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        specialty: data.specialty || '',
        status: data.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      agents.push(newAgent);
      writeJSON('agents', agents);
      return newAgent;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongo) return await Agent.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const agents = readJSON('agents');
      const idx = agents.findIndex(a => a._id === id);
      if (idx === -1) return null;
      agents[idx] = {
        ...agents[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJSON('agents', agents);
      return agents[idx];
    },
    findByIdAndDelete: async (id) => {
      if (isMongo) return await Agent.findByIdAndDelete(id).lean();
      const agents = readJSON('agents');
      const idx = agents.findIndex(a => a._id === id);
      if (idx === -1) return null;
      const deleted = agents.splice(idx, 1)[0];
      writeJSON('agents', agents);
      return deleted;
    }
  },

  // Customers
  customers: {
    find: async (filter = {}, options = {}) => {
      if (isMongo) {
        let query = Customer.find(filter);
        if (options.sort) query = query.sort(options.sort);
        if (options.skip) query = query.skip(options.skip);
        if (options.limit) query = query.limit(options.limit);
        return await query.lean();
      }
      // Offline fallback processing
      let customers = readJSON('customers');
      // Apply filters
      let filtered = customers.filter(c => {
        return Object.entries(filter).every(([key, val]) => {
          if (key === '$or') {
            return val.some(subFilter => {
              return Object.entries(subFilter).every(([subKey, subVal]) => {
                if (subVal instanceof RegExp) {
                  return subVal.test(c[subKey]);
                }
                return c[subKey] === subVal;
              });
            });
          }
          return c[key] === val;
        });
      });

      // Apply sorting
      if (options.sort) {
        const sortEntries = Object.entries(options.sort);
        filtered.sort((a, b) => {
          for (const [key, direction] of sortEntries) {
            const valA = a[key];
            const valB = b[key];
            if (valA < valB) return direction === 1 ? -1 : 1;
            if (valA > valB) return direction === 1 ? 1 : -1;
          }
          return 0;
        });
      }

      // Apply pagination
      const skip = options.skip || 0;
      const limit = options.limit || filtered.length;
      return filtered.slice(skip, skip + limit);
    },
    countDocuments: async (filter = {}) => {
      if (isMongo) return await Customer.countDocuments(filter);
      const customers = readJSON('customers');
      return customers.filter(c => {
        return Object.entries(filter).every(([key, val]) => {
          if (key === '$or') {
            return val.some(subFilter => {
              return Object.entries(subFilter).every(([subKey, subVal]) => {
                if (subVal instanceof RegExp) {
                  return subVal.test(c[subKey]);
                }
                return c[subKey] === subVal;
              });
            });
          }
          return c[key] === val;
        });
      }).length;
    },
    findById: async (id) => {
      if (isMongo) return await Customer.findById(id).lean();
      const customers = readJSON('customers');
      return customers.find(c => c._id === id) || null;
    },
    create: async (data) => {
      if (isMongo) {
        const c = new Customer(data);
        return (await c.save()).toObject();
      }
      const customers = readJSON('customers');
      const newCust = {
        _id: data._id || generateId('cust'),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        status: data.status || 'Lead',
        ltv: data.ltv || 0,
        notes: data.notes || '',
        notesList: data.notesList || [],
        purchaseHistory: data.purchaseHistory || [],
        interactions: data.interactions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      customers.push(newCust);
      writeJSON('customers', customers);
      return newCust;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongo) return await Customer.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const customers = readJSON('customers');
      const idx = customers.findIndex(c => c._id === id);
      if (idx === -1) return null;
      
      // Mongoose-like $push operators or standard overrides
      let updatedFields = { ...updateData };
      
      // Manual implementation of sub-array pushing for local storage
      if (updateData.$push) {
        const pushKey = Object.keys(updateData.$push)[0];
        const pushVal = updateData.$push[pushKey];
        if (!customers[idx][pushKey]) customers[idx][pushKey] = [];
        
        // Generate nested item ID
        const nestedItem = {
          id: pushVal.id || generateId(pushKey[0]),
          ...pushVal,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        };
        customers[idx][pushKey].push(nestedItem);
        delete updatedFields.$push;
      }

      customers[idx] = {
        ...customers[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      writeJSON('customers', customers);
      return customers[idx];
    },
    findByIdAndDelete: async (id) => {
      if (isMongo) return await Customer.findByIdAndDelete(id).lean();
      const customers = readJSON('customers');
      const idx = customers.findIndex(c => c._id === id);
      if (idx === -1) return null;
      const deleted = customers.splice(idx, 1)[0];
      writeJSON('customers', customers);
      return deleted;
    }
  },

  // Tickets
  tickets: {
    find: async (filter = {}) => {
      if (isMongo) return await Ticket.find(filter).lean();
      const tickets = readJSON('tickets');
      return tickets.filter(t => {
        return Object.entries(filter).every(([key, val]) => t[key] === val);
      });
    },
    countDocuments: async (filter = {}) => {
      if (isMongo) return await Ticket.countDocuments(filter);
      const tickets = readJSON('tickets');
      return tickets.filter(t => {
        return Object.entries(filter).every(([key, val]) => t[key] === val);
      }).length;
    },
    create: async (data) => {
      if (isMongo) {
        const t = new Ticket(data);
        return (await t.save()).toObject();
      }
      const tickets = readJSON('tickets');
      const nextIdNum = tickets.length + 1;
      const ticketId = data.ticketId || `TKT-2026-${String(nextIdNum).padStart(3, '0')}`;
      const newTicket = {
        _id: data._id || generateId('tkt'),
        ticketId: ticketId,
        customerId: data.customerId,
        description: data.description,
        priority: data.priority || 'Medium',
        status: data.status || 'Open',
        assignedAgentId: data.assignedAgentId || '',
        comments: data.comments || [],
        timeline: data.timeline || [{ event: 'Ticket Created', timestamp: new Date().toISOString() }],
        attachments: data.attachments || [],
        dueDate: data.dueDate || new Date(Date.now() + 1440 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tickets.push(newTicket);
      writeJSON('tickets', tickets);
      return newTicket;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongo) return await Ticket.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const tickets = readJSON('tickets');
      const idx = tickets.findIndex(t => t._id === id);
      if (idx === -1) return null;

      let updatedFields = { ...updateData };

      // Handle Mongoose push
      if (updateData.$push) {
        const pushKey = Object.keys(updateData.$push)[0];
        const pushVal = updateData.$push[pushKey];
        if (!tickets[idx][pushKey]) tickets[idx][pushKey] = [];
        tickets[idx][pushKey].push({
          ...pushVal,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        });
        delete updatedFields.$push;
      }

      tickets[idx] = {
        ...tickets[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      writeJSON('tickets', tickets);
      return tickets[idx];
    },
    findByIdAndDelete: async (id) => {
      if (isMongo) return await Ticket.findByIdAndDelete(id).lean();
      const tickets = readJSON('tickets');
      const idx = tickets.findIndex(t => t._id === id);
      if (idx === -1) return null;
      const deleted = tickets.splice(idx, 1)[0];
      writeJSON('tickets', tickets);
      return deleted;
    }
  },

  // Feedbacks
  feedbacks: {
    find: async (filter = {}) => {
      if (isMongo) return await Feedback.find(filter).lean();
      const feedbacks = readJSON('feedbacks');
      return feedbacks.filter(f => {
        return Object.entries(filter).every(([key, val]) => f[key] === val);
      });
    },
    create: async (data) => {
      if (isMongo) {
        const f = new Feedback(data);
        return (await f.save()).toObject();
      }
      const feedbacks = readJSON('feedbacks');
      const newFb = {
        _id: data._id || generateId('fb'),
        customerId: data.customerId,
        rating: Number(data.rating),
        comment: data.comment || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      feedbacks.push(newFb);
      writeJSON('feedbacks', feedbacks);
      return newFb;
    }
  }
};

module.exports = {
  connectDB,
  dbService,
  getIsMongo: () => isMongo
};
