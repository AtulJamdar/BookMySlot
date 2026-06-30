const analyticsService = require('../services/analytics.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const summary = await analyticsService.getAnalyticsSummary(req.businessId, from, to);
    return successResponse(res, summary, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const getPeakHours = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const peakHours = await analyticsService.getPeakHours(req.businessId, from, to);
    return successResponse(res, peakHours, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const getSuperAdminAnalytics = async (req, res, next) => {
  try {
    const stats = await analyticsService.getSuperAdminAnalytics();
    return successResponse(res, stats, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

module.exports = {
  getAnalyticsSummary,
  getPeakHours,
  getSuperAdminAnalytics
};
