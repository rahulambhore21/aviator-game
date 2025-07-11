const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 10000 // Starting balance of 10,000 coins
  },
  reservedBalance: {
    type: Number,
    default: 0 // Amount reserved for pending withdrawals
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  accountStatus: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate available balance (total balance minus reserved amount)
userSchema.methods.getAvailableBalance = function() {
  return Math.max(0, this.balance - this.reservedBalance);
};

// Reserve amount for withdrawal
userSchema.methods.reserveAmount = function(amount) {
  if (this.getAvailableBalance() >= amount) {
    this.reservedBalance += amount;
    return true;
  }
  return false;
};

// Release reserved amount (withdrawal rejected or approved)
userSchema.methods.releaseReservedAmount = function(amount) {
  this.reservedBalance = Math.max(0, this.reservedBalance - amount);
};

module.exports = mongoose.model('User', userSchema);
