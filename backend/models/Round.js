const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true
  },
  crashPoint: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: Number,
    default: 0
  },
  seed: {
    type: String, // For provably fair (future implementation)
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Round', roundSchema);
