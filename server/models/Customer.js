const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Define Mongoose Schema and Model
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },

address: {
  type: String,
  trim: true,
  default: ''
},

customerType: {
  type: String,
  enum: ['Individual', 'Business'],
  default: 'Individual'
},

preferences: {
  type: String,
  trim: true,
  default: ''
},

purchaseHistory: [
  {
    product: String,
    amount: Number,
    purchaseDate: Date
  }
],

status: {
  type: String,
  enum: ['Active', 'Inactive', 'Lead'],
  default: 'Lead'
},
    ltv: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const MongooseCustomer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// 2. Local File Database Fallback (JSON-based)
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'customers.json');

// Helper to generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Helper to ensure database file exists
const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // Initial Seed Data for fallback database
    const getPastDate = (monthsAgo, day) => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(day);
      return date;
    };
    const seedData = [
      {
        _id: generateId(),
        name: 'Sarah Connor',
        email: 'sarah.connor@cyberdyne.io',
        phone: '+1 (555) 019-9281',
        company: 'Cyberdyne Systems',
        status: 'Active',
        ltv: 12500.50,
        notes: 'Key stakeholder. Interested in AI security systems.',
        createdAt: getPastDate(5, 12).toISOString(),
        updatedAt: getPastDate(5, 12).toISOString()
      },
      {
        _id: generateId(),
        name: 'John Connor',
        email: 'john.connor@resistance.net',
        phone: '+1 (555) 014-9988',
        company: 'Tech Resistance',
        status: 'Active',
        ltv: 8500.00,
        notes: 'High potential. Prefers encrypted communications.',
        createdAt: getPastDate(4, 18).toISOString(),
        updatedAt: getPastDate(4, 18).toISOString()
      },
      {
        _id: generateId(),
        name: 'Peter Parker',
        email: 'peter.parker@dailybugle.com',
        phone: '+1 (555) 012-3456',
        company: 'Daily Bugle',
        status: 'Lead',
        ltv: 150.00,
        notes: 'Freelance photographer. Inquired about camera equipment insurance.',
        createdAt: getPastDate(3, 5).toISOString(),
        updatedAt: getPastDate(3, 5).toISOString()
      },
      {
        _id: generateId(),
        name: 'Bruce Wayne',
        email: 'bwayne@wayneenterprises.com',
        phone: '+1 (555) 007-1939',
        company: 'Wayne Enterprises',
        status: 'Active',
        ltv: 150000.00,
        notes: 'VIP Customer. Requested custom black armored logistics solutions.',
        createdAt: getPastDate(3, 25).toISOString(),
        updatedAt: getPastDate(3, 25).toISOString()
      },
      {
        _id: generateId(),
        name: 'Clark Kent',
        email: 'ckent@dailyplanet.press',
        phone: '+1 (555) 011-8822',
        company: 'Daily Planet',
        status: 'Inactive',
        ltv: 0.00,
        notes: 'Account suspended. Relocated to Metropolis north branch.',
        createdAt: getPastDate(2, 8).toISOString(),
        updatedAt: getPastDate(2, 8).toISOString()
      },
      {
        _id: generateId(),
        name: 'Diana Prince',
        email: 'diana@themiscira.org',
        phone: '+1 (555) 015-7733',
        company: 'Louvre Antiquities',
        status: 'Active',
        ltv: 24500.00,
        notes: 'Curator. Purchased high-end climate storage units.',
        createdAt: getPastDate(2, 14).toISOString(),
        updatedAt: getPastDate(2, 14).toISOString()
      },
      {
        _id: generateId(),
        name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        phone: '+1 (555) 300-3000',
        company: 'Stark Industries',
        status: 'Active',
        ltv: 250000.00,
        notes: 'Major client. Heavy clean energy and computing purchases.',
        createdAt: getPastDate(1, 2).toISOString(),
        updatedAt: getPastDate(1, 2).toISOString()
      },
      {
        _id: generateId(),
        name: 'Steve Rogers',
        email: 'srogers@brooklyn.mil',
        phone: '+1 (555) 019-1941',
        company: 'US Dept of Defense',
        status: 'Inactive',
        ltv: 1200.00,
        notes: 'Historical consultant. Account set to inactive.',
        createdAt: getPastDate(1, 20).toISOString(),
        updatedAt: getPastDate(1, 20).toISOString()
      },
      {
        _id: generateId(),
        name: 'Selina Kyle',
        email: 'skyle@gothamcats.net',
        phone: '+1 (555) 018-8899',
        company: 'Self-Employed',
        status: 'Lead',
        ltv: 0.00,
        notes: 'Inquired about vault and safe lock specifications.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: generateId(),
        name: 'Barry Allen',
        email: 'ballen@centralcitypd.gov',
        phone: '+1 (555) 012-9981',
        company: 'CCPD Lab Services',
        status: 'Lead',
        ltv: 450.00,
        notes: 'Requested expedited chemical analyzer calibration quote.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }
};

const readJSONData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return [];
  }
};

const writeJSONData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON DB file:', err);
  }
};

// Filter helper
const filterCustomers = (list, query = {}) => {
  const q = query || {};
  return list.filter(item => {
    // Status filter
    if (q.status && item.status !== q.status) return false;
    
    // Search filter
    if (q.$or) {
      const searchRegexes = q.$or.map(cond => {
        const key = Object.keys(cond)[0];
        return { key, val: cond[key].source };
      });
      
      const match = searchRegexes.some(({ key, val }) => {
        if (!item[key]) return false;
        return new RegExp(val, 'i').test(item[key]);
      });
      
      if (!match) return false;
    }
    
    // Email check
    if (q.email && item.email.toLowerCase() !== q.email.toLowerCase()) return false;
    
    return true;
  });
};

// Query Chain class to mimic mongoose query builder
class JSONQueryChain {
  constructor(data) {
    this.data = data;
  }
  sort(sortOptions) {
    const field = Object.keys(sortOptions)[0];
    const direction = sortOptions[field];
    this.data.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return direction === -1 ? 1 : -1;
      if (valA > valB) return direction === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }
  skip(skipNum) {
    this.data = this.data.slice(skipNum);
    return this;
  }
  limit(limitNum) {
    this.data = this.data.slice(0, limitNum);
    return this;
  }
  then(resolve) {
    resolve(this.data);
  }
}

// 3. Database Switcher / Wrapper Object
let useMongoose = false;

const setDbMode = (mode) => {
  useMongoose = mode;
  console.log(`Database engine set to: ${useMongoose ? 'MongoDB (Mongoose)' : 'Local File Fallback (JSON)'}`);
};

const CustomerWrapper = {
  getMode: () => useMongoose ? 'MongoDB' : 'LocalJSON',

  countDocuments: async (query) => {
    if (useMongoose) {
      return MongooseCustomer.countDocuments(query);
    }
    const all = readJSONData();
    const filtered = filterCustomers(all, query);
    return filtered.length;
  },

  find: (query) => {
    if (useMongoose) {
      return MongooseCustomer.find(query);
    }
    const all = readJSONData();
    const filtered = filterCustomers(all, query);
    return new JSONQueryChain(filtered);
  },

  findById: async (id) => {
    if (useMongoose) {
      return MongooseCustomer.findById(id);
    }
    const all = readJSONData();
    const customer = all.find(item => item._id === id);
    if (!customer) return null;
    
    // Add Mongoose-like save method to instances
    return {
      ...customer,
      save: async function() {
        const dataList = readJSONData();
        const index = dataList.findIndex(item => item._id === id);
        if (index !== -1) {
          dataList[index] = {
            ...dataList[index],
            name: this.name,
            email: this.email,
            phone: this.phone,
            company: this.company,
            address: this.address,
            customerType: this.customerType,
            preferences: this.preferences,
            purchaseHistory: this.purchaseHistory,
            status: this.status,
            ltv: this.ltv,
            notes: this.notes,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(dataList);
          return dataList[index];
        }
        return this;
      }
    };
  },

  findOne: async (query) => {
    if (useMongoose) {
      return MongooseCustomer.findOne(query);
    }
    const all = readJSONData();
    const filtered = filterCustomers(all, query);
    if (filtered.length === 0) return null;
    
    const customer = filtered[0];
    return {
      ...customer,
      save: async function() {
        const dataList = readJSONData();
        const index = dataList.findIndex(item => item._id === this._id);
        if (index !== -1) {
          dataList[index] = {
            ...dataList[index],
            name: this.name,
            email: this.email,
            phone: this.phone,
            company: this.company,
            address: this.address,
            customerType: this.customerType,
            preferences: this.preferences,
            purchaseHistory: this.purchaseHistory,
            status: this.status,
            ltv: this.ltv,
            notes: this.notes,
            updatedAt: new Date().toISOString()
          };
          writeJSONData(dataList);
          return dataList[index];
        }
        return this;
      }
    };
  },

  create: async (customerData) => {
    if (useMongoose) {
      return MongooseCustomer.create(customerData);
    }
    const all = readJSONData();
    
    // Check email uniqueness
    const exists = all.some(item => item.email.toLowerCase() === customerData.email.toLowerCase());
    if (exists) {
      throw new Error('Customer with this email already exists');
    }
    
    const newCustomer = {
      _id: generateId(),
      name: customerData.name,
email: customerData.email,
phone: customerData.phone || '',
company: customerData.company || '',

address: customerData.address || '',

customerType: customerData.customerType || 'Individual',

preferences: customerData.preferences || '',

purchaseHistory: customerData.purchaseHistory || [],

status: customerData.status || 'Lead',

ltv: customerData.ltv !== undefined
      ? parseFloat(customerData.ltv)
      : 0,

notes: customerData.notes || '',
    };
    
    all.push(newCustomer);
    writeJSONData(all);
    return newCustomer;
  },

  deleteOne: async (query) => {
    if (useMongoose) {
      return MongooseCustomer.deleteOne(query);
    }
    const id = query._id;
    const all = readJSONData();
    const filtered = all.filter(item => item._id !== id);
    if (all.length === filtered.length) return { deletedCount: 0 };
    writeJSONData(filtered);
    return { deletedCount: 1 };
  },

  aggregate: async (pipeline) => {
    if (useMongoose) {
      return MongooseCustomer.aggregate(pipeline);
    }
    const all = readJSONData();
    
    // 1. Calculate general stats
    let totalLtv = 0;
    let maxLtv = 0;
    all.forEach(item => {
      totalLtv += item.ltv || 0;
      if (item.ltv > maxLtv) maxLtv = item.ltv;
    });
    const avgLtv = all.length > 0 ? totalLtv / all.length : 0;
    
    // 2. Calculate monthly trends (last 6 months)
    // Gather all registration months
    const monthlyGroups = {};
    all.forEach(item => {
      const date = new Date(item.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = { count: 0, ltv: 0, year, month };
      }
      monthlyGroups[key].count += 1;
      monthlyGroups[key].ltv += item.ltv || 0;
    });

    const monthlyTrends = Object.values(monthlyGroups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Check if the pipeline matches the monthlyTrends match (group by year/month) or the general LTV group
    // In customerController.js:
    // First aggregate is for LTV: Group ID is null, sums ltv, avgs ltv, maxs ltv.
    // Second aggregate is for Monthly trend: Match createdAt, group by year/month, sort year/month.
    
    const isLtvStats = pipeline.some(stage => stage.$group && stage.$group.totalLtv);
    
    if (isLtvStats) {
      return [{
        totalLtv,
        avgLtv,
        maxLtv
      }];
    } else {
      // Monthly stats format
      return monthlyTrends.map(item => ({
        _id: { year: item.year, month: item.month },
        count: item.count,
        ltv: item.ltv
      }));
    }
  },

  setDbMode
};

module.exports = CustomerWrapper;
