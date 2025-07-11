const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's transaction history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    console.log('Wallet history request for user:', req.user._id, 'Email:', req.user.email);
    
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
      
    const total = await Transaction.countDocuments({ user: req.user._id });
    
    console.log(`Found ${transactions.length} transactions for user ${req.user.email}`);
    
    res.json({
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Wallet history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request deposit
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit amount is 100 coins' });
    }
    
    if (amount > 100000) {
      return res.status(400).json({ message: 'Maximum deposit amount is 100,000 coins' });
    }
    
    // Check for pending deposits
    const pendingDeposit = await Transaction.findOne({
      user: req.user._id,
      type: 'deposit',
      status: 'pending'
    });
    
    if (pendingDeposit) {
      return res.status(400).json({ message: 'You already have a pending deposit request' });
    }
    
    const transaction = new Transaction({
      user: req.user._id,
      type: 'deposit',
      amount,
      paymentMethod,
      reference: `DEP_${Date.now()}_${req.user._id.toString().slice(-4)}`
    });
    
    await transaction.save();
    
    res.json({
      message: 'Deposit request submitted successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request withdrawal
router.post('/withdrawal', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is 100 coins' });
    }

    // Get user with latest data
    const user = await User.findById(req.user._id);
    const availableBalance = user.getAvailableBalance();
    
    if (amount > availableBalance) {
      return res.status(400).json({ 
        message: `Insufficient available balance. Available: ${availableBalance} coins (${user.reservedBalance} coins reserved for pending withdrawals)` 
      });
    }
    
    // Check for pending withdrawals
    const pendingWithdrawal = await Transaction.findOne({
      user: req.user._id,
      type: 'withdrawal',
      status: 'pending'
    });
    
    if (pendingWithdrawal) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    // Reserve the withdrawal amount
    const reserveSuccess = user.reserveAmount(amount);
    if (!reserveSuccess) {
      return res.status(400).json({ message: 'Unable to reserve amount for withdrawal' });
    }
    
    await user.save();
    
    const transaction = new Transaction({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      paymentMethod,
      reference: `WTH_${Date.now()}_${req.user._id.toString().slice(-4)}`
    });
    
    await transaction.save();
    
    // Emit real-time balance update to show immediate reservation
    if (global.io) {
      global.io.emit('balance-update', {
        userId: req.user._id.toString(),
        newBalance: user.balance,
        availableBalance: user.getAvailableBalance(),
        reservedBalance: user.reservedBalance
      });
    }
    
    res.json({
      message: 'Withdrawal request submitted successfully. Amount has been reserved.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      },
      availableBalance: user.getAvailableBalance(),
      reservedBalance: user.reservedBalance
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending transaction
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pendingTransactions = await Transaction.find({
      user: req.user._id,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    res.json({ pendingTransactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
