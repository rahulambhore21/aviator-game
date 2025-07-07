const express = require('express');
const User = require('../models/User');
const Bet = require('../models/Bet');
const Round = require('../models/Round');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBets = await Bet.countDocuments();
    
    const totalVolumeResult = await Bet.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const currentRound = await Round.findOne().sort({ createdAt: -1 });

    res.json({
      totalUsers,
      activeUsers: 0, // You can implement active user tracking
      totalBets,
      totalVolume: totalVolumeResult[0]?.total || 0,
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

module.exports = router;
