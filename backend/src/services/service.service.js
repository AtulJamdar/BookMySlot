const Service = require('../models/Service');

const listServices = async (businessId) => {
  return Service.find({ businessId, isActive: true }).sort({ createdAt: -1 });
};

const createService = async (businessId, data) => {
  const { name, description, durationMinutes, priceINR } = data;

  // Case-insensitive name check within the same business scope
  const existingService = await Service.findOne({
    businessId,
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    isActive: true
  });

  if (existingService) {
    const error = new Error('Service name already exists in this business');
    error.statusCode = 400;
    throw error;
  }

  const service = new Service({
    businessId,
    name,
    description,
    durationMinutes,
    priceINR
  });

  await service.save();
  return service;
};

const updateService = async (serviceId, businessId, data) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Tenant scope check
  if (service.businessId.toString() !== businessId.toString()) {
    const error = new Error('Forbidden: You are not authorized to update this service');
    error.statusCode = 403;
    throw error;
  }

  const { name, description, durationMinutes, priceINR } = data;

  if (name !== undefined) {
    const trimmedName = name.trim();
    // Validate uniqueness of new name
    const existingService = await Service.findOne({
      businessId,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: serviceId },
      isActive: true
    });

    if (existingService) {
      const error = new Error('Service name already exists in this business');
      error.statusCode = 400;
      throw error;
    }
    service.name = trimmedName;
  }

  if (description !== undefined) service.description = description;
  if (durationMinutes !== undefined) service.durationMinutes = durationMinutes;
  if (priceINR !== undefined) service.priceINR = priceINR;

  await service.save();
  return service;
};

const deleteService = async (serviceId, businessId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Tenant scope check
  if (service.businessId.toString() !== businessId.toString()) {
    const error = new Error('Forbidden: You are not authorized to delete this service');
    error.statusCode = 403;
    throw error;
  }

  // Soft delete
  service.isActive = false;
  await service.save();
  return service;
};

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService
};
