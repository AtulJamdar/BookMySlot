const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const registerOwner = async (req, res, next) => {
  try {
    const result = await authService.registerOwner(req.body);
    return successResponse(res, result, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const registerCustomer = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    return successResponse(res, result, 201);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.statusCode || 400
    );
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, result, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.UNAUTHORIZED,
      error.message,
      error.statusCode || 401
    );
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is populated by authenticate middleware
    const user = await authService.getMe(req.user.userId);
    return successResponse(res, user, 200);
  } catch (error) {
    return errorResponse(
      res,
      error.code || ERROR_CODES.NOT_FOUND,
      error.message,
      error.statusCode || 404
    );
  }
};

module.exports = {
  registerOwner,
  registerCustomer,
  login,
  getMe
};
