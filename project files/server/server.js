const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Agent = require('./models/Agent');
const Ticket = require('./models/Ticket');
const Feedback = require('./models/Feedback');

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardStats
} = require('./controllers/customerController');

const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword
} = require('./controllers/userController');

const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require('./controllers/ticketController');

const {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent
} = require('./controllers/agentController');

const {
  getFeedbacks,
  createFeedback
} = require('./controllers/feedbackController');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Seeding Database function
const seedDatabase = async () => {
  try {
    // 1. Seed Customers if empty
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('No customers found. Seeding mock customers...');
      const getPastDate = (monthsAgo, day) => {
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(day);
        return date;
      };

      const mockCustomers = [
        {
          name: 'Sarah Connor',
          email: 'sarah.connor@cyberdyne.io',
          phone: '+1 (555) 019-9281',
          company: 'Cyberdyne Systems',
          status: 'Active',
          ltv: 12500.50,
          notes: 'Key stakeholder. Interested in AI security systems.',
          createdAt: getPastDate(5, 12)
        },
        {
          name: 'John Connor',
          email: 'john.connor@resistance.net',
          phone: '+1 (555) 014-9988',
          company: 'Tech Resistance',
          status: 'Active',
          ltv: 8500.00,
          notes: 'High potential. Prefers encrypted communications.',
          createdAt: getPastDate(4, 18)
        },
        {
          name: 'Peter Parker',
          email: 'peter.parker@dailybugle.com',
          phone: '+1 (555) 012-3456',
          company: 'Daily Bugle',
          status: 'Lead',
          ltv: 150.00,
          notes: 'Freelance photographer. Inquired about camera equipment insurance.',
          createdAt: getPastDate(3, 5)
        },
        {
          name: 'Bruce Wayne',
          email: 'bwayne@wayneenterprises.com',
          phone: '+1 (555) 007-1939',
          company: 'Wayne Enterprises',
          status: 'Active',
          ltv: 150000.00,
          notes: 'VIP Customer. Requested custom black armored logistics solutions.',
          createdAt: getPastDate(3, 25)
        },
        {
          name: 'Clark Kent',
          email: 'ckent@dailyplanet.press',
          phone: '+1 (555) 011-8822',
          company: 'Daily Planet',
          status: 'Inactive',
          ltv: 0.00,
          notes: 'Account suspended. Relocated to Metropolis north branch.',
          createdAt: getPastDate(2, 8)
        },
        {
          name: 'Diana Prince',
          email: 'diana@themiscira.org',
          phone: '+1 (555) 015-7733',
          company: 'Louvre Antiquities',
          status: 'Active',
          ltv: 24500.00,
          notes: 'Curator. Purchased high-end climate storage units.',
          createdAt: getPastDate(2, 14)
        },
        {
          name: 'Tony Stark',
          email: 'tony@starkindustries.com',
          phone: '+1 (555) 300-3000',
          company: 'Stark Industries',
          status: 'Active',
          ltv: 250000.00,
          notes: 'Major client. Heavy clean energy and computing purchases.',
          createdAt: getPastDate(1, 2)
        },
        {
          name: 'Steve Rogers',
          email: 'srogers@brooklyn.mil',
          phone: '+1 (555) 019-1941',
          company: 'US Dept of Defense',
          status: 'Inactive',
          ltv: 1200.00,
          notes: 'Historical consultant. Account set to inactive.',
          createdAt: getPastDate(1, 20)
        },
        {
          name: 'Selina Kyle',
          email: 'skyle@gothamcats.net',
          phone: '+1 (555) 018-8899',
          company: 'Self-Employed',
          status: 'Lead',
          ltv: 0.00,
          notes: 'Inquired about vault and safe lock specifications.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Barry Allen',
          email: 'ballen@centralcitypd.gov',
          phone: '+1 (555) 012-9981',
          company: 'CCPD Lab Services',
          status: 'Lead',
          ltv: 450.00,
          notes: 'Requested expedited chemical analyzer calibration quote.',
          createdAt: new Date()
        }
      ];

      await Customer.insertMany(mockCustomers);
      console.log('Database successfully seeded with customers.');
    }

    // 2. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Seeding mock admin user...');
      await User.create({
        name: 'Gowtham',
        email: 'admin@crm.com',
        phone: '+1 (555) 000-1111',
        password: 'admin123',
        role: 'Manager',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      });
    }

    // 3. Seed Agents
    const agentCount = await Agent.countDocuments();
    if (agentCount === 0) {
      console.log('No agents found. Seeding support agents...');
      await Agent.create({
        name: 'Rahul Kumar',
        email: 'rahul.kumar@crm.io',
        phone: '+1 (555) 014-4455',
        specialty: 'Billing & Subscriptions',
        status: 'Active'
      });
      await Agent.create({
        name: 'Priya Sharma',
        email: 'priya.sharma@crm.io',
        phone: '+1 (555) 017-7788',
        specialty: 'Technical Support',
        status: 'Active'
      });
      await Agent.create({
        name: 'Anil Mehta',
        email: 'anil.mehta@crm.io',
        phone: '+1 (555) 018-8822',
        specialty: 'Enterprise Accounts',
        status: 'Active'
      });
    }

    // 4. Seed Tickets
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      console.log('No tickets found. Seeding tickets...');
      // Find a customer and agent reference if MongoDB is running
      // Since it could be local fallback, the seeders inside wrappers handle local JSON
      // So this is for MongoDB mode.
      const now = new Date();
      await Ticket.create({
        customerId: 'cust_1',
        description: 'Need assistance setting up biometric scanners with AI core integrations.',
        priority: 'Critical',
        status: 'In Progress',
        assignedAgentId: 'agent_2',
        comments: [
          { author: 'Sarah Connor', text: 'I keep getting authorization errors on node-7.' },
          { author: 'Priya Sharma', text: 'I am running configuration patches on the main gateway now.' }
        ],
        timeline: [
          { event: 'Ticket Created', timestamp: now },
          { event: 'Assigned to Priya Sharma', timestamp: now }
        ],
        attachments: [{ filename: 'error_log.txt', url: '/files/error_log.txt' }]
      });
    }

    // 5. Seed Feedback
    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
      console.log('No feedback found. Seeding feedback reviews...');
      await Feedback.create({
        customerId: 'cust_1',
        rating: 5,
        comment: 'Outstanding support security patch setup. Very thorough response.'
      });
      await Feedback.create({
        customerId: 'cust_4',
        rating: 4,
        comment: 'Excellent secure locks, but response delays need optimization.'
      });
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Run seed immediately
seedDatabase();

// API Routes
app.get('/api/customers', getCustomers);
app.get('/api/customers/stats', getDashboardStats);
app.get('/api/customers/:id', getCustomerById);
app.post('/api/customers', createCustomer);
app.put('/api/customers/:id', updateCustomer);
app.delete('/api/customers/:id', deleteCustomer);

// Auth Routes
app.post('/api/users/register', registerUser);
app.post('/api/users/login', loginUser);
app.put('/api/users/profile', updateProfile);
app.put('/api/users/password', changePassword);

// Ticket Routes
app.get('/api/tickets', getTickets);
app.get('/api/tickets/:id', getTicketById);
app.post('/api/tickets', createTicket);
app.put('/api/tickets/:id', updateTicket);
app.delete('/api/tickets/:id', deleteTicket);

// Agent Routes
app.get('/api/agents', getAgents);
app.post('/api/agents', createAgent);
app.put('/api/agents/:id', updateAgent);
app.delete('/api/agents/:id', deleteAgent);

// Feedback Routes
app.get('/api/feedbacks', getFeedbacks);
app.post('/api/feedbacks', createFeedback);

// Default Route
app.get('/', (req, res) => {
  res.send('Customer Registry MERN CRM API is running.');
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
