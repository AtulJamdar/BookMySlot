const mongoose = require('mongoose');
const { BUSINESS_CATEGORIES } = require('../utils/constants');

const workingHourSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  start: {
    type: String,
    required: true, // HH:MM format
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  end: {
    type: String,
    required: true, // HH:MM format
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  }
}, { _id: false });

const businessSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: Object.values(BUSINESS_CATEGORIES)
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Business phone is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  workingHours: {
    type: [workingHourSchema],
    default: []
  },
  bufferMinutes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to auto-generate slug if not provided or when name changes
businessSchema.pre('validate', function () {
  if (this.isModified('name') || !this.slug) {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove non-word characters
        .replace(/[\s_-]+/g, '-') // convert spaces and underscores to hyphens
        .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
    }
  }
});

module.exports = mongoose.models.Business || mongoose.model('Business', businessSchema);
