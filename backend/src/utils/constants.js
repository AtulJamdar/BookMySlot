// Shared enums as frozen objects
const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  BUSINESS_OWNER: 'business_owner',
  SUPER_ADMIN: 'super_admin'
});

const BOOKING_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
});

const SLOT_STATUS = Object.freeze({
  BLOCKED: 'blocked',
  BOOKED: 'booked'
});

const BUSINESS_CATEGORIES = Object.freeze({
  SALON: 'salon',
  CLINIC: 'clinic',
  COACHING: 'coaching',
  OTHER: 'other'
});

const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
});

module.exports = {
  ROLES,
  BOOKING_STATUS,
  SLOT_STATUS,
  BUSINESS_CATEGORIES,
  ERROR_CODES
};
