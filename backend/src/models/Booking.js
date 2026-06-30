const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Staff ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Nullable for guest bookings
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone number is required'],
    trim: true
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
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'business_owner', 'super_admin', null],
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  emailSentAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Optimization compound and single indexes
bookingSchema.index({ businessId: 1, date: 1, staffId: 1, status: 1 });
bookingSchema.index({ businessId: 1, status: 1, createdAt: 1 });
bookingSchema.index({ customerEmail: 1 });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
