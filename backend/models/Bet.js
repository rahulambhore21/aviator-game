const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roundId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  multiplier: {
    type: Number,
    default: null // null if not cashed out
  },
  payout: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cashed_out', 'lost', 'cancelled'],
    default: 'active'
  },
  cashedOut: {
    type: Boolean,
    default: false
  },
  cashOutTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bet', betSchema);
