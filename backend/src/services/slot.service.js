const TimeSlot = require('../models/TimeSlot');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Business = require('../models/Business');

const blockSlot = async (businessId, data) => {
  const { staffId, date, startTime, endTime, reason } = data;

  const startMins = toMinutes(startTime);
  const endMins = toMinutes(endTime);

  if (endMins <= startMins) {
    const error = new Error('End time must be after start time');
    error.statusCode = 400;
    throw error;
  }

  // Check conflicts with booked slots
  const conflicts = await TimeSlot.find({
    businessId,
    staffId,
    date,
    status: 'booked'
  });

  const hasConflict = conflicts.some(c => {
    const cS = toMinutes(c.startTime);
    const cE = toMinutes(c.endTime);
    // Overlap check
    return startMins < cE && endMins > cS;
  });

  if (hasConflict) {
    const error = new Error('Cannot block slot: overlaps with an existing appointment booking');
    error.statusCode = 400;
    throw error;
  }

  const slot = new TimeSlot({
    businessId,
    staffId,
    date,
    startTime,
    endTime,
    status: 'blocked',
    reason
  });

  await slot.save();
  return slot;
};

const unblockSlot = async (slotId, businessId) => {
  const slot = await TimeSlot.findById(slotId);
  if (!slot) {
    const error = new Error('Blocked slot not found');
    error.statusCode = 404;
    throw error;
  }

  // Tenant scope check
  if (slot.businessId.toString() !== businessId.toString()) {
    const error = new Error('Forbidden: You are not authorized to unblock this slot');
    error.statusCode = 403;
    throw error;
  }

  if (slot.status === 'booked') {
    const error = new Error('Cannot delete: slot is currently booked');
    error.statusCode = 400;
    throw error;
  }

  await TimeSlot.findByIdAndDelete(slotId);
  return { message: 'Slot unblocked successfully' };
};

const listBlockedSlots = async (businessId, filters) => {
  const query = { businessId, status: 'blocked' };
  if (filters.date) query.date = filters.date;
  if (filters.staffId) query.staffId = filters.staffId;

  return TimeSlot.find(query).sort({ date: 1, startTime: 1 });
};

const getAvailableSlots = async (businessId, serviceId, date, staffId) => {
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    const error = new Error('Service not found or is inactive');
    error.statusCode = 404;
    throw error;
  }
  const duration = service.durationMinutes;

  let staffList = [];
  if (staffId && staffId !== 'any') {
    const staff = await Staff.findOne({ _id: staffId, businessId, isActive: true, serviceIds: serviceId });
    if (staff) staffList.push(staff);
  } else {
    staffList = await Staff.find({ businessId, isActive: true, serviceIds: serviceId });
  }

  const business = await Business.findById(businessId);
  if (!business) {
    const error = new Error('Business profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Timezone-safe weekday extraction
  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return daysOfWeek[d.getDay()];
  };

  const dayName = getDayName(date);
  const allSlots = [];

  for (const staff of staffList) {
    let staffHours = staff.workingHours?.find(h => h.day === dayName);
    if (!staffHours) {
      // Inherit from business
      staffHours = business.workingHours?.find(h => h.day === dayName);
    }

    if (!staffHours) {
      continue; // Business/staff is closed on this day
    }

    const startMins = toMinutes(staffHours.start);
    const endMins = toMinutes(staffHours.end);

    const potentialSlots = [];
    // Generate possible slots by stepping by service duration
    for (let m = startMins; m + duration <= endMins; m += duration) {
      potentialSlots.push({
        startTime: toTimeStr(m),
        endTime: toTimeStr(m + duration),
        staffId: staff._id
      });
    }

    const bookedOrBlocked = await TimeSlot.find({
      staffId: staff._id,
      date
    });

    const available = potentialSlots.filter(p => {
      const pS = toMinutes(p.startTime);
      const pE = toMinutes(p.endTime);

      return !bookedOrBlocked.some(e => {
        const eS = toMinutes(e.startTime);
        const eE = toMinutes(e.endTime);
        return pS < eE && pE > eS;
      });
    });

    // Remove past slot intervals if query matches today's date
    const todayStr = new Date().toISOString().split('T')[0];
    let filtered = available;
    if (date === todayStr) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      filtered = available.filter(p => toMinutes(p.startTime) > currentMins);
    }

    allSlots.push(...filtered);
  }

  return allSlots;
};

// Helpers
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
  blockSlot,
  unblockSlot,
  listBlockedSlots,
  getAvailableSlots
};
