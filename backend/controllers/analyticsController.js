const Booking = require('../models/Booking');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Pipeline to find highest utilized rooms
    const venueUtilization = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $group: {
          _id: '$venue',
          totalBookings: { $sum: 1 },
          // Simple approximation of utilization - total hours booked could be better, but count is a start
      }},
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'venueDetails'
      }},
      { $unwind: '$venueDetails' }
    ]);

    // Pipeline to find peak booking hours
    const peakHours = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $project: {
          hourOfStart: { $hour: '$startTime' }
      }},
      { $group: {
          _id: '$hourOfStart',
          count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      venueUtilization: venueUtilization.map(v => ({
        venueName: v.venueDetails.name,
        building: v.venueDetails.building,
        bookings: v.totalBookings
      })),
      peakHours: peakHours.map(p => ({
        hour: p._id,
        bookings: p.count
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
