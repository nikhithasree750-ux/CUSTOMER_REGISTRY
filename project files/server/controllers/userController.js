const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, avatar } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password, // Plain-text mock or hashed (plain-text for simplified local storage mode)
      role: role || 'Agent',
      avatar: avatar || ''
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user registration data', error: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search by email or phone
    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    });
    if (user && user.password === password) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private/Mock
const updateProfile = async (req, res) => {
  try {
    const { id, name, email, phone, avatar } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Email collision check
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already taken by another account' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.avatar = avatar !== undefined ? avatar : user.avatar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user profile', error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private/Mock
const changePassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error changing password', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword
};
