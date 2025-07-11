const express = require('express');
const User = require('../models/User');
const Bet = require('../models/Bet');
const Round = require('../models/Round');
const Transaction = require('../models/Transaction');
const AdminLog = require('../models/AdminLog');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper function to log admin actions
const logAdminAction = async (adminId, action, details = {}, req = null) => {
  try {
    const logData = {
      admin: adminId,
      action,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent')
    };
    
    if (details.targetUser) logData.targetUser = details.targetUser;
    if (details.targetTransaction) logData.targetTransaction = details.targetTransaction;
    
    await new AdminLog(logData).save();
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// ====== DASHBOARD STATS ======
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const totalBets = await Bet.countDocuments();
    
    const totalVolumeResult = await Bet.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalPayoutResult = await Bet.aggregate([
      { $match: { cashedOut: true } },
      { $group: { _id: null, total: { $sum: '$payout' } } }
    ]);
    
    const currentRound = await Round.findOne().sort({ createdAt: -1 });
    
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      activeUsers,
      totalBets,
      totalVolume: totalVolumeResult[0]?.total || 0,
      totalPayout: totalPayoutResult[0]?.total || 0,
      profit: (totalVolumeResult[0]?.total || 0) - (totalPayoutResult[0]?.total || 0),
      pendingTransactions,
      currentRound: currentRound ? {
        id: currentRound.roundId,
        isActive: !currentRound.endTime,
        betsCount: currentRound.totalBets,
        totalVolume: currentRound.totalVolume
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== USER MANAGEMENT ======
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    const query = {};
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.accountStatus = status;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
      
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's bet history
    const bets = await Bet.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Get user's transaction history
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ user, bets, transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/users/:userId/balance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { amount, action, reason } = req.body; // action: 'credit' or 'debit'
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const oldBalance = user.balance;
    
    if (action === 'credit') {
      user.balance += amount;
    } else if (action === 'debit') {
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.balance -= amount;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    await user.save();
    
    // Log admin action
    await logAdminAction(req.user._id, `balance_${action}`, {
      targetUser: user._id,
      amount,
      oldValue: oldBalance,
      newValue: user.balance,
      reason
    }, req);
    
    res.json({ 
      message: `Balance ${action}ed successfully`,
      user: {
        id: user._id,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, reason } = req.body; // status: 'active', 'frozen', 'suspended'
    
    if (!['active', 'frozen', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const oldStatus = user.accountStatus;
    user.accountStatus = status;
    await user.save();
    
    // Log admin action
    const action = status === 'active' ? 'account_unfreeze' : 'account_freeze';
    await logAdminAction(req.user._id, action, {
      targetUser: user._id,
      oldValue: oldStatus,
      newValue: status,
      reason
    }, req);
    
    res.json({ 
      message: `Account status updated to ${status}`,
      user: {
        id: user._id,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== TRANSACTION MANAGEMENT ======
router.get('/transactions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const type = req.query.type || '';
    
    console.log('📋 Fetching transactions with filters:', { page, limit, status, type });
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const transactions = await Transaction.find(query)
      .populate('user', 'email')
      .populate('processedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
      
    const total = await Transaction.countDocuments(query);
    
    console.log(`📊 Found ${transactions.length} transactions out of ${total} total`);
    
    // Ensure proper structure for frontend with better error handling
    const formattedTransactions = transactions.map(transaction => {
      const formatted = {
        _id: transaction._id,
        user: transaction.user ? { email: transaction.user.email } : { email: 'Unknown user' },
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod || null,
        adminNotes: transaction.adminNotes || null,
        processedBy: transaction.processedBy ? { email: transaction.processedBy.email } : null,
        processedAt: transaction.processedAt,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      };
      
      if (!transaction.user) {
        console.warn(`⚠️ Transaction ${transaction._id} has no user populated`);
      }
      
      return formatted;
    });
    
    res.json({
      transactions: formattedTransactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
    

router.post('/transactions/:transactionId/process', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('user');
      
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }
    
    const oldBalance = transaction.user.balance;
    const oldReservedBalance = transaction.user.reservedBalance;
    const userId = transaction.user._id.toString();
    
    if (action === 'approve') {
      if (transaction.type === 'deposit') {
        transaction.user.balance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        // For withdrawals, we need to:
        // 1. First check if user still has the reserved amount
        if (transaction.user.reservedBalance < transaction.amount) {
          return res.status(400).json({ 
            message: 'User no longer has sufficient reserved balance for withdrawal. Amount may have been spent.' 
          });
        }
        
        // 2. Check if total balance is sufficient (safety check)
        if (transaction.user.balance < transaction.amount) {
          return res.status(400).json({ 
            message: 'User has insufficient total balance for withdrawal' 
          });
        }
        
        // 3. Release the reserved amount and deduct from balance
        transaction.user.releaseReservedAmount(transaction.amount);
        transaction.user.balance -= transaction.amount;
      }
      await transaction.user.save();
      transaction.status = 'approved';
    } else {
      // If rejected, release reserved amount for withdrawals
      if (transaction.type === 'withdrawal') {
        transaction.user.releaseReservedAmount(transaction.amount);
        await transaction.user.save();
      }
      transaction.status = 'rejected';
    }
    
    transaction.adminNotes = notes;
    transaction.processedBy = req.user._id;
    transaction.processedAt = new Date();
    await transaction.save();
    
    // Emit real-time update to the specific user
    if (global.io) {
      const transactionData = {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        adminNotes: transaction.adminNotes,
        createdAt: transaction.createdAt,
        processedAt: transaction.processedAt,
        reference: transaction.reference
      };

      global.io.emit('transaction-update', transactionData);
      
      // Also emit balance update specifically
      global.io.emit('balance-update', {
        userId: userId,
        newBalance: transaction.user.balance,
        availableBalance: transaction.user.getAvailableBalance(),
        reservedBalance: transaction.user.reservedBalance
      });
    }
    
    // Log admin action
    await logAdminAction(req.user._id, `transaction_${action}`, {
      targetUser: transaction.user._id,
      targetTransaction: transaction._id,
      amount: transaction.amount,
      oldValue: oldBalance,
      newValue: transaction.user.balance,
      notes
    }, req);
    
    res.json({ 
      message: `Transaction ${action}d successfully`,
      transaction 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== GAME ENGINE MANAGEMENT ======
router.post('/game/crash-point', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { crashPoint } = req.body;
    
    if (!crashPoint || crashPoint < 1.01 || crashPoint > 100) {
      return res.status(400).json({ message: 'Invalid crash point (1.01 - 100.00)' });
    }
    
    // This will be handled by the game engine
    req.app.locals.gameEngine?.adminSetCrash(crashPoint);
    
    // Log admin action
    await logAdminAction(req.user._id, 'crash_set', {
      newValue: crashPoint
    }, req);
    
    res.json({ message: `Crash point set to ${crashPoint}x for next round` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/game/pause', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    req.app.locals.gameEngine?.adminPauseRound();
    
    // Log admin action
    await logAdminAction(req.user._id, 'game_pause', {}, req);
    
    res.json({ message: 'Game paused successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/game/resume', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    req.app.locals.gameEngine?.adminStartRound();
    
    // Log admin action
    await logAdminAction(req.user._id, 'game_resume', {}, req);
    
    res.json({ message: 'Game resumed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== ANALYTICS & REPORTS ======
router.get('/analytics/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Bet volume over time
    const volumeData = await Bet.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          volume: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Multiplier distribution
    const multiplierData = await Round.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $bucket: {
          groupBy: "$crashPoint",
          boundaries: [1, 2, 3, 5, 10, 50, 100],
          default: "100+",
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    
    // Top players
    const topPlayers = await Bet.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          totalBets: { $sum: "$amount" },
          totalWins: { $sum: "$payout" },
          betCount: { $sum: 1 }
        }
      },
      { $sort: { totalBets: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ]);
    
    res.json({
      volumeData,
      multiplierData,
      topPlayers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== ADMIN LOGS ======
router.get('/logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const logs = await AdminLog.find()
      .populate('admin', 'email')
      .populate('targetUser', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
      
    const total = await AdminLog.countDocuments();
    
    res.json({
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
