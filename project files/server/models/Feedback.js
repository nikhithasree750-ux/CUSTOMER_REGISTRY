const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Mongoose Schema
const feedbackSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true }, // Links to Customer Wrapper ID
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const MongooseFeedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// 2. Local File DB Fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'feedbacks.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seedFeedbacks = [
      {
        _id: 'fb_1',
        customerId: 'cust_1', // Sarah Connor
        rating: 5,
        comment: 'Outstanding support security patch setup. Very thorough response.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'fb_2',
        customerId: 'cust_4', // Bruce Wayne
        rating: 4,
        comment: 'Excellent secure locks, but response delays need optimization.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'fb_3',
        customerId: 'cust_3', // Peter Parker
        rating: 5,
        comment: 'Super fast billing resolution. Helpful agent support!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedFeedbacks, null, 2), 'utf-8');
  }
};

const readJSONData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading Feedback JSON DB:', err);
    return [];
  }
};

const writeJSONData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing Feedback JSON DB:', err);
  }
};

let useMongoose = false;

const setDbMode = (mode) => {
  useMongoose = mode;
};

const FeedbackWrapper = {
  getMode: () => useMongoose ? 'MongoDB' : 'LocalJSON',

  countDocuments: async (query = {}) => {
    if (useMongoose) {
      return MongooseFeedback.countDocuments(query);
    }
    const all = readJSONData();
    return all.length;
  },

  find: (query = {}) => {
    if (useMongoose) {
      return MongooseFeedback.find(query);
    }
    const all = readJSONData();
    let list = all;
    if (query.customerId) list = list.filter(f => f.customerId === query.customerId);
    
    return {
      then: (resolve) => {
        resolve(list);
      }
    };
  },

  findById: async (id) => {
    if (useMongoose) {
      return MongooseFeedback.findById(id);
    }
    const all = readJSONData();
    const fb = all.find(f => f._id === id);
    if (!fb) return null;
    return fb;
  },

  create: async (feedbackData) => {
    if (useMongoose) {
      return MongooseFeedback.create(feedbackData);
    }
    const all = readJSONData();

    const newFb = {
      _id: 'fb_' + Math.random().toString(36).substr(2, 9),
      customerId: feedbackData.customerId,
      rating: parseInt(feedbackData.rating),
      comment: feedbackData.comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.push(newFb);
    writeJSONData(all);
    return newFb;
  },

  deleteOne: async (query = {}) => {
    if (useMongoose) {
      return MongooseFeedback.deleteOne(query);
    }
    const id = query._id;
    const all = readJSONData();
    const filtered = all.filter(f => f._id !== id);
    if (all.length === filtered.length) return { deletedCount: 0 };
    writeJSONData(filtered);
    return { deletedCount: 1 };
  },

  setDbMode
};

module.exports = FeedbackWrapper;
