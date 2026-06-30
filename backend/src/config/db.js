// MongoDB connection logic
const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the configured connection string.
 * Supports MONGO_URI or MONGODB_URI environment variables.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('Database connection string (MONGO_URI / MONGODB_URI) is not defined in environment variables.');
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
