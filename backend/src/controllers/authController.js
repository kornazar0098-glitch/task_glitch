const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

// Register
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'کاربر با این ایمیل قبلاً ثبت شده است' });
    }

    // Check if phone already exists
    const phoneExists = await User.findOne({
      where: { phone },
    });

    if (phoneExists) {
      return res.status(400).json({ error: 'این شماره تلفن قبلاً ثبت شده است' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    // Response
    res.status(201).json({
      message: 'ثبت نام با موفقیت انجام شد',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'این حساب غیرفعال است' });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Response
    res.status(200).json({
      message: 'ورود با موفقیت انجام شد',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, location, latitude, longitude } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    // Update user
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (location) user.location = location;
    if (latitude) user.latitude = latitude;
    if (longitude) user.longitude = longitude;

    await user.save();

    res.status(200).json({
      message: 'پروفایل با موفقیت بروزرسانی شد',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'رمز عبور قدیمی و جدید الزامی است' });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'رمز عبور قدیمی اشتباه است' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'رمز عبور با موفقیت تغییر کرد',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
};
