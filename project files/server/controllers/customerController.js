const Customer = require('../models/Customer');

// @desc    Get all customers (with search, filter, sort, pagination)
// @route   GET /api/customers
// @access  Public
const getCustomers = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;

    // Create query object
    const query = {};

    // Apply status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Apply search filter (name, email, company, phone)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Determine sorting
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions['createdAt'] = -1; // Default sort: newest first
    }

    // Pagination calculations
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const totalCustomers = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      customers,
      pagination: {
        total: totalCustomers,
        page: pageNum,
        pages: Math.ceil(totalCustomers / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving customers', error: error.message });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(500).json({ message: 'Server error retrieving customer', error: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Public
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status, ltv, notes } = req.body;

    // Check if email already exists
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      status,
      ltv: ltv ? parseFloat(ltv) : 0,
      notes
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid customer data', error: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Public
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status, ltv, notes } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if the updated email is already taken by another customer
    if (email && email.toLowerCase() !== customer.email.toLowerCase()) {
      const emailExists = await Customer.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }
    }

    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone !== undefined ? phone : customer.phone;
    customer.company = company !== undefined ? company : customer.company;
    customer.status = status || customer.status;
    customer.ltv = ltv !== undefined ? parseFloat(ltv) : customer.ltv;
    customer.notes = notes !== undefined ? notes : customer.notes;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Public
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await Customer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Customer removed successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(500).json({ message: 'Server error deleting customer', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res) => {
  try {
    // Total count
    const totalCount = await Customer.countDocuments();

    // Stats by status
    const activeCount = await Customer.countDocuments({ status: 'Active' });
    const inactiveCount = await Customer.countDocuments({ status: 'Inactive' });
    const leadCount = await Customer.countDocuments({ status: 'Lead' });

    // Lifetime Value stats
    const ltvStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalLtv: { $sum: '$ltv' },
          avgLtv: { $avg: '$ltv' },
          maxLtv: { $max: '$ltv' }
        }
      }
    ]);

    const totalLtv = ltvStats.length > 0 ? ltvStats[0].totalLtv : 0;
    const avgLtv = ltvStats.length > 0 ? Math.round(ltvStats[0].avgLtv * 100) / 100 : 0;
    const maxLtv = ltvStats.length > 0 ? ltvStats[0].maxLtv : 0;

    // Monthly registration distribution (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          ltv: { $sum: '$ltv' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      counts: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        lead: leadCount
      },
      ltv: {
        total: totalLtv,
        average: avgLtv,
        maximum: maxLtv
      },
      monthlyTrends: monthlyStats.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        registrations: item.count,
        revenue: item.ltv
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating dashboard statistics', error: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardStats
};
