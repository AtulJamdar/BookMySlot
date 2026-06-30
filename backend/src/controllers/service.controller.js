const serviceService = require('../services/service.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const listServices = async (req, res, next) => {
  try {
    // Falls back to injected req.businessId if public query param isn't supplied
    const businessId = req.query.businessId || req.businessId;
    if (!businessId) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Business ID is required', 400);
    }

    const services = await serviceService.listServices(businessId);
    return successResponse(res, services, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.businessId, req.body);
    return successResponse(res, service, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(
      req.params.id,
      req.businessId,
      req.body
    );
    return successResponse(res, service, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const deleteService = async (req, res, next) => {
  try {
    await serviceService.deleteService(req.params.id, req.businessId);
    return successResponse(res, { message: 'Service deleted successfully' }, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService
};
