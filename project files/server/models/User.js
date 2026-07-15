const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Manager', 'Agent'], default: 'Agent' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Local File DB Fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // Initial Seed User: admin@crm.com / admin123
    const seedUsers = [
      {
        _id: 'user_admin',
        name: 'Gowtham',
        email: 'admin@crm.com',
        phone: '+1 (555) 000-1111',
        password: 'admin123', // Store plain/hashed mock
        role: 'Manager',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
  }
};

const readJSONData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading User JSON DB:', err);
    return [];
  }
};

const writeJSONData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing User JSON DB:', err);
  }
};

// Database Switcher
let useMongoose = false;

const setDbMode = (mode) => {
  useMongoose = mode;
};

const UserWrapper = {
  getMode: () => useMongoose ? 'MongoDB' : 'LocalJSON',

  countDocuments: async (query = {}) => {
    if (useMongoose) {
      return MongooseUser.countDocuments(query);
    }
    const all = readJSONData();
    // Simple filter
    let list = all;
    if (query.email) {
      list = list.filter(u => u.email.toLowerCase() === query.email.toLowerCase());
    }
    return list.length;
  },

  find: (query = {}) => {
    if (useMongoose) {
      return MongooseUser.find(query);
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
      return MongooseUser.findById(id);
    }
    const all = readJSONData();
    const user = all.find(u => u._id === id);
    if (!user) return null;
    return {
      ...user,
      save: async function() {
        const list = readJSONData();
        const idx = list.findIndex(u => u._id === id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: this.name,
            email: this.email,
            phone: this.phone,
            password: this.password,
            role: this.role,
            avatar: this.avatar,
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
      return MongooseUser.findOne(query);
    }
    const all = readJSONData();
    const user = all.find(u => {
      if (query.$or) {
        return query.$or.some(cond => {
          if (cond.email && u.email.toLowerCase() === cond.email.toLowerCase()) return true;
          if (cond.phone && u.phone && u.phone.toLowerCase() === cond.phone.toLowerCase()) return true;
          return false;
        });
      }
      if (query.email && u.email.toLowerCase() !== query.email.toLowerCase()) return false;
      if (query.phone && u.phone && u.phone.toLowerCase() !== query.phone.toLowerCase()) return false;
      return true;
    });
    if (!user) return null;
    return {
      ...user,
      save: async function() {
        const list = readJSONData();
        const idx = list.findIndex(u => u._id === this._id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: this.name,
            email: this.email,
            phone: this.phone,
            password: this.password,
            role: this.role,
            avatar: this.avatar,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(list);
          return list[idx];
        }
        return this;
      }
    };
  },

  create: async (userData) => {
    if (useMongoose) {
      return MongooseUser.create(userData);
    }
    const all = readJSONData();
    const exists = all.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      _id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      password: userData.password,
      role: userData.role || 'Agent',
      avatar: userData.avatar || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.push(newUser);
    writeJSONData(all);
    return newUser;
  },

  deleteOne: async (query = {}) => {
    if (useMongoose) {
      return MongooseUser.deleteOne(query);
    }
    const id = query._id;
    const all = readJSONData();
    const filtered = all.filter(u => u._id !== id);
    if (all.length === filtered.length) return { deletedCount: 0 };
    writeJSONData(filtered);
    return { deletedCount: 1 };
  },

  setDbMode
};

module.exports = UserWrapper;
