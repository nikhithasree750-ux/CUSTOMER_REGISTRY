const mongoose = require('mongoose');

const connectDB = async () => {
  const Customer = require('../models/Customer');
  const User = require('../models/User');
  const Agent = require('../models/Agent');
  const Ticket = require('../models/Ticket');
  const Feedback = require('../models/Feedback');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_registry', {
      serverSelectionTimeoutMS: 3000 // Timeout quickly if MongoDB isn't running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    Customer.setDbMode(true);
    User.setDbMode(true);
    Agent.setDbMode(true);
    Ticket.setDbMode(true);
    Feedback.setDbMode(true);
  } catch (error) {
    console.log('------------------------------------------------------------');
    console.log(`MongoDB Connection Error: ${error.message}`);
    console.log('MongoDB service is not detected or not active locally.');
    console.log('APPLICATION WILL AUTOMATICALLY FALL BACK TO LOCAL JSON STORAGE.');
    console.log('Database Files: server/data/*.json');
    console.log('------------------------------------------------------------');
    Customer.setDbMode(false);
    User.setDbMode(false);
    Agent.setDbMode(false);
    Ticket.setDbMode(false);
    Feedback.setDbMode(false);
  }
};

module.exports = connectDB;
