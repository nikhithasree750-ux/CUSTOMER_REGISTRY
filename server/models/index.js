const { getIsMongo, readJSON, writeJSON, generateId } = require('../config/db');
const User = require('./User');
const Agent = require('./Agent');
const Customer = require('./Customer');
const Ticket = require('./Ticket');
const Feedback = require('./Feedback');

// Helper to filter array by object matching rules (including RegExp or equality)
const matchFilter = (item, filter) => {
  return Object.entries(filter).every(([key, val]) => {
    if (key === '$or') {
      return val.some(subFilter => {
        return Object.entries(subFilter).every(([subKey, subVal]) => {
          if (subVal instanceof RegExp) {
            return subVal.test(item[subKey] || '');
          }
          return item[subKey] === subVal;
        });
      });
    }
    if (val instanceof RegExp) {
      return val.test(item[key] || '');
    }
    return item[key] === val;
  });
};

const models = {
  User: {
    find: async (filter = {}) => {
      if (getIsMongo()) return await User.find(filter).lean();
      const list = readJSON('users');
      return list.filter(item => matchFilter(item, filter));
    },
    findOne: async (filter = {}) => {
      if (getIsMongo()) return await User.findOne(filter).lean();
      const list = readJSON('users');
      return list.find(item => matchFilter(item, filter)) || null;
    },
    findById: async (id) => {
      if (getIsMongo()) return await User.findById(id).lean();
      const list = readJSON('users');
      return list.find(item => item._id === id) || null;
    },
    create: async (data) => {
      if (getIsMongo()) {
        const doc = new User(data);
        return (await doc.save()).toObject();
      }
      const list = readJSON('users');
      const doc = {
        _id: data._id || generateId('user'),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        role: data.role || 'Agent',
        avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(doc);
      writeJSON('users', list);
      return doc;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (getIsMongo()) return await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const list = readJSON('users');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;
      list[idx] = {
        ...list[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJSON('users', list);
      return list[idx];
    }
  },

  Agent: {
    find: async (filter = {}) => {
      if (getIsMongo()) return await Agent.find(filter).lean();
      const list = readJSON('agents');
      return list.filter(item => matchFilter(item, filter));
    },
    create: async (data) => {
      if (getIsMongo()) {
        const doc = new Agent(data);
        return (await doc.save()).toObject();
      }
      const list = readJSON('agents');
      const doc = {
        _id: data._id || generateId('agent'),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        specialty: data.specialty || '',
        status: data.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(doc);
      writeJSON('agents', list);
      return doc;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (getIsMongo()) return await Agent.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const list = readJSON('agents');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;
      list[idx] = {
        ...list[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJSON('agents', list);
      return list[idx];
    },
    findByIdAndDelete: async (id) => {
      if (getIsMongo()) return await Agent.findByIdAndDelete(id).lean();
      const list = readJSON('agents');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;
      const deleted = list.splice(idx, 1)[0];
      writeJSON('agents', list);
      return deleted;
    }
  },

  Customer: {
    find: async (filter = {}, options = {}) => {
      if (getIsMongo()) {
        let query = Customer.find(filter);
        if (options.sort) query = query.sort(options.sort);
        if (options.skip) query = query.skip(options.skip);
        if (options.limit) query = query.limit(options.limit);
        return await query.lean();
      }
      let list = readJSON('customers');
      let filtered = list.filter(item => matchFilter(item, filter));

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

      const skip = options.skip || 0;
      const limit = options.limit || filtered.length;
      return filtered.slice(skip, skip + limit);
    },
    countDocuments: async (filter = {}) => {
      if (getIsMongo()) return await Customer.countDocuments(filter);
      const list = readJSON('customers');
      return list.filter(item => matchFilter(item, filter)).length;
    },
    findById: async (id) => {
      if (getIsMongo()) return await Customer.findById(id).lean();
      const list = readJSON('customers');
      return list.find(item => item._id === id) || null;
    },
    create: async (data) => {
      if (getIsMongo()) {
        const doc = new Customer(data);
        return (await doc.save()).toObject();
      }
      const list = readJSON('customers');
      const doc = {
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
      list.push(doc);
      writeJSON('customers', list);
      return doc;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (getIsMongo()) return await Customer.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const list = readJSON('customers');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;

      let updatedFields = { ...updateData };

      if (updateData.$push) {
        const pushKey = Object.keys(updateData.$push)[0];
        const pushVal = updateData.$push[pushKey];
        if (!list[idx][pushKey]) list[idx][pushKey] = [];
        
        const nestedItem = {
          id: pushVal.id || generateId(pushKey[0]),
          ...pushVal,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        };
        list[idx][pushKey].push(nestedItem);
        delete updatedFields.$push;
      }

      list[idx] = {
        ...list[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      writeJSON('customers', list);
      return list[idx];
    },
    findByIdAndDelete: async (id) => {
      if (getIsMongo()) return await Customer.findByIdAndDelete(id).lean();
      const list = readJSON('customers');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;
      const deleted = list.splice(idx, 1)[0];
      writeJSON('customers', list);
      return deleted;
    }
  },

  Ticket: {
    find: async (filter = {}) => {
      if (getIsMongo()) return await Ticket.find(filter).lean();
      const list = readJSON('tickets');
      return list.filter(item => matchFilter(item, filter));
    },
    create: async (data) => {
      if (getIsMongo()) {
        const doc = new Ticket(data);
        return (await doc.save()).toObject();
      }
      const list = readJSON('tickets');
      const nextIdNum = list.length + 1;
      const ticketId = data.ticketId || `TKT-2026-${String(nextIdNum).padStart(3, '0')}`;
      const doc = {
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
      list.push(doc);
      writeJSON('tickets', list);
      return doc;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (getIsMongo()) return await Ticket.findByIdAndUpdate(id, updateData, { new: true }).lean();
      const list = readJSON('tickets');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;

      let updatedFields = { ...updateData };

      if (updateData.$push) {
        const pushKey = Object.keys(updateData.$push)[0];
        const pushVal = updateData.$push[pushKey];
        if (!list[idx][pushKey]) list[idx][pushKey] = [];
        list[idx][pushKey].push({
          ...pushVal,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        });
        delete updatedFields.$push;
      }

      list[idx] = {
        ...list[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      writeJSON('tickets', list);
      return list[idx];
    },
    findByIdAndDelete: async (id) => {
      if (getIsMongo()) return await Ticket.findByIdAndDelete(id).lean();
      const list = readJSON('tickets');
      const idx = list.findIndex(item => item._id === id);
      if (idx === -1) return null;
      const deleted = list.splice(idx, 1)[0];
      writeJSON('tickets', list);
      return deleted;
    }
  },

  Feedback: {
    find: async (filter = {}) => {
      if (getIsMongo()) return await Feedback.find(filter).lean();
      const list = readJSON('feedbacks');
      return list.filter(item => matchFilter(item, filter));
    },
    create: async (data) => {
      if (getIsMongo()) {
        const doc = new Feedback(data);
        return (await doc.save()).toObject();
      }
      const list = readJSON('feedbacks');
      const doc = {
        _id: data._id || generateId('fb'),
        customerId: data.customerId,
        rating: Number(data.rating),
        comment: data.comment || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(doc);
      writeJSON('feedbacks', list);
      return doc;
    }
  }
};

module.exports = models;
