const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: null
  },
  reference: {
    type: String,
    unique: true,
    required: true
  },
  adminNotes: {
    type: String,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
