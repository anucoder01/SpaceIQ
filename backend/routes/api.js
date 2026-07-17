const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const analyticsController = require('../controllers/analyticsController');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretspaceiq';

// JWT Auth Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'FacilityAdmin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// Login Route
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require('../models/User');
    const user = await User.findOne({ email });
    
    if (user && await user.matchPassword(password)) {
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Route for Audit Logs
router.get('/audit-logs', authenticate, isAdmin, async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find().sort({ createdAt: -1 }).populate('performedBy', 'name email role');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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
