const models = require('../models');

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await models.User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already registered' });
    }

    const newUser = await models.User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'Agent'
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await models.User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id, name, email, phone, role } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const updated = await models.User.findByIdAndUpdate(id, { name, email, phone, role });
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'User ID, current password, and new password are required' });
    }

    const user = await models.User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    await models.User.findByIdAndUpdate(id, { password: newPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
