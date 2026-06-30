const mongoose = require('mongoose');

const staffWorkingHourSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  start: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  end: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID scope is required']
  },
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  serviceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  workingHours: {
    type: [staffWorkingHourSchema],
    default: [] // Empty implies inheriting business hours
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for high performance scoped lookups of active staff
staffSchema.index({ businessId: 1, isActive: 1 });

module.exports = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
