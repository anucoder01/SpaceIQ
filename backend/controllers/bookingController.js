const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');

async function createAuditLog(action, entityType, entityId, performedBy, details) {
  try {
    const lastLog = await AuditLog.findOne().sort({ createdAt: -1 });
    const previousHash = lastLog ? lastLog.hash : 'GENESIS';

    const log = new AuditLog({
      action,
      entityType,
      entityId,
      performedBy,
      details: JSON.stringify(details),
      previousHash
    });
    await log.save();
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
}

exports.createBooking = async (req, res) => {
  try {
    const { venue, assets, startTime, endTime, purpose, priority, joinWaitlist } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for conflicts
    const conflictingBookings = await Booking.find({
      venue,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflictingBookings.length > 0) {
      // Conflict exists
      const maxConflictingPriority = Math.max(...conflictingBookings.map(b => b.priority));

      if (priority > maxConflictingPriority) {
        // Higher priority (e.g., Admin overriding Student)
        // Displace lower priority bookings
        await Booking.updateMany(
          { _id: { $in: conflictingBookings.map(b => b._id) } },
          { $set: { status: 'Displaced' } }
        );
        
        // Auto-create new booking
        const newBooking = new Booking({
          user: req.user._id, // Assuming req.user is set by auth middleware
          venue,
          assets,
          startTime: start,
          endTime: end,
          purpose,
          priority,
          status: 'Approved' // Admin bookings might be auto-approved
        });
        await newBooking.save();
        await createAuditLog('BOOKING_CREATED_DISPLACED', 'Booking', newBooking._id, req.user._id, { priority, purpose, venue });
        
        return res.status(201).json({ 
          message: 'Booking successful. Conflicting lower-priority bookings were displaced.',
          booking: newBooking 
        });

      } else {
        if (joinWaitlist) {
          const newBooking = new Booking({
            user: req.user._id,
            venue,
            assets,
            startTime: start,
            endTime: end,
            purpose,
            priority,
            status: 'Waitlisted'
          });
          await newBooking.save();
          await createAuditLog('BOOKING_WAITLISTED', 'Booking', newBooking._id, req.user._id, { priority, purpose, venue });
          return res.status(201).json({ message: 'Successfully joined the waitlist.', booking: newBooking });
        }

        // Same or lower priority - suggest alternatives
        const requestedVenue = await Venue.findById(venue);
        const capacityRequired = requestedVenue ? requestedVenue.capacity : 0;

        // Find available alternative venues
        const allVenues = await Venue.find({ capacity: { $gte: capacityRequired }, status: 'Available' });
        
        const alternatives = [];
        for (let v of allVenues) {
          if (v._id.toString() === venue.toString()) continue;

          const conflict = await Booking.findOne({
            venue: v._id,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
              { startTime: { $lt: end }, endTime: { $gt: start } }
            ]
          });

          if (!conflict) {
            alternatives.push(v);
          }
        }

        return res.status(409).json({
          message: 'Venue is already booked for this time slot.',
          alternatives
        });
      }
    }

    // No conflict
    const newBooking = new Booking({
      user: req.user._id, // Set by auth middleware
      venue,
      assets,
      startTime: start,
      endTime: end,
      purpose,
      priority
    });
    
    await newBooking.save();
    await createAuditLog('BOOKING_CREATED', 'Booking', newBooking._id, req.user._id, { priority, purpose, venue });
    res.status(201).json({ message: 'Booking request created successfully.', booking: newBooking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = {};
    if (start && end) {
      query = {
        startTime: { $lt: new Date(end) },
        endTime: { $gt: new Date(start) }
      };
    }
    const bookings = await Booking.find(query).populate('user', 'name email role').populate('venue').populate('assets');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTodayBookings = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
      status: { $in: ['Pending', 'Approved', 'Waitlisted'] }
    }).populate('user', 'name email').populate('venue');
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    await createAuditLog('BOOKING_CANCELLED', 'Booking', booking._id, req.user._id, { originalStatus: booking.status });

    // Check for waitlisted bookings for the same venue overlapping the canceled time
    const waitlistedBooking = await Booking.findOne({
      venue: booking.venue,
      status: 'Waitlisted',
      startTime: { $lt: booking.endTime },
      endTime: { $gt: booking.startTime }
    }).sort({ createdAt: 1 });

    if (waitlistedBooking) {
      // Approve the oldest waitlisted booking
      waitlistedBooking.status = 'Approved';
      await waitlistedBooking.save();
      await createAuditLog('BOOKING_APPROVED_FROM_WAITLIST', 'Booking', waitlistedBooking._id, req.user._id, { reason: 'Slot became available' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addBookingFee = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const { type, amount, reason } = req.body;
    if (!type || !amount) return res.status(400).json({ error: 'Type and amount are required' });

    booking.fees.push({ type, amount, reason });
    await booking.save();

    await createAuditLog('BOOKING_FEE_ADDED', 'Booking', booking._id, req.user._id, { type, amount, reason });
    
    res.json({ message: 'Fee added successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
