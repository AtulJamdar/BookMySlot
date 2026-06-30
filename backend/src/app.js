// Express app setup, middleware, and route mounting
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/env');
const routes = require('./routes');

const app = express();

// Secure Express app by setting various HTTP headers
app.use(helmet());

// Enable CORS with dynamic origin whitelisting from configuration
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Mount all API routes under /api
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Internal Server Error',
      statusCode
    }
  });
});

module.exports = app;
