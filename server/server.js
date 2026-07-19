const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');

// Import modular routes
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const agentRoutes = require('./routes/agentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Load environment variables manually
const fs = require('fs');
if (fs.existsSync('.env')) {
  const envText = fs.readFileSync('.env', 'utf8');
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length > 1) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Mount Modular API Routes
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Static Client Hosting and Routing Fallback
const clientDistPath = path.join(__dirname, '../client/dist');
app.use('/CUSTOMER_REGISTRY', express.static(clientDistPath));

app.get('/', (req, res) => {
  res.redirect('/CUSTOMER_REGISTRY/');
});

app.get('/CUSTOMER_REGISTRY/*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Modular Server is running in ${process.env.NODE_ENV || 'production'} mode`);
  console.log(`Backend API URL: http://localhost:${PORT}/api`);
  console.log(`Frontend Application URL: http://localhost:${PORT}/CUSTOMER_REGISTRY/`);
  console.log(`==================================================`);
});
