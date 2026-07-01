const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'Projector', 'Microphone', 'Whiteboard'
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available'
  },
  currentVenue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
