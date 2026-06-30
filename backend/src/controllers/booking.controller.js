const bookingService = require('../services/booking.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user ? req.user.userId : null;
    const booking = await bookingService.createBooking(customerId, req.body);
    return successResponse(res, booking, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const listBusinessBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, date, status, staffId } = req.query;
    const result = await bookingService.listBusinessBookings(
      req.businessId,
      { date, status, staffId },
      page,
      limit
    );
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

const listCustomerBookings = async (req, res, next) => {
  try {
    const result = await bookingService.listCustomerBookings(
      req.user.userId,
      req.user.email
    );
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

const getBookingDetail = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const role = req.user ? req.user.role : null;
    const businessId = req.user ? req.user.businessId : null;
    const email = req.user ? req.user.email : null;

    const booking = await bookingService.getBookingDetail(
      req.params.id,
      userId,
      role,
      businessId,
      email
    );
    return successResponse(res, booking, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const role = req.user ? req.user.role : null;
    const businessId = req.user ? req.user.businessId : null;
    const email = req.user ? req.user.email : null;
    const { reason = 'Cancelled by user' } = req.body;

    const result = await bookingService.cancelBooking(
      req.params.id,
      userId,
      role,
      businessId,
      email,
      reason
    );
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

const listAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, businessId, date, status } = req.query;
    const result = await bookingService.listAllBookings(
      { businessId, date, status },
      page,
      limit
    );
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

module.exports = {
  createBooking,
  listBusinessBookings,
  listCustomerBookings,
  getBookingDetail,
  cancelBooking,
  listAllBookings
};
