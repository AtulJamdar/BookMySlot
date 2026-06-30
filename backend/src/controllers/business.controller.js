const businessService = require('../services/business.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const getBusinessBySlug = async (req, res, next) => {
  try {
    const business = await businessService.getBusinessBySlug(req.params.slug);
    return successResponse(res, business, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.NOT_FOUND,
      error.message,
      error.statusCode || 404
    );
  }
};

const updateBusiness = async (req, res, next) => {
  try {
    // Tenant verification
    if (!req.user || req.user.businessId?.toString() !== req.params.id) {
      return errorResponse(
        res,
        ERROR_CODES.FORBIDDEN,
        'Forbidden: You are not authorized to update this business profile',
        403
      );
    }

    const business = await businessService.updateBusiness(
      req.params.id,
      req.user.userId,
      req.body
    );
    return successResponse(res, business, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const listBusinesses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;
    const result = await businessService.listBusinesses({ isActive, search }, page, limit);
    return successResponse(res, result, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const suspendBusiness = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'isActive field is required', 400);
    }

    const business = await businessService.suspendBusiness(
      req.params.id,
      isActive,
      req.user.userId
    );
    return successResponse(res, business, 200);
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
  getBusinessBySlug,
  updateBusiness,
  listBusinesses,
  suspendBusiness
};
