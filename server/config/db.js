const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/customer_registry';
const DATA_DIR = path.join(__dirname, '../data');

let isMongo = false;

const generateId = (prefix) => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

const getJSONPath = (collectionName) => path.join(DATA_DIR, `${collectionName}.json`);

const readJSON = (collectionName) => {
  const filePath = getJSONPath(collectionName);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${collectionName}.json:`, err);
    return [];
  }
};

const writeJSON = (collectionName, data) => {
  const filePath = getJSONPath(collectionName);
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${collectionName}.json:`, err);
  }
};

const seedMongo = async () => {
  try {
    const User = mongoose.model('User');
    const Agent = mongoose.model('Agent');
    const Customer = mongoose.model('Customer');
    const Ticket = mongoose.model('Ticket');
    const Feedback = mongoose.model('Feedback');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding MongoDB database from JSON data files...');
      const users = readJSON('users');
      const agents = readJSON('agents');
      const customers = readJSON('customers');
      const tickets = readJSON('tickets');
      const feedbacks = readJSON('feedbacks');

      if (users.length > 0) await User.insertMany(users);
      if (agents.length > 0) await Agent.insertMany(agents);
      if (customers.length > 0) await Customer.insertMany(customers);
      if (tickets.length > 0) await Ticket.insertMany(tickets);
      if (feedbacks.length > 0) await Feedback.insertMany(feedbacks);

      console.log('MongoDB seeding finished successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    isMongo = true;
    console.log('MongoDB connected successfully. Running in MongoDB mode.');
    await seedMongo();
  } catch (err) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not connect to MongoDB. Activating local JSON file database fallback.');
    isMongo = false;
  }
};

module.exports = {
  connectDB,
  generateId,
  readJSON,
  writeJSON,
  getIsMongo: () => isMongo
};
