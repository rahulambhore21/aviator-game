require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');
const GameEngine = require('./gameEngine');
const User = require('./models/User');
const Bet = require('./models/Bet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "https://aviator-game-rahul.vercel.app",
      "http://localhost:3000",
      "https://aviator-game-rahul.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make IO available globally for real-time updates
global.io = io;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://aviator-game-rahul.vercel.app",
    "http://localhost:3000",
    "https://aviator-game-rahul.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crashgame')
  .then(() => console.log('🎯 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize game engine
const gameEngine = new GameEngine(io);

// Make game engine available to admin routes
app.locals.gameEngine = gameEngine;

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔗 User ${socket.user.email} connected`);

  // Send current game state to new connection
  socket.emit('game-state', gameEngine.gameState);

  // Handle bet placement
  socket.on('place-bet', async (data) => {
    try {
      const { amount } = data;
      const user = await User.findById(socket.userId);

      if (!user || user.getAvailableBalance() < amount) {
        socket.emit('error', { 
          message: `Insufficient available balance. Available: ${user ? user.getAvailableBalance() : 0} coins${user && user.reservedBalance > 0 ? ` (${user.reservedBalance} coins reserved)` : ''}` 
        });
        return;
      }

      const result = gameEngine.placeBet(socket.userId, amount, socket.id);
      
      if (result.success) {
        // Deduct balance
        user.balance -= amount;
        await user.save();

        // Create bet record
        const bet = new Bet({
          user: user._id,
          amount,
          roundId: gameEngine.gameState.roundId,
          status: 'active'
        });
        await bet.save();

        socket.emit('bet-placed', { newBalance: user.balance });
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      console.error('Bet placement error:', error);
      socket.emit('error', { message: 'Failed to place bet' });
    }
  });

  // Handle cash out
  socket.on('cash-out', async () => {
    try {
      const result = gameEngine.cashOut(socket.userId);
      
      if (result.success) {
        const user = await User.findById(socket.userId);
        user.balance += result.payout;
        await user.save();

        // Update bet record
        await Bet.findOneAndUpdate(
          { user: user._id, roundId: gameEngine.gameState.roundId, status: 'active' },
          { 
            status: 'cashed_out',
            multiplier: result.multiplier,
            payout: result.payout
          }
        );

        socket.emit('cash-out-success', {
          payout: result.payout,
          multiplier: result.multiplier,
          newBalance: user.balance
        });
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      console.error('Cash out error:', error);
      socket.emit('error', { message: 'Failed to cash out' });
    }
  });

  // Handle bet cancellation
  socket.on('bet-cancelled', async (data) => {
    try {
      const { amount, roundId } = data;
      const user = await User.findById(socket.userId);

      // Verify the bet exists and can be cancelled
      if (!user || gameEngine.gameState.isActive) {
        socket.emit('error', { message: 'Cannot cancel bet at this time' });
        return;
      }

      // Remove bet from game engine
      const removed = gameEngine.activeBets.delete(socket.userId);
      
      if (removed) {
        // Restore user balance
        user.balance += amount;
        await user.save();

        // Remove or update bet record
        await Bet.findOneAndUpdate(
          { user: user._id, roundId: roundId, status: 'active' },
          { status: 'cancelled' }
        );

        socket.emit('bet-cancelled-success', { 
          newBalance: user.balance,
          availableBalance: user.getAvailableBalance(),
          reservedBalance: user.reservedBalance
        });
      } else {
        socket.emit('error', { message: 'No active bet to cancel' });
      }
    } catch (error) {
      console.error('Bet cancellation error:', error);
      socket.emit('error', { message: 'Failed to cancel bet' });
    }
  });

  // Admin controls
  socket.on('admin-start-round', () => {
    if (socket.user.isAdmin) {
      gameEngine.adminStartRound();
    }
  });

  socket.on('admin-pause-round', () => {
    if (socket.user.isAdmin) {
      gameEngine.adminPauseRound();
    }
  });

  socket.on('admin-set-crash', (data) => {
    if (socket.user.isAdmin) {
      gameEngine.adminSetCrash(data.crashPoint);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User ${socket.user.email} disconnected`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game engine initialized`);
});
