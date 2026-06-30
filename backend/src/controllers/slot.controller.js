const slotService = require('../services/slot.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const blockSlot = async (req, res, next) => {
  try {
    const slot = await slotService.blockSlot(req.businessId, req.body);
    return successResponse(res, slot, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const unblockSlot = async (req, res, next) => {
  try {
    const result = await slotService.unblockSlot(req.params.id, req.businessId);
    return successResponse(res, result, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const listBlockedSlots = async (req, res, next) => {
  try {
    const slots = await slotService.listBlockedSlots(req.businessId, req.query);
    return successResponse(res, slots, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.INTERNAL_ERROR,
      error.message,
      error.statusCode || 500
    );
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { businessId, serviceId, date, staffId } = req.query;
    if (!businessId || !serviceId || !date) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        'businessId, serviceId, and date are required query parameters',
        400
      );
    }

    const slots = await slotService.getAvailableSlots(businessId, serviceId, date, staffId);
    return successResponse(res, slots, 200);
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
  blockSlot,
  unblockSlot,
  listBlockedSlots,
  getAvailableSlots
};
