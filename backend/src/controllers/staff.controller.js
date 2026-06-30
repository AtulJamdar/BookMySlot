const staffService = require('../services/staff.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const listStaff = async (req, res, next) => {
  try {
    const businessId = req.query.businessId || req.businessId;
    if (!businessId) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Business ID is required', 400);
    }

    const staff = await staffService.listStaff(businessId, req.query.serviceId);
    return successResponse(res, staff, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staff = await staffService.createStaff(req.businessId, req.body);
    return successResponse(res, staff, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(
      req.params.id,
      req.businessId,
      req.body
    );
    return successResponse(res, staff, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id, req.businessId);
    return successResponse(res, { message: 'Staff member deleted successfully' }, 200);
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
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
