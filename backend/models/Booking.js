const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Displaced'],
    default: 'Pending'
  },
  priority: {
    type: Number,
    default: 1 // Higher number means higher priority. E.g., Student=1, Faculty=2, Admin=3
  },
  purpose: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
