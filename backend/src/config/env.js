// Environment variable validation and export
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file in the backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    PORT: parseInt(process.env.EMAIL_PORT || '2525', 10),
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
  },
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate critical configuration variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredVars.filter(key => !config[key]);

if (missingVars.length > 0) {
  console.warn(`[CONFIG WARNING]: Missing critical environment variables: ${missingVars.join(', ')}`);
  if (config.NODE_ENV === 'production') {
    console.error('[CRITICAL CONFIG ERROR]: Cannot start in production without these variables.');
    process.exit(1);
  }
}

module.exports = config;
