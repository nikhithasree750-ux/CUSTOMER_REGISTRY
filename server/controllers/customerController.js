const models = require('../models');

exports.getCustomers = async (req, res, next) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex }
      ];
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    let sortOption = { createdAt: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };
    else if (sort === 'name-desc') sortOption = { name: -1 };
    else if (sort === 'ltv-high') sortOption = { ltv: -1 };
    else if (sort === 'ltv-low') sortOption = { ltv: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const total = await models.Customer.countDocuments(filter);
    const customers = await models.Customer.find(filter, {
      sort: sortOption,
      skip,
      limit: parsedLimit
    });

    res.json({
      customers,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit),
        limit: parsedLimit
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerStats = async (req, res, next) => {
  try {
    const customers = await models.Customer.find({});
    
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const inactive = customers.filter(c => c.status === 'Inactive').length;
    const lead = customers.filter(c => c.status === 'Lead').length;

    let totalLtv = 0;
    let maxLtv = 0;
    customers.forEach(c => {
      const val = Number(c.ltv) || 0;
      totalLtv += val;
      if (val > maxLtv) maxLtv = val;
    });

    const averageLtv = total > 0 ? Math.round((totalLtv / total) * 100) / 100 : 0;

    const trendsMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendsMap[monthStr] = {
        month: monthStr,
        registrations: 0,
        revenue: 0
      };
    }

    customers.forEach(c => {
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (trendsMap[monthStr]) {
          trendsMap[monthStr].registrations += 1;
          trendsMap[monthStr].revenue += Number(c.ltv) || 0;
        }
      }
    });

    const monthlyTrends = Object.values(trendsMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      counts: { total, active, inactive, lead },
      ltv: { total: totalLtv, average: averageLtv, maximum: maxLtv },
      monthlyTrends
    });
  } catch (err) {
    next(err);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, ltv, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existing = await models.Customer.find({ email });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Customer with this email already registered' });
    }

    const newCust = await models.Customer.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      status: status || 'Lead',
      ltv: ltv ? Number(ltv) : 0,
      notes: notes || '',
      notesList: [],
      purchaseHistory: [],
      interactions: []
    });

    res.status(201).json(newCust);
  } catch (err) {
    next(err);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await models.Customer.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await models.Customer.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
};
