const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const Business = require('../models/Business');
const { ROLES } = require('../utils/constants');

const triggerWelcomeEmail = (user, business) => {
  (async () => {
    try {
      const { sendEmail } = require('../utils/email');
      const templates = require('../utils/emailTemplates');

      const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;

      const html = templates.welcomeBusiness({
        ownerName: user.name,
        businessName: business.name,
        dashboardUrl
      });

      await sendEmail({
        to: user.email,
        subject: `Welcome to BookMySlot! Onboarding ${business.name}`,
        html
      });
    } catch (err) {
      console.error('Asynchronous welcome email processing failed:', err.message);
    }
  })();
};

const registerOwner = async (data) => {
  const { name, email, password, businessName, category, city, phone } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  try {
    let user, business;
    await session.withTransaction(async () => {
      user = new User({
        name,
        email,
        passwordHash: password, // Will be hashed by pre-save hook
        role: ROLES.BUSINESS_OWNER,
        phone
      });
      await user.save({ session });

      business = new Business({
        ownerId: user._id,
        name: businessName,
        category,
        city,
        phone
      });
      await business.save({ session });

      user.businessId = business._id;
      await user.save({ session });
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, businessId: business._id },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    triggerWelcomeEmail(user, business);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        phone: user.phone
      },
      token
    };
  } catch (error) {
    // Check if error is due to transactions/sessions not being supported (standalone local DB)
    if (error.message.includes('transaction') || error.message.includes('session') || error.message.includes('retryable writes') || error.codeName === 'CommandNotSupported') {
      const user = new User({
        name,
        email,
        passwordHash: password,
        role: ROLES.BUSINESS_OWNER,
        phone
      });
      await user.save();

      const business = new Business({
        ownerId: user._id,
        name: businessName,
        category,
        city,
        phone
      });
      await business.save();

      user.businessId = business._id;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.email, businessId: business._id },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      triggerWelcomeEmail(user, business);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          phone: user.phone
        },
        token
      };
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const registerCustomer = async (data) => {
  const { name, email, password, phone } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = new User({
    name,
    email,
    passwordHash: password,
    role: ROLES.CUSTOMER,
    phone
  });
  await user.save();

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email, businessId: null },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: null,
      phone: user.phone
    },
    token
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email, businessId: user.businessId },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      phone: user.phone
    },
    token
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  registerOwner,
  registerCustomer,
  login,
  getMe
};
