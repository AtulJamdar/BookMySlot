const Booking = require('../models/Booking');

/**
 * Generates a unique, collision-safe reference code in the format BMS-XXXXX
 * where XXXXX is a random 5-digit number.
 */
const generateRef = async () => {
  let isUnique = false;
  let ref = '';

  while (!isUnique) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    ref = `BMS-${rand}`;
    
    // Check database for any collision
    const existing = await Booking.findOne({ bookingRef: ref });
    if (!existing) {
      isUnique = true;
    }
  }

  return ref;
};

module.exports = generateRef;
