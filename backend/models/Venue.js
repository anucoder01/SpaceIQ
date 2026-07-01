const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Available', 'Under Maintenance'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
