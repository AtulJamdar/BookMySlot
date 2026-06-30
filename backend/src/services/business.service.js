const mongoose = require('mongoose');
const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');

const getBusinessBySlug = async (slug) => {
  const business = await Business.findOne({ slug, isActive: true });
  if (!business) {
    const error = new Error('Business not found or is suspended');
    error.statusCode = 404;
    throw error;
  }
  return business;
};

const updateBusiness = async (id, ownerId, data) => {
  const business = await Business.findById(id);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure owner is the one updating
  if (business.ownerId.toString() !== ownerId.toString()) {
    const error = new Error('Forbidden: You are not the owner of this business');
    error.statusCode = 403;
    throw error;
  }

  const { name, description, phone, workingHours, bufferMinutes } = data;

  if (name !== undefined) {
    business.name = name;
    // Slug is automatically updated in the pre-validate hook on the model
  }
  if (description !== undefined) business.description = description;
  if (phone !== undefined) business.phone = phone;
  if (workingHours !== undefined) business.workingHours = workingHours;
  if (bufferMinutes !== undefined) business.bufferMinutes = bufferMinutes;

  await business.save();
  return business;
};

const listBusinesses = async (filters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    
    // Find services matching name
    const Service = mongoose.models.Service;
    let businessIdsFromServices = [];
    if (Service) {
      const matchingServices = await Service.find({ name: searchRegex }).select('businessId');
      businessIdsFromServices = matchingServices.map(s => s.businessId);
    }
    
    query.$or = [
      { name: searchRegex },
      { _id: { $in: businessIdsFromServices } }
    ];
  }

  const items = await Business.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Business.countDocuments(query);

  // Dynamic lookup for bookings count to maintain decouple integrity
  const itemsWithBookings = [];
  const Booking = mongoose.models.Booking;

  for (const item of items) {
    let bookingCount = 0;
    if (Booking) {
      bookingCount = await Booking.countDocuments({ businessId: item._id });
    }
    itemsWithBookings.push({
      ...item.toObject(),
      bookingCount
    });
  }

  return {
    items: itemsWithBookings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const suspendBusiness = async (id, isActive, adminUserId) => {
  const business = await Business.findById(id);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  business.isActive = isActive;
  await business.save();

  // Create audit log entry
  await AuditLog.create({
    action: isActive ? 'BUSINESS_ACTIVATE' : 'BUSINESS_SUSPEND',
    userId: adminUserId,
    businessId: id,
    details: { isActive }
  });

  return business;
};

module.exports = {
  getBusinessBySlug,
  updateBusiness,
  listBusinesses,
  suspendBusiness
};
