const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Mongoose Schema
const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    specialty: { type: String, default: 'General Support' },
    status: { type: String, enum: ['Active', 'Inactive', 'On Break'], default: 'Active' },
  },
  { timestamps: true }
);

const MongooseAgent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

// 2. Local File DB Fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'agents.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seedAgents = [
      {
        _id: 'agent_1',
        name: 'Rahul Kumar',
        email: 'rahul.kumar@crm.io',
        phone: '+1 (555) 014-4455',
        specialty: 'Billing & Subscriptions',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'agent_2',
        name: 'Priya Sharma',
        email: 'priya.sharma@crm.io',
        phone: '+1 (555) 017-7788',
        specialty: 'Technical Support',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'agent_3',
        name: 'Anil Mehta',
        email: 'anil.mehta@crm.io',
        phone: '+1 (555) 018-8822',
        specialty: 'Enterprise Accounts',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedAgents, null, 2), 'utf-8');
  }
};

const readJSONData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading Agent JSON DB:', err);
    return [];
  }
};

const writeJSONData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing Agent JSON DB:', err);
  }
};

let useMongoose = false;

const setDbMode = (mode) => {
  useMongoose = mode;
};

const AgentWrapper = {
  getMode: () => useMongoose ? 'MongoDB' : 'LocalJSON',

  countDocuments: async (query = {}) => {
    if (useMongoose) {
      return MongooseAgent.countDocuments(query);
    }
    const all = readJSONData();
    return all.length;
  },

  find: (query = {}) => {
    if (useMongoose) {
      return MongooseAgent.find(query);
    }
    const all = readJSONData();
    return {
      then: (resolve) => {
        resolve(all);
      }
    };
  },

  findById: async (id) => {
    if (useMongoose) {
      return MongooseAgent.findById(id);
    }
    const all = readJSONData();
    const agent = all.find(a => a._id === id);
    if (!agent) return null;
    return {
      ...agent,
      save: async function() {
        const list = readJSONData();
        const idx = list.findIndex(a => a._id === id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: this.name,
            email: this.email,
            phone: this.phone,
            specialty: this.specialty,
            status: this.status,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(list);
          return list[idx];
        }
        return this;
      }
    };
  },

  create: async (agentData) => {
    if (useMongoose) {
      return MongooseAgent.create(agentData);
    }
    const all = readJSONData();
    const exists = all.some(a => a.email.toLowerCase() === agentData.email.toLowerCase());
    if (exists) {
      throw new Error('Agent with this email already exists');
    }

    const newAgent = {
      _id: 'agent_' + Math.random().toString(36).substr(2, 9),
      name: agentData.name,
      email: agentData.email,
      phone: agentData.phone || '',
      specialty: agentData.specialty || 'General Support',
      status: agentData.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.push(newAgent);
    writeJSONData(all);
    return newAgent;
  },

  deleteOne: async (query = {}) => {
    if (useMongoose) {
      return MongooseAgent.deleteOne(query);
    }
    const id = query._id;
    const all = readJSONData();
    const filtered = all.filter(a => a._id !== id);
    if (all.length === filtered.length) return { deletedCount: 0 };
    writeJSONData(filtered);
    return { deletedCount: 1 };
  },

  setDbMode
};

module.exports = AgentWrapper;
