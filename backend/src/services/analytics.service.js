const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Business = require('../models/Business');

const getAnalyticsSummary = async (businessId, fromDate, toDate) => {
  const match = { businessId: new mongoose.Types.ObjectId(businessId) };
  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = fromDate;
    if (toDate) match.date.$lte = toDate;
  }

  // Aggregate stats using local lookup mapping to resolve pricing metrics
  const result = await Booking.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceDetails'
      }
    },
    { $unwind: { path: '$serviceDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'confirmed'] },
              { $ifNull: ['$serviceDetails.priceINR', 0] },
              0
            ]
          }
        },
        cancellationCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      cancellationCount: 0,
      cancellationRate: 0
    };
  }

  const { totalBookings, totalRevenue, cancellationCount } = result[0];
  const cancellationRate = totalBookings > 0 ? Math.round((cancellationCount / totalBookings) * 100) : 0;

  return {
    totalBookings,
    totalRevenue,
    cancellationCount,
    cancellationRate
  };
};

const getPeakHours = async (businessId, fromDate, toDate) => {
  const match = {
    businessId: new mongoose.Types.ObjectId(businessId),
    status: 'confirmed'
  };
  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = fromDate;
    if (toDate) match.date.$lte = toDate;
  }

  // Extract the hour digit of startTimes ("HH:MM") using string splitting
  const result = await Booking.aggregate([
    { $match: match },
    {
      $project: {
        hour: {
          $toInt: {
            $arrayElemAt: [{ $split: ['$startTime', ':'] }, 0]
          }
        }
      }
    },
    {
      $group: {
        _id: '$hour',
        bookingCount: { $sum: 1 }
      }
    }
  ]);

  const hoursMap = {};
  for (let i = 0; i < 24; i++) {
    hoursMap[i] = 0;
  }

  result.forEach(r => {
    if (r._id !== null && r._id >= 0 && r._id < 24) {
      hoursMap[r._id] = r.bookingCount;
    }
  });

  return Object.entries(hoursMap).map(([hour, bookingCount]) => ({
    hour: Number(hour),
    bookingCount
  }));
};

const getSuperAdminAnalytics = async () => {
  const totalBusinesses = await Business.countDocuments();
  const totalBookings = await Booking.countDocuments();

  const todayStr = new Date().toISOString().split('T')[0];
  const bookingsToday = await Booking.countDocuments({ date: todayStr });

  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
  const globalCancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  // Aggregate top 5 performing businesses
  const topBusinessesResult = await Booking.aggregate([
    {
      $group: {
        _id: '$businessId',
        bookingCount: { $sum: 1 }
      }
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'businesses',
        localField: '_id',
        foreignField: '_id',
        as: 'businessDetails'
      }
    },
    { $unwind: { path: '$businessDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ['$businessDetails.name', 'Deleted Business'] },
        bookingCount: 1
      }
    }
  ]);

  return {
    totalBusinesses,
    totalBookings,
    bookingsToday,
    globalCancellationRate,
    topBusinesses: topBusinessesResult
  };
};

module.exports = {
  getAnalyticsSummary,
  getPeakHours,
  getSuperAdminAnalytics
};
