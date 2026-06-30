const Staff = require('../models/Staff');
const Service = require('../models/Service');

const listStaff = async (businessId, serviceId) => {
  const query = { businessId, isActive: true };
  if (serviceId) {
    query.serviceIds = serviceId;
  }
  return Staff.find(query).sort({ createdAt: -1 });
};

const createStaff = async (businessId, data) => {
  const { name, title, serviceIds, workingHours } = data;

  // Validate that all assigned serviceIds belong to the same business
  if (serviceIds && serviceIds.length > 0) {
    const services = await Service.find({
      _id: { $in: serviceIds },
      businessId,
      isActive: true
    });
    if (services.length !== serviceIds.length) {
      const error = new Error('One or more assigned services are invalid or belong to another business');
      error.statusCode = 400;
      throw error;
    }
  }

  const staff = new Staff({
    businessId,
    name,
    title,
    serviceIds: serviceIds || [],
    workingHours: workingHours || []
  });

  await staff.save();
  return staff;
};

const updateStaff = async (staffId, businessId, data) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  // Tenant scope check
  if (staff.businessId.toString() !== businessId.toString()) {
    const error = new Error('Forbidden: You are not authorized to update this staff profile');
    error.statusCode = 403;
    throw error;
  }

  const { name, title, serviceIds, workingHours } = data;

  if (serviceIds !== undefined) {
    if (serviceIds.length > 0) {
      const services = await Service.find({
        _id: { $in: serviceIds },
        businessId,
        isActive: true
      });
      if (services.length !== serviceIds.length) {
        const error = new Error('One or more assigned services are invalid or belong to another business');
        error.statusCode = 400;
        throw error;
      }
    }
    staff.serviceIds = serviceIds;
  }

  if (name !== undefined) staff.name = name;
  if (title !== undefined) staff.title = title;
  if (workingHours !== undefined) staff.workingHours = workingHours;

  await staff.save();
  return staff;
};

const deleteStaff = async (staffId, businessId) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  // Tenant scope check
  if (staff.businessId.toString() !== businessId.toString()) {
    const error = new Error('Forbidden: You are not authorized to delete this staff profile');
    error.statusCode = 403;
    throw error;
  }

  // Soft delete
  staff.isActive = false;
  await staff.save();
  return staff;
};

module.exports = {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
