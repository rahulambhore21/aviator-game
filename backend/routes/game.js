const express = require('express');
const Bet = require('../models/Bet');
const Round = require('../models/Round');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user bet history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get game statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalBets = await Bet.countDocuments({ user: req.user._id });
    const totalWinnings = await Bet.aggregate([
      { $match: { user: req.user._id, cashedOut: true } },
      { $group: { _id: null, total: { $sum: '$payout' } } }
    ]);

    const recentRounds = await Round.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalBets,
      totalWinnings: totalWinnings[0]?.total || 0,
      recentRounds
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
