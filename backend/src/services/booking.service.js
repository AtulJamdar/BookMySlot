const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Business = require('../models/Business');
const generateRef = require('../utils/generateRef');

const triggerConfirmationEmails = (booking, business, staff, service) => {
  (async () => {
    try {
      const { sendEmail } = require('../utils/email');
      const templates = require('../utils/emailTemplates');

      const ownerEmail = business.ownerId?.email;
      const staffName = staff ? staff.name : 'Any Practitioner';
      const formattedTimeRange = `${booking.startTime} - ${booking.endTime}`;

      // 1. Send confirmation to the Customer
      const customerHtml = templates.bookingConfirmation({
        customerName: booking.customerName,
        serviceName: service.name,
        staffName,
        date: booking.date,
        startTime: formattedTimeRange,
        businessName: business.name,
        bookingRef: booking.bookingRef
      });

      await sendEmail({
        to: booking.customerEmail,
        subject: `Appointment Confirmed: ${booking.bookingRef}`,
        html: customerHtml
      });

      // 2. Send notice to the Business Owner
      if (ownerEmail) {
        const ownerHtml = templates.bookingConfirmation({
          customerName: `Owner (${business.name})`,
          serviceName: `${service.name} (Client: ${booking.customerName})`,
          staffName,
          date: booking.date,
          startTime: formattedTimeRange,
          businessName: business.name,
          bookingRef: booking.bookingRef
        });

        await sendEmail({
          to: ownerEmail,
          subject: `New Appointment Booked: ${booking.bookingRef}`,
          html: ownerHtml
        });
      }

      // 3. Mark confirmation email sent time
      await Booking.findByIdAndUpdate(booking._id, { emailSentAt: new Date() });
    } catch (err) {
      console.error('Asynchronous confirmation email processing failed:', err.message);
    }
  })();
};

const createBooking = async (customerId, data) => {
  const {
    businessId,
    serviceId,
    staffId,
    customerName,
    customerEmail,
    customerPhone,
    date,
    startTime,
    notes
  } = data;

  // Resolve service duration and pricing details
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    const error = new Error('Service not found or is inactive');
    error.statusCode = 404;
    throw error;
  }

  // Resolve business and owner emails
  const business = await Business.findById(businessId).populate('ownerId', 'email');
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  const staff = await Staff.findById(staffId);

  const duration = service.durationMinutes;
  const startMins = toMinutes(startTime);
  const endMins = startMins + duration;
  const endTime = toTimeStr(endMins);

  // Check for any active overlapping bookings for the staff member on that day
  const conflicts = await Booking.find({
    businessId,
    staffId,
    date,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (conflicts.length > 0) {
    const error = new Error('This slot is already booked by someone else. Please choose another time.');
    error.statusCode = 409;
    error.code = 'SLOT_UNAVAILABLE';
    throw error;
  }

  // Check if slot is blocked by the business
  const blockedSlot = await TimeSlot.findOne({
    businessId,
    staffId,
    date,
    status: 'blocked',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (blockedSlot) {
    const error = new Error('This slot is blocked by the business.');
    error.statusCode = 409;
    error.code = 'SLOT_UNAVAILABLE';
    throw error;
  }

  const bookingRef = await generateRef();

  const session = await mongoose.startSession();
  try {
    let booking;
    await session.withTransaction(async () => {
      booking = new Booking({
        bookingRef,
        businessId,
        serviceId,
        staffId,
        customerId: customerId || null,
        customerName,
        customerEmail,
        customerPhone,
        date,
        startTime,
        endTime,
        priceINR: service.priceINR,
        status: 'confirmed',
        notes
      });
      await booking.save({ session });

      const timeSlot = new TimeSlot({
        businessId,
        staffId,
        date,
        startTime,
        endTime,
        status: 'booked',
        bookingId: booking._id
      });
      await timeSlot.save({ session });
    });

    triggerConfirmationEmails(booking, business, staff, service);
    return booking;
  } catch (error) {
    // Unique compound key violation catches
    if (error.code === 11000) {
      const err = new Error('This slot was just booked by someone else. Please choose another time.');
      err.statusCode = 409;
      err.code = 'SLOT_UNAVAILABLE';
      throw err;
    }
    
    // Fallback if session transactions are not supported
    if (error.message.includes('transaction') || error.message.includes('session') || error.message.includes('retryable writes') || error.codeName === 'CommandNotSupported') {
      const booking = new Booking({
        bookingRef,
        businessId,
        serviceId,
        staffId,
        customerId: customerId || null,
        customerName,
        customerEmail,
        customerPhone,
        date,
        startTime,
        endTime,
        priceINR: service.priceINR,
        status: 'confirmed',
        notes
      });
      await booking.save();

      const timeSlot = new TimeSlot({
        businessId,
        staffId,
        date,
        startTime,
        endTime,
        status: 'booked',
        bookingId: booking._id
      });
      await timeSlot.save();

      triggerConfirmationEmails(booking, business, staff, service);
      return booking;
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const listBusinessBookings = async (businessId, filters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { businessId };

  if (filters.date) query.date = filters.date;
  if (filters.status) query.status = filters.status;
  if (filters.staffId) query.staffId = filters.staffId;

  const items = await Booking.find(query)
    .populate('serviceId', 'name priceINR')
    .populate('staffId', 'name title')
    .skip(skip)
    .limit(Number(limit))
    .sort({ date: 1, startTime: 1 });

  const total = await Booking.countDocuments(query);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const listCustomerBookings = async (userId, email) => {
  const query = {
    $or: []
  };

  if (userId) query.$or.push({ customerId: userId });
  if (email) query.$or.push({ customerEmail: email });

  if (query.$or.length === 0) {
    return [];
  }

  return Booking.find(query)
    .populate('businessId', 'name slug')
    .populate('serviceId', 'name')
    .populate('staffId', 'name')
    .sort({ date: -1, startTime: -1 });
};

const getBookingDetail = async (bookingId, userId, role, businessId, email) => {
  const booking = await Booking.findById(bookingId)
    .populate('businessId', 'name slug')
    .populate('serviceId', 'name durationMinutes priceINR')
    .populate('staffId', 'name title');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  if (role === 'super_admin') {
    return booking;
  }

  if (role === 'business_owner') {
    if (booking.businessId._id.toString() !== businessId?.toString()) {
      const error = new Error('Forbidden: Access to this booking detail is restricted');
      error.statusCode = 403;
      throw error;
    }
    return booking;
  }

  // Customer authorization check
  const isMatch = 
    (userId && booking.customerId?.toString() === userId.toString()) || 
    (email && booking.customerEmail.toLowerCase() === email.toLowerCase());

  if (!isMatch) {
    const error = new Error('Forbidden: Access to this booking detail is restricted');
    error.statusCode = 403;
    throw error;
  }

  return booking;
};

const cancelBooking = async (bookingId, userId, role, businessId, email, reason) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify access permissions
  if (role === 'business_owner') {
    if (booking.businessId.toString() !== businessId?.toString()) {
      const error = new Error('Forbidden: You are not authorized to cancel this booking');
      error.statusCode = 403;
      throw error;
    }
  } else if (role !== 'super_admin') {
    // Customer checks
    const isMatch = 
      (userId && booking.customerId?.toString() === userId.toString()) || 
      (email && booking.customerEmail.toLowerCase() === email.toLowerCase());

    if (!isMatch) {
      const error = new Error('Forbidden: You are not authorized to cancel this booking');
      error.statusCode = 403;
      throw error;
    }

    // Cancellation window validation (customer can only cancel >= 1 hr prior)
    const now = new Date();
    const [y, m, d] = booking.date.split('-').map(Number);
    const [hr, min] = booking.startTime.split(':').map(Number);
    const bookingTime = new Date(y, m - 1, d, hr, min);
    const diffHrs = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHrs < 1) {
      const error = new Error('Appointments can only be cancelled at least 1 hour prior to their start time');
      error.statusCode = 400;
      throw error;
    }
  }

  if (booking.status === 'cancelled') {
    return booking;
  }

  booking.status = 'cancelled';
  booking.cancelledBy = role === 'business_owner' ? 'business_owner' : role === 'super_admin' ? 'super_admin' : 'customer';
  booking.cancellationReason = reason;

  await booking.save();

  // Release slot lock
  await TimeSlot.deleteOne({ bookingId: booking._id });

  // Trigger cancellation emails asynchronously
  (async () => {
    try {
      const { sendEmail } = require('../utils/email');
      const templates = require('../utils/emailTemplates');

      const fullBooking = await Booking.findById(booking._id)
        .populate('businessId', 'name')
        .populate('serviceId', 'name');

      const businessName = fullBooking.businessId?.name || 'Business';
      const serviceName = fullBooking.serviceId?.name || 'Service';

      // 1. Send apology notice if cancelled by business owner / admin
      if (booking.cancelledBy === 'business_owner' || booking.cancelledBy === 'super_admin') {
        const apologyHtml = templates.lateCancellationApology({
          customerName: booking.customerName,
          serviceName,
          date: booking.date,
          startTime: booking.startTime,
          businessName,
          reason: booking.cancellationReason
        });

        await sendEmail({
          to: booking.customerEmail,
          subject: `Cancellation Notice & Apology: Appointment ${booking.bookingRef}`,
          html: apologyHtml
        });
      } else {
        // 2. Send standard cancellation notice to client
        const cancelHtml = templates.bookingCancellation({
          customerName: booking.customerName,
          serviceName,
          date: booking.date,
          startTime: booking.startTime,
          businessName
        });

        await sendEmail({
          to: booking.customerEmail,
          subject: `Appointment Cancelled: ${booking.bookingRef}`,
          html: cancelHtml
        });
      }
    } catch (err) {
      console.error('Asynchronous cancellation email processing failed:', err.message);
    }
  })();

  return booking;
};

const listAllBookings = async (filters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.businessId) query.businessId = filters.businessId;
  if (filters.date) query.date = filters.date;
  if (filters.status) query.status = filters.status;

  const items = await Booking.find(query)
    .populate('businessId', 'name')
    .populate('serviceId', 'name priceINR')
    .populate('staffId', 'name')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Booking.countDocuments(query);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Helper utilities
const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const toTimeStr = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

module.exports = {
  createBooking,
  listBusinessBookings,
  listCustomerBookings,
  getBookingDetail,
  cancelBooking,
  listAllBookings
};
