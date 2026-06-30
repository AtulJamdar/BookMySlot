// Idempotent database seeder
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const { ROLES, BUSINESS_CATEGORIES } = require('../utils/constants');

// Define inline schemas to avoid importing placeholder model files
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(ROLES) },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null },
  phone: { type: String }
}, { timestamps: true });

const businessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: Object.values(BUSINESS_CATEGORIES) },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String },
  workingHours: [
    {
      day: { type: String, required: true },
      start: { type: String, required: true },
      end: { type: String, required: true }
    }
  ],
  bufferMinutes: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true },
  priceINR: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const staffSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  title: { type: String },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  workingHours: [
    {
      day: { type: String, required: true },
      start: { type: String, required: true },
      end: { type: String, required: true }
    }
  ],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compile models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);

const seed = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to Database. Dropping existing collections...');

    // Drop collections if they exist to start clean
    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Service.deleteMany({}),
      Staff.deleteMany({})
    ]);
    console.log('Existing collections cleared.');

    // 1. Create Super Admin User
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@bookmyslot.in';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: ROLES.SUPER_ADMIN,
      phone: '9999999999'
    });
    console.log(`Super Admin created: ${adminEmail}`);

    // 2. Create Business Owner User
    const ownerEmail = 'john@demo.com';
    const ownerPassword = 'Owner@123';
    const ownerPasswordHash = await bcrypt.hash(ownerPassword, 10);

    const businessOwner = await User.create({
      name: 'John Doe',
      email: ownerEmail,
      passwordHash: ownerPasswordHash,
      role: ROLES.BUSINESS_OWNER,
      phone: '9876543210'
    });
    console.log(`Business Owner created: ${ownerEmail}`);

    // 3. Create Business ("Demo Salon")
    const workingHours = [
      { day: 'monday', start: '09:00', end: '18:00' },
      { day: 'tuesday', start: '09:00', end: '18:00' },
      { day: 'wednesday', start: '09:00', end: '18:00' },
      { day: 'thursday', start: '09:00', end: '18:00' },
      { day: 'friday', start: '09:00', end: '18:00' },
      { day: 'saturday', start: '09:00', end: '18:00' }
    ];

    const business = await Business.create({
      ownerId: businessOwner._id,
      name: 'Demo Salon',
      slug: 'demo-salon',
      category: BUSINESS_CATEGORIES.SALON,
      city: 'Pune',
      phone: '9876543210',
      description: 'The ultimate professional salon experience.',
      workingHours,
      bufferMinutes: 0,
      isActive: true
    });
    console.log(`Business "Demo Salon" created (slug: demo-salon)`);

    // Update the business owner with the businessId link
    businessOwner.businessId = business._id;
    await businessOwner.save();
    console.log('Business Owner linked to business ID.');

    // 4. Create Services
    const haircutService = await Service.create({
      businessId: business._id,
      name: 'Haircut',
      description: 'Professional hair cutting and styling.',
      durationMinutes: 30,
      priceINR: 300,
      isActive: true
    });

    const facialService = await Service.create({
      businessId: business._id,
      name: 'Facial',
      description: 'Skin cleansing and rejuvenating facial treatment.',
      durationMinutes: 60,
      priceINR: 800,
      isActive: true
    });
    console.log('Services "Haircut" and "Facial" created.');

    // 5. Create Staff Members
    await Staff.create({
      businessId: business._id,
      name: 'Alice Smith',
      title: 'Senior Stylist',
      serviceIds: [haircutService._id, facialService._id],
      workingHours,
      isActive: true
    });

    await Staff.create({
      businessId: business._id,
      name: 'Bob Johnson',
      title: 'Junior Stylist',
      serviceIds: [haircutService._id],
      workingHours,
      isActive: true
    });
    console.log('Staff members "Alice Smith" and "Bob Johnson" created.');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seed();
