const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const analyticsController = require('../controllers/analyticsController');

// Placeholder for auth middleware
const authenticate = (req, res, next) => {
  // Mock authentication - in a real app this would verify JWT
  req.user = { _id: 'mock_user_id', role: 'Student' };
  next();
};

// Bookings
router.post('/bookings', authenticate, bookingController.createBooking);
router.get('/bookings', authenticate, bookingController.getAllBookings);
router.get('/bookings/today', authenticate, bookingController.getTodayBookings);
router.delete('/bookings/:id', authenticate, bookingController.cancelBooking);

const User = require('../models/User');
router.get('/users/search', authenticate, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const users = await User.find({ name: { $regex: query, $options: 'i' } }).select('name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics
router.get('/analytics/dashboard', authenticate, analyticsController.getDashboardAnalytics);

// Smart Suggestions
router.get('/recommendations', authenticate, (req, res) => {
  res.json({
    suggestedVenue: {
      id: 'conf-a',
      name: 'Conf A',
      reason: 'Based on your frequent bookings for 5 people.',
      timeSlot: '10:00 AM - 11:00 AM'
    }
  });
});

// Venues and Assets (Mocked routes for now to keep things simple and functional)
const Venue = require('../models/Venue');
router.get('/venues', async (req, res) => {
  const venues = await Venue.find();
  res.json(venues);
});
router.post('/venues', async (req, res) => {
  const newVenue = new Venue(req.body);
  await newVenue.save();
  res.status(201).json(newVenue);
});

module.exports = router;
