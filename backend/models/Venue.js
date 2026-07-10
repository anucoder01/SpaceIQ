const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Available', 'Under Maintenance'],
    default: 'Available'
  },
  svgId: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
