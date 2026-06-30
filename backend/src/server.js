// Entry point - starts the Express server and registers jobs
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const { startReminderJob } = require('./jobs/reminderJob');

const PORT = config.PORT || 5000;

// Connect to MongoDB Atlas database
connectDB();

// Start cron reminder jobs
startReminderJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
