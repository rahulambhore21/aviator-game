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

// Admin game control endpoints
router.post('/control', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { action, crashPoint } = req.body;

    switch (action) {
      case 'start':
        // Access gameEngine through global or pass it to routes
        if (global.gameEngine) {
          global.gameEngine.adminStartRound();
          res.json({ success: true, message: 'Round started manually' });
        } else {
          res.status(500).json({ message: 'Game engine not available' });
        }
        break;

      case 'pause':
        if (global.gameEngine) {
          global.gameEngine.adminPauseRound();
          res.json({ success: true, message: 'Round paused' });
        } else {
          res.status(500).json({ message: 'Game engine not available' });
        }
        break;

      case 'setCrash':
        if (global.gameEngine && crashPoint) {
          global.gameEngine.adminSetCrash(parseFloat(crashPoint));
          res.json({ success: true, message: `Manual crash point set to ${crashPoint}` });
        } else {
          res.status(400).json({ message: 'Invalid crash point or game engine not available' });
        }
        break;

      default:
        res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin control error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current game state for admin
router.get('/game-state', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (global.gameEngine) {
      const gameState = global.gameEngine.getGameState();
      res.json(gameState);
    } else {
      res.status(500).json({ message: 'Game engine not available' });
    }
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
