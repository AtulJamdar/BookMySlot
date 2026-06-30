// Two helper functions to enforce consistent JSON envelopes across all routes

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const errorResponse = (res, code, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};
