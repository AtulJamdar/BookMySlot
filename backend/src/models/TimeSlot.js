const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID scope is required']
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null // Nullable for business-wide blockout (if any, but usually scoped to staff)
  },
  date: {
    type: String,
    required: [true, 'Date (YYYY-MM-DD) is required'],
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  startTime: {
    type: String,
    required: [true, 'Start time (HH:MM) is required'],
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  endTime: {
    type: String,
    required: [true, 'End time (HH:MM) is required'],
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  status: {
    type: String,
    required: true,
    enum: ['blocked', 'booked']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Race-condition guard: Ensures a single staff member cannot have duplicate slots at the same time
timeSlotSchema.index({ businessId: 1, staffId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema);
