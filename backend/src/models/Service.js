const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID scope is required']
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    validate: {
      validator: function (val) {
        return val > 0 && val % 15 === 0;
      },
      message: 'Duration must be a positive multiple of 15 minutes'
    }
  },
  priceINR: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for optimized lookup of active services per tenant business
serviceSchema.index({ businessId: 1, isActive: 1 });

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
