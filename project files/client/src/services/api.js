import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isOfflineMode = false;

// Mock Seeds helper for LTV date calculations
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// CRM SEED DATA SHEETS
const INITIAL_USERS = [
  {
    _id: 'user_admin',
    name: 'Gowtham',
    email: 'admin@crm.com',
    phone: '+1 (555) 000-1111',
    password: 'admin123',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: getPastDate(30),
    updatedAt: getPastDate(30)
  }
];

const INITIAL_AGENTS = [
  {
    _id: 'agent_1',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@crm.io',
    phone: '+1 (555) 014-4455',
    specialty: 'Billing & Subscriptions',
    status: 'Active',
    createdAt: getPastDate(20),
    updatedAt: getPastDate(20)
  },
  {
    _id: 'agent_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@crm.io',
    phone: '+1 (555) 017-7788',
    specialty: 'Technical Support',
    status: 'Active',
    createdAt: getPastDate(20),
    updatedAt: getPastDate(20)
  },
  {
    _id: 'agent_3',
    name: 'Anil Mehta',
    email: 'anil.mehta@crm.io',
    phone: '+1 (555) 018-8822',
    specialty: 'Enterprise Accounts',
    status: 'Active',
    createdAt: getPastDate(20),
    updatedAt: getPastDate(20)
  }
];

const INITIAL_CUSTOMERS = [
  {
    _id: 'cust_1',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    phone: '+1 (555) 019-9281',
    company: 'Cyberdyne Systems',
    status: 'Active',
    ltv: 12500.50,
    notes: 'Key stakeholder. Interested in AI security systems.',
    notesList: [
      { id: 'n1', author: 'Gowtham', text: 'Key stakeholder. Interested in AI security systems.', createdAt: getPastDate(15) },
      { id: 'n2', author: 'Priya Sharma', text: 'Requested specialized training schedule details.', createdAt: getPastDate(10) }
    ],
    purchaseHistory: [
      { id: 'p1', item: 'Tactical Support System', price: 12000, date: getPastDate(45) },
      { id: 'p2', item: 'Climate Storage Units', price: 500.50, date: getPastDate(20) }
    ],
    interactions: [
      { id: 'i1', type: 'Call', summary: 'Discussed AI gate authorization patches.', date: getPastDate(15) },
      { id: 'i2', type: 'Meeting', summary: 'Reviewed climate lockers specs.', date: getPastDate(10) }
    ],
    createdAt: getPastDate(50),
    updatedAt: getPastDate(10),
  },
  {
    _id: 'cust_2',
    name: 'John Connor',
    email: 'john.connor@resistance.net',
    phone: '+1 (555) 014-9988',
    company: 'Tech Resistance',
    status: 'Active',
    ltv: 8500.00,
    notes: 'High potential. Prefers encrypted communications.',
    notesList: [
      { id: 'n3', author: 'Gowtham', text: 'High potential. Prefers encrypted communications.', createdAt: getPastDate(12) }
    ],
    purchaseHistory: [
      { id: 'p3', item: 'Encryption License Suite', price: 8500.00, date: getPastDate(25) }
    ],
    interactions: [
      { id: 'i3', type: 'Email', summary: 'Sent details about license tokens.', date: getPastDate(12) }
    ],
    createdAt: getPastDate(40),
    updatedAt: getPastDate(12),
  },
  {
    _id: 'cust_3',
    name: 'Peter Parker',
    email: 'peter.parker@dailybugle.com',
    phone: '+1 (555) 012-3456',
    company: 'Daily Bugle',
    status: 'Lead',
    ltv: 150.00,
    notes: 'Freelance photographer. Inquired about camera equipment insurance.',
    notesList: [
      { id: 'n4', author: 'Rahul Kumar', text: 'Freelance photographer. Inquired about camera equipment insurance.', createdAt: getPastDate(8) }
    ],
    purchaseHistory: [
      { id: 'p4', item: 'Camera Equipment Insurance', price: 150.00, date: getPastDate(8) }
    ],
    interactions: [
      { id: 'i4', type: 'Call', summary: 'Inquired about camera equipment insurance quotes.', date: getPastDate(8) }
    ],
    createdAt: getPastDate(30),
    updatedAt: getPastDate(8),
  },
  {
    _id: 'cust_4',
    name: 'Bruce Wayne',
    email: 'bwayne@wayneenterprises.com',
    phone: '+1 (555) 007-1939',
    company: 'Wayne Enterprises',
    status: 'Active',
    ltv: 150000.00,
    notes: 'VIP Customer. Requested custom black armored logistics solutions.',
    notesList: [
      { id: 'n5', author: 'Gowtham', text: 'VIP Customer. Requested custom black armored logistics solutions.', createdAt: getPastDate(5) }
    ],
    purchaseHistory: [
      { id: 'p5', item: 'Armored Logistics Container', price: 150000.00, date: getPastDate(5) }
    ],
    interactions: [
      { id: 'i5', type: 'Meeting', summary: 'Discussed armored logistics requirements.', date: getPastDate(5) }
    ],
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
  },
  {
    _id: 'cust_5',
    name: 'Clark Kent',
    email: 'ckent@dailyplanet.press',
    phone: '+1 (555) 011-8822',
    company: 'Daily Planet',
    status: 'Inactive',
    ltv: 0.00,
    notes: 'Account suspended. Relocated to Metropolis north branch.',
    notesList: [
      { id: 'n6', author: 'Rahul Kumar', text: 'Account suspended. Relocated to Metropolis north branch.', createdAt: getPastDate(4) }
    ],
    purchaseHistory: [],
    interactions: [
      { id: 'i6', type: 'Email', summary: 'Suspended notification email dispatched.', date: getPastDate(4) }
    ],
    createdAt: getPastDate(20),
    updatedAt: getPastDate(4),
  }
];

const INITIAL_TICKETS = [
  {
    _id: 'tkt_1',
    ticketId: 'TKT-2026-001',
    customerId: 'cust_1',
    description: 'Need assistance setting up biometric scanners with AI core integrations.',
    priority: 'Critical',
    status: 'In Progress',
    assignedAgentId: 'agent_2',
    comments: [
      { author: 'Sarah Connor', text: 'I keep getting authorization errors on node-7.', createdAt: getPastDate(2) },
      { author: 'Priya Sharma', text: 'I am running configuration patches on the main gateway now.', createdAt: getPastDate(1) }
    ],
    timeline: [
      { event: 'Ticket Created', timestamp: getPastDate(2) },
      { event: 'Assigned to Priya Sharma', timestamp: getPastDate(2) },
      { event: 'Patches deployed', timestamp: getPastDate(1) }
    ],
    attachments: [
      { filename: 'error_log.txt', url: '#' }
    ],
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h
    createdAt: getPastDate(2),
    updatedAt: getPastDate(1)
  },
  {
    _id: 'tkt_2',
    ticketId: 'TKT-2026-002',
    customerId: 'cust_4',
    description: 'Armored logistic unit specifications have inconsistent lock timing delays.',
    priority: 'High',
    status: 'Open',
    assignedAgentId: '',
    comments: [],
    timeline: [
      { event: 'Ticket Created', timestamp: getPastDate(1) }
    ],
    attachments: [],
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    createdAt: getPastDate(1),
    updatedAt: getPastDate(1)
  },
  {
    _id: 'tkt_3',
    ticketId: 'TKT-2026-003',
    customerId: 'cust_3',
    description: 'Invoice verification issues for monthly camera equipment insurance coverage.',
    priority: 'Medium',
    status: 'Resolved',
    assignedAgentId: 'agent_1',
    comments: [
      { author: 'Rahul Kumar', text: 'Corrected invoice item mismatch. Peter confirmed resolved.', createdAt: getPastDate(1) }
    ],
    timeline: [
      { event: 'Ticket Created', timestamp: getPastDate(3) },
      { event: 'Assigned to Rahul Kumar', timestamp: getPastDate(3) },
      { event: 'Status changed to Resolved', timestamp: getPastDate(1) }
    ],
    attachments: [],
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 150).toISOString(), // Overdue past
    createdAt: getPastDate(3),
    updatedAt: getPastDate(1)
  }
];

const INITIAL_FEEDBACKS = [
  {
    _id: 'fb_1',
    customerId: 'cust_1',
    rating: 5,
    comment: 'Outstanding support security patch setup. Very thorough response.',
    createdAt: getPastDate(5),
    updatedAt: getPastDate(5)
  },
  {
    _id: 'fb_2',
    customerId: 'cust_4',
    rating: 4,
    comment: 'Excellent secure locks, but response delays need optimization.',
    createdAt: getPastDate(2),
    updatedAt: getPastDate(2)
  }
];

// Local Storage Getters & Setters
const getLocalCollection = (key, seedData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(data);
};

const saveLocalCollection = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize Notifications array to track activities
const INITIAL_ACTIVITIES = [
  { id: 'act_1', text: 'John Connor registered as new customer', timestamp: getPastDate(40) },
  { id: 'act_2', text: 'Rahul Kumar resolved Ticket TKT-2026-003', timestamp: getPastDate(1) },
  { id: 'act_3', text: 'Sarah Connor submitted a 5-star review', timestamp: getPastDate(5) }
];
const getLocalActivities = () => getLocalCollection('crm_activities', INITIAL_ACTIVITIES);
const addLocalActivity = (text) => {
  const acts = getLocalActivities();
  acts.unshift({
    id: 'act_' + Math.random().toString(36).substr(2, 9),
    text,
    timestamp: new Date().toISOString()
  });
  saveLocalCollection('crm_activities', acts);
};

// Check connection helper
export const checkServerConnection = async () => {
  try {
    await axios.get(`${API_URL}/customers/stats`, { timeout: 2500 });
    isOfflineMode = false;
    return { online: true, mode: 'MERN Online' };
  } catch (err) {
    isOfflineMode = true;
    return { online: false, mode: 'Offline Fallback' };
  }
};

export const isOffline = () => isOfflineMode;

export const api = {
  // 1. MOCK GLOBAL SEARCH
  globalSearch: async (query) => {
    if (!query) return { customers: [], tickets: [], agents: [], feedbacks: [] };
    const q = query.toLowerCase();

    // Pull datasets
    const customers = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const tickets = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const agents = getLocalCollection('crm_agents', INITIAL_AGENTS);
    const feedbacks = getLocalCollection('crm_feedbacks', INITIAL_FEEDBACKS);

    const matchedCustomers = customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q)));
    const matchedTickets = tickets.filter(t => t.ticketId.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    const matchedAgents = agents.filter(a => a.name.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q));
    const matchedFeedbacks = feedbacks.filter(f => f.comment && f.comment.toLowerCase().includes(q));

    return {
      customers: matchedCustomers,
      tickets: matchedTickets,
      agents: matchedAgents,
      feedbacks: matchedFeedbacks
    };
  },

  // 2. ACTIVITIES & NOTIFICATIONS
  getActivities: async () => {
    return getLocalActivities();
  },

  // 3. USER MANAGEMENT (Register & Login)
  registerUser: async (userData) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/users/register', userData);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const users = getLocalCollection('crm_users', INITIAL_USERS);
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) throw new Error('User with this email already registered');

    const newUser = {
      _id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      password: userData.password,
      role: userData.role || 'Agent',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveLocalCollection('crm_users', users);
    addLocalActivity(`New user ${userData.name} registered`);
    return newUser;
  },

  loginUser: async (email, password) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/users/login', { email, password });
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const users = getLocalCollection('crm_users', INITIAL_USERS);
    const user = users.find(u => 
      (u.email.toLowerCase() === email.toLowerCase() || (u.phone && u.phone.toLowerCase() === email.toLowerCase())) && 
      u.password === password
    );
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  updateProfile: async (id, data) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.put('/users/profile', { id, ...data });
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const users = getLocalCollection('crm_users', INITIAL_USERS);
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...data };
    saveLocalCollection('crm_users', users);
    return users[idx];
  },

  changePassword: async (id, currentPassword, newPassword) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.put('/users/password', { id, currentPassword, newPassword });
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const users = getLocalCollection('crm_users', INITIAL_USERS);
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) throw new Error('User not found');
    if (users[idx].password !== currentPassword) throw new Error('Incorrect current password');
    users[idx].password = newPassword;
    saveLocalCollection('crm_users', users);
    return { message: 'Password changed' };
  },

  // 4. CUSTOMER SERVICES
  getCustomers: async (params = {}) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.get('/customers', { params });
        // Inject offline-like purchaseHistory and notes fallback data if backend doesn't schema support it
        const serverCustomers = res.data.customers || [];
        const localCustomers = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
        const mapped = serverCustomers.map(sc => {
          const match = localCustomers.find(lc => lc.email.toLowerCase() === sc.email.toLowerCase());
          return {
            ...sc,
            purchaseHistory: match?.purchaseHistory || [],
            interactions: match?.interactions || [],
            notesList: match?.notesList || []
          };
        });
        return { ...res.data, customers: mapped };
      } catch (err) {
        isOfflineMode = true;
      }
    }

    const { search, status, sort, page = 1, limit = 10 } = params;
    let list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);

    if (status && status !== 'All') {
      list = list.filter(c => c.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q)));
    }

    if (sort) {
      const [field, order] = sort.split(':');
      const modifier = order === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        let valA = a[field] ?? '';
        let valB = b[field] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        return valA < valB ? -1 * modifier : (valA > valB ? 1 * modifier : 0);
      });
    }

    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      customers: paginated,
      pagination: {
        total: list.length,
        page,
        pages: Math.ceil(list.length / limit),
        limit
      }
    };
  },

  getCustomerById: async (id) => {
    const list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const customer = list.find(c => c._id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  createCustomer: async (customerData) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/customers', customerData);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    if (list.some(c => c.email.toLowerCase() === customerData.email.toLowerCase())) {
      throw new Error('Customer already exists');
    }

    const newCust = {
      _id: 'cust_' + Math.random().toString(36).substr(2, 9),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || '',
      company: customerData.company || '',
      status: customerData.status || 'Lead',
      ltv: customerData.ltv ? parseFloat(customerData.ltv) : 0,
      notes: customerData.notes || '',
      notesList: [{ id: 'n_' + Date.now(), author: 'Gowtham', text: customerData.notes || 'Registered', createdAt: new Date().toISOString() }],
      purchaseHistory: [
        { id: 'p_' + Date.now(), item: 'Starter Support Plan', price: 300, date: new Date().toISOString() }
      ],
      interactions: [{ id: 'i_' + Date.now(), type: 'Meeting', summary: 'Customer registered onboarding.', date: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newCust);
    saveLocalCollection('crm_customers', list);
    addLocalActivity(`Customer registered: ${customerData.name}`);
    return newCust;
  },

  updateCustomer: async (id, data) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.put(`/customers/${id}`, data);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const idx = list.findIndex(c => c._id === id);
    if (idx === -1) throw new Error('Customer not found');
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    saveLocalCollection('crm_customers', list);
    return list[idx];
  },

  addCustomerNote: async (id, text, author = 'Gowtham') => {
    const list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const idx = list.findIndex(c => c._id === id);
    if (idx === -1) throw new Error('Customer not found');
    
    if (!list[idx].notesList) list[idx].notesList = [];
    list[idx].notesList.push({
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      author,
      text,
      createdAt: new Date().toISOString()
    });
    
    if (!list[idx].interactions) list[idx].interactions = [];
    list[idx].interactions.push({
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      type: 'Note',
      summary: `Internal agent note added: "${text}"`,
      date: new Date().toISOString()
    });

    saveLocalCollection('crm_customers', list);
    addLocalActivity(`Agent ${author} added note to customer ${list[idx].name}`);
    return list[idx];
  },

  deleteCustomer: async (id) => {
    if (!isOfflineMode) {
      try {
        await apiClient.delete(`/customers/${id}`);
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const initial = list.length;
    const filtered = list.filter(c => c._id !== id);
    if (filtered.length === initial) throw new Error('Customer not found');
    saveLocalCollection('crm_customers', filtered);
    addLocalActivity(`Removed customer account ID: ${id}`);
    return { message: 'Removed' };
  },

  // 5. SUPPORT TICKETS SERVICES
  getTickets: async (params = {}) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.get('/tickets', { params });
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const { search, status, priority, agentId, customerId } = params;
    let list = getLocalCollection('crm_tickets', INITIAL_TICKETS);

    if (customerId) list = list.filter(t => t.customerId === customerId);
    if (status && status !== 'All') list = list.filter(t => t.status === status);
    if (priority && priority !== 'All') list = list.filter(t => t.priority === priority);
    if (agentId && agentId !== 'All') list = list.filter(t => t.assignedAgentId === agentId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.ticketId.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    
    // Sort newest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { tickets: list };
  },

  getTicketById: async (id) => {
    const list = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const ticket = list.find(t => t._id === id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  },

  createTicket: async (ticketData) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/tickets', ticketData);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const ticketCount = list.length + 1;
    const formattedId = `TKT-2026-${String(ticketCount).padStart(3, '0')}`;

    // SLA Due Date calculation
    let dueHours = 72;
    if (ticketData.priority === 'Critical') dueHours = 4;
    else if (ticketData.priority === 'High') dueHours = 24;
    else if (ticketData.priority === 'Medium') dueHours = 72;
    else if (ticketData.priority === 'Low') dueHours = 168;

    const due = new Date();
    due.setHours(due.getHours() + dueHours);

    const newTicket = {
      _id: 'tkt_' + Math.random().toString(36).substr(2, 9),
      ticketId: formattedId,
      customerId: ticketData.customerId,
      description: ticketData.description,
      priority: ticketData.priority || 'Medium',
      status: ticketData.status || 'Open',
      assignedAgentId: ticketData.assignedAgentId || '',
      comments: [],
      timeline: [{ event: 'Ticket Created', timestamp: new Date().toISOString() }],
      attachments: ticketData.attachments || [],
      dueDate: due.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    list.push(newTicket);
    saveLocalCollection('crm_tickets', list);
    
    // Add interaction to customer
    const customers = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex(c => c._id === ticketData.customerId);
    if (cIdx !== -1) {
      if (!customers[cIdx].interactions) customers[cIdx].interactions = [];
      customers[cIdx].interactions.push({
        id: 'i_' + Date.now(),
        type: 'Ticket',
        summary: `Support Ticket created: ${formattedId}`,
        date: new Date().toISOString()
      });
      saveLocalCollection('crm_customers', customers);
    }

    addLocalActivity(`New Support Ticket ${formattedId} created`);
    return newTicket;
  },

  updateTicket: async (id, data) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.put(`/tickets/${id}`, data);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const idx = list.findIndex(t => t._id === id);
    if (idx === -1) throw new Error('Ticket not found');

    const originalStatus = list[idx].status;
    const originalAgent = list[idx].assignedAgentId;

    let updated = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    if (!updated.timeline) updated.timeline = [];

    // Track status change events
    if (data.status && data.status !== originalStatus) {
      updated.timeline.push({ event: `Status updated to ${data.status}`, timestamp: new Date().toISOString() });
      addLocalActivity(`Ticket ${updated.ticketId} changed status to ${data.status}`);
    }
    
    // Track agent assignment events
    if (data.assignedAgentId !== undefined && data.assignedAgentId !== originalAgent) {
      const agents = getLocalCollection('crm_agents', INITIAL_AGENTS);
      const agent = agents.find(a => a._id === data.assignedAgentId);
      const agentName = agent ? agent.name : 'Unassigned';
      updated.timeline.push({ event: `Ticket assigned to ${agentName}`, timestamp: new Date().toISOString() });
      addLocalActivity(`Ticket ${updated.ticketId} assigned to ${agentName}`);
    }

    // Handle new comments
    if (data.newComment) {
      if (!updated.comments) updated.comments = [];
      updated.comments.push({
        author: data.newComment.author,
        text: data.newComment.text,
        createdAt: new Date().toISOString()
      });
      updated.timeline.push({ event: `Comment added by ${data.newComment.author}`, timestamp: new Date().toISOString() });
    }

    list[idx] = updated;
    saveLocalCollection('crm_tickets', list);
    return updated;
  },

  deleteTicket: async (id) => {
    if (!isOfflineMode) {
      try {
        await apiClient.delete(`/tickets/${id}`);
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const filtered = list.filter(t => t._id !== id);
    saveLocalCollection('crm_tickets', filtered);
    return { message: 'Removed' };
  },

  // 6. SUPPORT AGENTS SERVICES
  getAgents: async () => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.get('/agents');
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    return getLocalCollection('crm_agents', INITIAL_AGENTS);
  },

  createAgent: async (agentData) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/agents', agentData);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_agents', INITIAL_AGENTS);
    if (list.some(a => a.email.toLowerCase() === agentData.email.toLowerCase())) {
      throw new Error('Agent with this email already registered');
    }

    const newAgent = {
      _id: 'agent_' + Math.random().toString(36).substr(2, 9),
      name: agentData.name,
      email: agentData.email,
      phone: agentData.phone || '',
      specialty: agentData.specialty || 'Technical Support',
      status: agentData.status || 'Active',
      createdAt: new Date().toISOString()
    };
    list.push(newAgent);
    saveLocalCollection('crm_agents', list);
    addLocalActivity(`New Agent hired: ${agentData.name}`);
    return newAgent;
  },

  updateAgent: async (id, data) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.put(`/agents/${id}`, data);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_agents', INITIAL_AGENTS);
    const idx = list.findIndex(a => a._id === id);
    if (idx === -1) throw new Error('Agent not found');
    list[idx] = { ...list[idx], ...data };
    saveLocalCollection('crm_agents', list);
    return list[idx];
  },

  deleteAgent: async (id) => {
    if (!isOfflineMode) {
      try {
        await apiClient.delete(`/agents/${id}`);
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_agents', INITIAL_AGENTS);
    const filtered = list.filter(a => a._id !== id);
    saveLocalCollection('crm_agents', filtered);
    return { message: 'Removed' };
  },

  // 7. FEEDBACK REVIEWS SERVICES
  getFeedbacks: async () => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.get('/feedbacks');
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    return getLocalCollection('crm_feedbacks', INITIAL_FEEDBACKS);
  },

  createFeedback: async (feedbackData) => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.post('/feedbacks', feedbackData);
        return res.data;
      } catch (err) {
        isOfflineMode = true;
      }
    }
    const list = getLocalCollection('crm_feedbacks', INITIAL_FEEDBACKS);
    const newFb = {
      _id: 'fb_' + Math.random().toString(36).substr(2, 9),
      customerId: feedbackData.customerId,
      rating: parseInt(feedbackData.rating),
      comment: feedbackData.comment || '',
      createdAt: new Date().toISOString()
    };
    list.push(newFb);
    saveLocalCollection('crm_feedbacks', list);

    // Save interaction to customer
    const customers = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex(c => c._id === feedbackData.customerId);
    if (cIdx !== -1) {
      if (!customers[cIdx].interactions) customers[cIdx].interactions = [];
      customers[cIdx].interactions.push({
        id: 'i_' + Date.now(),
        type: 'Feedback',
        summary: `Submitted star feedback: "${feedbackData.comment || ''}" (${feedbackData.rating} Stars)`,
        date: new Date().toISOString()
      });
      saveLocalCollection('crm_customers', customers);
      
      addLocalActivity(`${customers[cIdx].name} submitted a ${feedbackData.rating}-star review`);
    }

    return newFb;
  },

  // 8. UPGRADED STATS COMPUTATIONS (SLA timers, closure rates, ratings, open tickets counts)
  getStats: async () => {
    if (!isOfflineMode) {
      try {
        const res = await apiClient.get('/customers/stats');
        // Fetch tickets and feedbacks to extend server stats details
        const ticketsData = await api.getTickets();
        const feedbacksData = await api.getFeedbacks();
        
        const allTickets = ticketsData.tickets || [];
        const openTickets = allTickets.filter(t => t.status === 'Open').length;
        const assignedTickets = allTickets.filter(t => t.status === 'Assigned').length;
        const progressTickets = allTickets.filter(t => t.status === 'In Progress').length;
        const resolvedTickets = allTickets.filter(t => t.status === 'Resolved').length;
        const closedTickets = allTickets.filter(t => t.status === 'Closed').length;
        const criticalTickets = allTickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed').length;

        // SLA Overdue count
        const now = new Date();
        const overdueTickets = allTickets.filter(t => 
          t.status !== 'Resolved' && t.status !== 'Closed' && t.dueDate && new Date(t.dueDate) < now
        ).length;

        // Feedbacks scoring
        let totalRating = 0;
        feedbacksData.forEach(f => totalRating += f.rating || 0);
        const avgRating = feedbacksData.length > 0 ? Math.round((totalRating / feedbacksData.length) * 10) / 10 : 4.8;

        return {
          ...res.data,
          ticketStats: {
            total: allTickets.length,
            open: openTickets,
            assigned: assignedTickets,
            inProgress: progressTickets,
            resolved: resolvedTickets,
            closed: closedTickets,
            pending: openTickets + assignedTickets + progressTickets,
            critical: criticalTickets,
            overdue: overdueTickets,
            avgRating
          }
        };
      } catch (err) {
        isOfflineMode = true;
      }
    }

    // Offline Stats computation
    const customersList = getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    const ticketsList = getLocalCollection('crm_tickets', INITIAL_TICKETS);
    const feedbacksList = getLocalCollection('crm_feedbacks', INITIAL_FEEDBACKS);

    const totalCusts = customersList.length;
    const activeCusts = customersList.filter(c => c.status === 'Active').length;
    const inactiveCusts = customersList.filter(c => c.status === 'Inactive').length;
    const leadCusts = customersList.filter(c => c.status === 'Lead').length;

    let totalLtv = 0;
    let maxLtv = 0;
    customersList.forEach(c => {
      totalLtv += c.ltv || 0;
      if (c.ltv > maxLtv) maxLtv = c.ltv;
    });

    const openT = ticketsList.filter(t => t.status === 'Open').length;
    const assT = ticketsList.filter(t => t.status === 'Assigned').length;
    const progT = ticketsList.filter(t => t.status === 'In Progress').length;
    const resT = ticketsList.filter(t => t.status === 'Resolved').length;
    const clsT = ticketsList.filter(t => t.status === 'Closed').length;
    const critT = ticketsList.filter(t => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed').length;

    const now = new Date();
    const overdueT = ticketsList.filter(t => 
      t.status !== 'Resolved' && t.status !== 'Closed' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    let totalRating = 0;
    feedbacksList.forEach(f => totalRating += f.rating || 0);
    const avgRating = feedbacksList.length > 0 ? Math.round((totalRating / feedbacksList.length) * 10) / 10 : 4.8;

    // Monthly signups trends
    const signupMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      signupMap[key] = { month: key, registrations: 0, revenue: 0 };
    }

    customersList.forEach(c => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (signupMap[key]) {
        signupMap[key].registrations += 1;
        signupMap[key].revenue += c.ltv || 0;
      }
    });

    return {
      counts: {
        total: totalCusts,
        active: activeCusts,
        inactive: inactiveCusts,
        lead: leadCusts
      },
      ltv: {
        total: totalLtv,
        average: totalCusts > 0 ? Math.round((totalLtv / totalCusts) * 100) / 100 : 0,
        maximum: maxLtv
      },
      ticketStats: {
        total: ticketsList.length,
        open: openT,
        assigned: assT,
        inProgress: progT,
        resolved: resT,
        closed: clsT,
        pending: openT + assT + progT,
        critical: critT,
        overdue: overdueT,
        avgRating
      },
      monthlyTrends: Object.values(signupMap).sort((a, b) => a.month.localeCompare(b.month))
    };
  },

  resetDatabase: () => {
    localStorage.removeItem('crm_users');
    localStorage.removeItem('crm_agents');
    localStorage.removeItem('crm_customers');
    localStorage.removeItem('crm_tickets');
    localStorage.removeItem('crm_feedbacks');
    localStorage.removeItem('crm_activities');

    getLocalCollection('crm_users', INITIAL_USERS);
    getLocalCollection('crm_agents', INITIAL_AGENTS);
    getLocalCollection('crm_customers', INITIAL_CUSTOMERS);
    getLocalCollection('crm_tickets', INITIAL_TICKETS);
    getLocalCollection('crm_feedbacks', INITIAL_FEEDBACKS);
    getLocalCollection('crm_activities', INITIAL_ACTIVITIES);
    
    return true;
  }
};
