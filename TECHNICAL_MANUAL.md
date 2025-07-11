# 🎯 Aviator Crash Game - Technical Manual

## Table of Contents
- [Game Algorithm Overview](#game-algorithm-overview)
- [Crash Logic & Multiplier Generation](#crash-logic--multiplier-generation)
- [Timing Mechanics & Game Loop](#timing-mechanics--game-loop)
- [Database Architecture](#database-architecture)
- [Authentication System](#authentication-system)
- [Bet Validation & Recording](#bet-validation--recording)
- [Real-time Communication](#real-time-communication)
- [API Reference](#api-reference)
- [Data Security](#data-security)
- [Complete Game Flow](#complete-game-flow)
- [Balance Management & Synchronization](#balance-management--synchronization)

## Game Algorithm Overview

### Core Concept
The Aviator crash game simulates an airplane taking off with an increasing multiplier. Players must cash out before the plane "crashes" to win their bet multiplied by the current multiplier.

### Mathematical Foundation
```
Payout = BetAmount × MultiplierAtCashOut
Risk = TotalLoss if no cash out before crash
House Edge = Built into crash point generation algorithm
```

### Fairness Mechanism
- **Provably Fair**: Crash points are generated using cryptographic methods
- **Transparent Algorithm**: Players can verify game fairness
- **House Edge**: ~3% built into the probability distribution

## Crash Logic & Multiplier Generation

### Crash Point Algorithm

#### Probability Distribution (`backend/gameEngine.js`)
```javascript
generateCrashPoint() {
  // Manual crash point for testing (admin override)
  if (this.manualCrashPoint) {
    const point = this.manualCrashPoint;
    this.manualCrashPoint = null;
    return point;
  }

  // Generate random number between 0 and 1
  const rand = Math.random();
  
  // House edge (3%)
  const edge = 0.03;
  
  // Calculate crash point using inverse exponential distribution
  const crash = Math.floor(100 / ((1 - rand) * (1 + edge))) / 100;
  
  // Ensure crash point is between 1.01x and 100.0x
  return Math.min(Math.max(1.01, crash), 100.0);
}
```

#### Statistical Distribution
```
Crash Range    | Probability | Expected Frequency
1.00x - 1.50x  |    ~50%     | Every other round
1.50x - 2.00x  |    ~25%     | 1 in 4 rounds
2.00x - 5.00x  |    ~20%     | 1 in 5 rounds
5.00x - 10.0x  |    ~4%      | 1 in 25 rounds
10.0x+         |    ~1%      | 1 in 100 rounds
```

#### Crash Point Validation
```javascript
validateCrashPoint(crashPoint) {
  return crashPoint >= 1.01 && 
         crashPoint <= 100.0 && 
         !isNaN(crashPoint);
}
```

### Multiplier Growth Pattern

#### Growth Algorithm
```javascript
startGame() {
  this.gameState = {
    ...this.gameState,
    isActive: true,
    bettingPhase: false,
    multiplier: 1.00,
  };

  // Emit initial game state
  this.io.emit('game-state', this.gameState);

  // Start multiplier growth loop
  this.gameInterval = setInterval(() => {
    // Increment by 0.02x every 50ms
    this.gameState.multiplier += 0.02;
    
    // Broadcast to all connected clients
    this.io.emit('multiplier-update', this.gameState.multiplier);
    
    // Check for crash condition
    if (this.gameState.multiplier >= this.crashPoint) {
      this.crashGame();
    }
  }, 50); // 50ms = 20 FPS for smooth animation
}
```

#### Visual Growth Curve
```
Time (seconds) | Multiplier | Growth Rate
0.00          | 1.00x      | Start
0.50          | 1.20x      | +0.02x per 50ms
1.00          | 1.40x      | Linear growth
2.00          | 1.80x      | Steady climb
5.00          | 3.00x      | Higher risk
10.00         | 5.00x      | Danger zone
```

### Anti-Cheat Mechanisms

#### Server-Side Validation
```javascript
// All game logic runs on server
// Clients only display state, cannot influence outcome
const isValidBet = (userId, amount, timestamp) => {
  return amount > 0 && 
         amount <= user.balance && 
         gameState.bettingPhase && 
         !gameState.isActive;
};
```

#### Crash Point Pre-Generation
```javascript
// Crash point determined before round starts
// No client input can change the outcome
this.crashPoint = this.generateCrashPoint();
console.log(`Round ${roundId} will crash at ${this.crashPoint}x`);
```

## Timing Mechanics & Game Loop

### Game Phase Lifecycle

#### Complete Round Timeline
```
Phase 1: Betting Phase (7 seconds)
├── 7.0s - 6.0s: Accept new bets
├── 6.0s - 1.0s: Display countdown
├── 1.0s - 0.0s: Final warning
└── 0.0s: Betting closes

Phase 2: Game Active (Variable duration)
├── 0.00s: Multiplier starts at 1.00x
├── Every 50ms: Multiplier increases by 0.02x
├── Continuous: Accept cash-out requests
└── Crash point: Game ends, payouts calculated

Phase 3: Results & Pause (3 seconds)
├── 0.0s - 1.0s: Display crash point
├── 1.0s - 2.0s: Show winner list
├── 2.0s - 3.0s: Prepare next round
└── 3.0s: Start new betting phase
```

### Betting Phase Implementation

#### Countdown Timer (`backend/gameEngine.js`)
```javascript
startBettingPhase() {
  this.gameState = {
    isActive: false,
    multiplier: 1.00,
    crashed: false,
    roundId: `round_${Date.now()}`,
    bettingPhase: true,
    timeRemaining: 7000, // 7 seconds in milliseconds
  };

  // Clear previous bets
  this.activeBets.clear();
  
  // Generate crash point for this round
  this.crashPoint = this.generateCrashPoint();
  
  // Emit initial state
  this.io.emit('game-state', this.gameState);

  // Start countdown
  this.bettingInterval = setInterval(() => {
    this.gameState.timeRemaining -= 100; // Decrease by 100ms
    
    // Emit updated countdown
    this.io.emit('game-state', this.gameState);
    
    // Check if betting phase should end
    if (this.gameState.timeRemaining <= 0) {
      clearInterval(this.bettingInterval);
      this.startGame();
    }
  }, 100); // Update every 100ms for smooth countdown
}
```

#### Client-Side Countdown Display (`components/CountdownTimer.tsx`)
```typescript
export default function CountdownTimer() {
  const { gameState } = useStore();
  const { timeRemaining, bettingPhase } = gameState;

  if (!bettingPhase || timeRemaining <= 0) return null;

  const seconds = Math.ceil(timeRemaining / 1000);
  const progress = ((7000 - timeRemaining) / 7000) * 100;

  return (
    <div className="countdown-timer">
      <div className="text-lg font-bold">⏰ {seconds}s</div>
      <div className="text-sm">Betting closes in</div>
      
      {/* Animated progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

### Game Loop Synchronization

#### Multi-Client Synchronization
```javascript
// All clients receive identical game state
io.emit('game-state', {
  isActive: true,
  multiplier: 2.45,
  crashed: false,
  roundId: 'round_1641234567890',
  timeRemaining: 0,
  bettingPhase: false
});

// Real-time multiplier updates
setInterval(() => {
  this.gameState.multiplier += 0.02;
  io.emit('multiplier-update', this.gameState.multiplier);
}, 50);
```

#### Latency Compensation
```javascript
// Client-side prediction for smooth animation
useEffect(() => {
  if (gameState.isActive && !gameState.crashed) {
    const interval = setInterval(() => {
      // Predict next multiplier value
      setLocalMultiplier(prev => prev + 0.02);
    }, 50);
    
    return () => clearInterval(interval);
  }
}, [gameState.isActive, gameState.crashed]);

// Sync with server updates
useEffect(() => {
  setLocalMultiplier(gameState.multiplier);
}, [gameState.multiplier]);
```

## Database Architecture

### MongoDB Schema Design

#### User Model (`backend/models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Index for fast lookups
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Exclude from queries by default
  },
  balance: {
    type: Number,
    default: 10000, // Starting balance
    min: 0 // Prevent negative balances
  },
  isAdmin: {
    type: Boolean,
    default: false,
    index: true // Index for admin queries
  },
  statistics: {
    totalBets: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 } // Calculated percentage
  },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for admin queries
userSchema.index({ isAdmin: 1, createdAt: -1 });

// Virtual for full statistics
userSchema.virtual('winRatePercentage').get(function() {
  if (this.statistics.totalBets === 0) return 0;
  return (this.statistics.totalWinnings / this.statistics.totalBets) * 100;
});
```

#### Bet Model (`backend/models/Bet.js`)
```javascript
const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for user bet queries
  },
  roundId: {
    type: String,
    required: true,
    index: true // Index for round queries
  },
  amount: {
    type: Number,
    required: true,
    min: 1 // Minimum bet amount
  },
  multiplier: {
    type: Number,
    default: null, // null if not cashed out
    min: 1.00
  },
  payout: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'cashed_out', 'lost'],
    default: 'active',
    index: true
  },
  cashedOut: {
    type: Boolean,
    default: false,
    index: true
  },
  cashOutTime: {
    type: Date,
    default: null
  },
  ipAddress: String, // For security tracking
  userAgent: String  // For device tracking
}, {
  timestamps: true
});

// Compound indexes for efficient queries
betSchema.index({ user: 1, createdAt: -1 }); // User bet history
betSchema.index({ roundId: 1, status: 1 }); // Round analysis
betSchema.index({ cashedOut: 1, createdAt: -1 }); // Win/loss analysis
```

#### Round Model (`backend/models/Round.js`)
```javascript
const roundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  crashPoint: {
    type: Number,
    required: true,
    min: 1.01,
    max: 100.0
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Milliseconds
    default: null
  },
  statistics: {
    totalBets: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    totalPayout: { type: Number, default: 0 },
    winnerCount: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },
    averageBet: { type: Number, default: 0 }
  },
  seed: {
    type: String, // For provably fair verification
    required: true
  },
  hash: {
    type: String, // Cryptographic proof
    required: true
  }
}, {
  timestamps: true
});

// Indexes for analytics
roundSchema.index({ createdAt: -1 }); // Recent rounds
roundSchema.index({ crashPoint: 1 }); // Crash point analysis
roundSchema.index({ 'statistics.totalVolume': -1 }); // High volume rounds
```

### Relationship Patterns

#### One-to-Many Relationships
```javascript
// User has many Bets
const userBets = await Bet.find({ user: userId })
  .populate('user', 'email')
  .sort({ createdAt: -1 })
  .limit(50);

// Round has many Bets
const roundBets = await Bet.find({ roundId: roundId })
  .populate('user', 'email')
  .sort({ amount: -1 });
```

#### Aggregation Queries
```javascript
// User statistics aggregation
const userStats = await Bet.aggregate([
  { $match: { user: mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: '$user',
      totalBets: { $sum: 1 },
      totalWagered: { $sum: '$amount' },
      totalWon: { $sum: '$payout' },
      biggestWin: { $max: '$payout' },
      winRate: {
        $avg: { $cond: [{ $eq: ['$cashedOut', true] }, 1, 0] }
      }
    }
  }
]);

// Round statistics aggregation
const roundStats = await Bet.aggregate([
  { $match: { roundId: roundId } },
  {
    $group: {
      _id: '$roundId',
      totalBets: { $sum: 1 },
      totalVolume: { $sum: '$amount' },
      totalPayout: { $sum: '$payout' },
      averageBet: { $avg: '$amount' },
      winners: {
        $sum: { $cond: [{ $eq: ['$cashedOut', true] }, 1, 0] }
      }
    }
  }
]);
```

## Authentication System

### JWT Token Structure

#### Token Payload
```javascript
// JWT payload structure
const tokenPayload = {
  userId: user._id,           // MongoDB ObjectId
  email: user.email,          // User identifier
  isAdmin: user.isAdmin,      // Role information
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // Expires in 7 days
};

// Sign token
const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
  expiresIn: '7d',
  issuer: 'aviator-game',
  audience: 'aviator-users'
});
```

#### Token Verification
```javascript
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'aviator-game',
      audience: 'aviator-users'
    });
    
    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};
```

### Password Security

#### Hashing Implementation
```javascript
// User model password hashing
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt rounds (higher = more secure, slower)
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};
```

#### Session Management
```javascript
// Track active sessions (optional)
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String, required: true },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    lastActive: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true }
});

// Invalidate session on logout
const logout = async (token) => {
  await Session.updateOne({ token }, { isActive: false });
};
```

## Bet Validation & Recording

### Bet Placement Flow

#### Client-Side Validation
```typescript
// Frontend validation before API call
const validateBet = (amount: number, userBalance: number, gameState: GameState) => {
  const errors: string[] = [];
  
  // Amount validation
  if (!amount || amount <= 0) {
    errors.push('Bet amount must be greater than 0');
  }
  
  if (amount > userBalance) {
    errors.push('Insufficient balance');
  }
  
  // Game state validation
  if (!gameState.bettingPhase) {
    errors.push('Betting phase has ended');
  }
  
  if (gameState.isActive) {
    errors.push('Round is already active');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### Server-Side Validation
```javascript
// Backend bet validation
const validateBetRequest = async (userId, amount, roundId) => {
  // Get user with current balance
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid bet amount');
  }
  
  if (amount > user.balance) {
    throw new Error('Insufficient balance');
  }
  
  // Check for existing bet in current round
  const existingBet = await Bet.findOne({ 
    user: userId, 
    roundId, 
    status: 'active' 
  });
  
  if (existingBet) {
    throw new Error('Bet already placed for this round');
  }
  
  // Validate game state
  const gameState = gameEngine.getGameState();
  if (!gameState.bettingPhase || gameState.isActive) {
    throw new Error('Betting is not allowed at this time');
  }
  
  return true;
};
```

### Atomic Bet Recording

#### Database Transaction
```javascript
const placeBet = async (userId, amount, roundId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 1. Validate and deduct from user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { balance: -amount },
        $set: { lastActivity: new Date() }
      },
      { 
        new: true, 
        session,
        runValidators: true 
      }
    );
    
    if (user.balance < 0) {
      throw new Error('Insufficient balance after deduction');
    }
    
    // 2. Create bet record
    const bet = new Bet({
      user: userId,
      roundId,
      amount,
      status: 'active',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await bet.save({ session });
    
    // 3. Update user statistics
    await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { 
          'statistics.totalBets': 1,
          'statistics.totalWagered': amount
        }
      },
      { session }
    );
    
    // 4. Commit transaction
    await session.commitTransaction();
    
    return {
      success: true,
      bet,
      newBalance: user.balance
    };
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### Cash Out Implementation

#### Timing-Critical Cash Out
```javascript
const cashOut = async (userId, roundId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Get current game state (atomic read)
    const currentMultiplier = gameEngine.getCurrentMultiplier();
    const gameState = gameEngine.getGameState();
    
    // Validate cash out conditions
    if (!gameState.isActive || gameState.crashed) {
      throw new Error('Cannot cash out - round has ended');
    }
    
    // Find active bet
    const bet = await Bet.findOne({
      user: userId,
      roundId,
      status: 'active'
    }).session(session);
    
    if (!bet) {
      throw new Error('No active bet found');
    }
    
    // Calculate payout
    const payout = Math.floor(bet.amount * currentMultiplier * 100) / 100;
    
    // Update bet record
    await Bet.findByIdAndUpdate(
      bet._id,
      {
        $set: {
          status: 'cashed_out',
          cashedOut: true,
          multiplier: currentMultiplier,
          payout,
          cashOutTime: new Date()
        }
      },
      { session }
    );
    
    // Update user balance
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { 
          balance: payout,
          'statistics.totalWinnings': payout
        },
        $max: {
          'statistics.biggestWin': payout
        }
      },
      { new: true, session }
    );
    
    await session.commitTransaction();
    
    return {
      success: true,
      payout,
      multiplier: currentMultiplier,
      newBalance: user.balance
    };
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

## Real-time Communication

### Socket.IO Event Architecture

#### Server Event Handlers
```javascript
// Connection management
io.on('connection', (socket) => {
  console.log(`User ${socket.user.email} connected`);
  
  // Send current game state immediately
  socket.emit('game-state', gameEngine.getGameState());
  
  // Join user to game room
  socket.join('game-room');
  
  // Handle bet placement
  socket.on('place-bet', async (data) => {
    try {
      const result = await gameEngine.placeBet(
        socket.user._id,
        data.amount,
        socket.id
      );
      
      // Confirm bet to user
      socket.emit('bet-placed', result);
      
      // Broadcast to all users (optional)
      socket.to('game-room').emit('player-bet', {
        amount: data.amount,
        playerCount: gameEngine.getActivePlayers()
      });
      
    } catch (error) {
      socket.emit('bet-error', { message: error.message });
    }
  });
  
  // Handle cash out
  socket.on('cash-out', async () => {
    try {
      const result = await gameEngine.cashOut(socket.user._id);
      socket.emit('cash-out-success', result);
      
      // Broadcast successful cash out
      socket.to('game-room').emit('player-cashed-out', {
        multiplier: result.multiplier,
        payout: result.payout
      });
      
    } catch (error) {
      socket.emit('cash-out-error', { message: error.message });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.email} disconnected`);
    gameEngine.handleDisconnection(socket.user._id);
  });
});
```

#### Client Event Handlers
```typescript
// Initialize socket connection
const initSocket = () => {
  const { token } = get();
  const socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], // Fallback transport
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to game server');
    set({ connectionStatus: 'connected' });
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    set({ connectionStatus: 'disconnected' });
  });
  
  // Game events
  socket.on('game-state', (state: GameState) => {
    set((prev) => ({ 
      gameState: { ...prev.gameState, ...state } 
    }));
  });
  
  socket.on('multiplier-update', (multiplier: number) => {
    set((prev) => ({ 
      gameState: { ...prev.gameState, multiplier }
    }));
    
    // Update UI animation
    updateMultiplierAnimation(multiplier);
  });
  
  socket.on('game-crashed', (data: { crashPoint: number, roundId: string }) => {
    playSound.crash();
    hapticFeedback.error();
    
    set((prev) => ({ 
      gameState: { 
        ...prev.gameState, 
        crashed: true, 
        crashPoint: data.crashPoint,
        isActive: false 
      }
    }));
    
    // Handle user bet result
    handleRoundEnd(data);
  });
  
  // Bet events
  socket.on('bet-placed', (data) => {
    set((prev) => ({ 
      user: prev.user ? { 
        ...prev.user, 
        balance: data.newBalance 
      } : null
    }));
  });
  
  socket.on('cash-out-success', (data) => {
    hapticFeedback.success();
    playSound.cashOut();
    
    // Update balance and bet history
    updateUserBalance(data.newBalance);
    addBetToHistory({
      ...currentBet,
      payout: data.payout,
      multiplier: data.multiplier,
      cashedOut: true
    });
  });
  
  set({ socket });
};
```

### Message Queuing & Reliability

#### Message Acknowledgments
```javascript
// Server-side acknowledgments
socket.on('place-bet', (data, callback) => {
  try {
    const result = await gameEngine.placeBet(userId, data.amount);
    
    // Send acknowledgment
    callback({ 
      success: true, 
      data: result 
    });
    
  } catch (error) {
    callback({ 
      success: false, 
      error: error.message 
    });
  }
});

// Client-side with timeout
socket.emit('place-bet', { amount: 100 }, (response) => {
  if (response.success) {
    // Handle success
  } else {
    // Handle error
    setError(response.error);
  }
});
```

#### Connection Recovery
```typescript
// Reconnection logic
socket.on('reconnect', () => {
  console.log('Reconnected to server');
  
  // Request current game state
  socket.emit('get-game-state');
  
  // Sync user data
  socket.emit('sync-user-data');
});

// Handle missed events during disconnection
socket.on('sync-data', (data) => {
  // Update missed game states
  set({ gameState: data.gameState });
  
  // Update user balance
  if (data.userBalance !== undefined) {
    set((prev) => ({ 
      user: prev.user ? { 
        ...prev.user, 
        balance: data.userBalance 
      } : null 
    }));
  }
});
```

## API Reference

### Authentication Endpoints

#### POST `/api/auth/register`
```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (201 Created)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b4b4f1c20016b4c8d1",
    "email": "user@example.com",
    "balance": 10000,
    "isAdmin": false
  }
}

// Error Response (400 Bad Request)
{
  "message": "Email already exists"
}
```

#### POST `/api/auth/login`
```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b4b4f1c20016b4c8d1",
    "email": "user@example.com",
    "balance": 8750,
    "isAdmin": false
  }
}

// Error Response (401 Unauthorized)
{
  "message": "Invalid credentials"
}
```

#### GET `/api/auth/profile`
```javascript
// Headers
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "user": {
    "id": "60f7b3b4b4f1c20016b4c8d1",
    "email": "user@example.com",
    "balance": 8750,
    "isAdmin": false,
    "statistics": {
      "totalBets": 45,
      "totalWinnings": 12500,
      "totalLosses": 8900,
      "winRate": 67.5
    },
    "lastLogin": "2024-01-20T10:30:00.000Z"
  }
}
```

### Game Endpoints

#### GET `/api/game/history`
```javascript
// Headers
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "bets": [
    {
      "id": "60f7b3b4b4f1c20016b4c8d2",
      "roundId": "round_1641234567890",
      "amount": 100,
      "multiplier": 2.45,
      "payout": 245,
      "cashedOut": true,
      "timestamp": "2024-01-20T10:25:00.000Z"
    },
    {
      "id": "60f7b3b4b4f1c20016b4c8d3",
      "roundId": "round_1641234567891",
      "amount": 150,
      "multiplier": null,
      "payout": 0,
      "cashedOut": false,
      "timestamp": "2024-01-20T10:20:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### GET `/api/game/stats`
```javascript
// Response (200 OK)
{
  "recentRounds": [
    {
      "roundId": "round_1641234567890",
      "crashPoint": 2.45,
      "timestamp": "2024-01-20T10:25:00.000Z",
      "totalBets": 12,
      "totalVolume": 1450
    }
  ],
  "userStats": {
    "totalBets": 45,
    "totalWinnings": 12500,
    "winRate": 67.5,
    "biggestWin": 2340,
    "favoriteMultiplier": 2.1
  }
}
```

### Admin Endpoints

#### GET `/api/admin/stats`
```javascript
// Headers
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "totalUsers": 1234,
  "activeUsers": 89,
  "totalBets": 45678,
  "totalVolume": 2340567,
  "houseEdge": 3.2,
  "currentRound": {
    "id": "round_1641234567890",
    "isActive": true,
    "betsCount": 12,
    "totalVolume": 1450,
    "estimatedCrash": "2.5x - 3.0x"
  },
  "recentActivity": [
    {
      "type": "big_win",
      "user": "user@example.com",
      "amount": 2340,
      "multiplier": 5.67
    }
  ]
}
```

### Socket.IO Events

#### Client → Server Events
```typescript
// Place bet
socket.emit('place-bet', {
  amount: 100,
  autoCashOut?: 2.5 // Optional auto cash out
});

// Cash out
socket.emit('cash-out');

// Cancel bet (during betting phase)
socket.emit('cancel-bet');

// Request game history
socket.emit('get-history', {
  limit: 20,
  offset: 0
});
```

#### Server → Client Events
```typescript
// Game state updates
socket.on('game-state', (data: {
  isActive: boolean;
  multiplier: number;
  crashed: boolean;
  roundId: string;
  timeRemaining: number;
  bettingPhase: boolean;
}) => {});

// Real-time multiplier
socket.on('multiplier-update', (multiplier: number) => {});

// Game crash
socket.on('game-crashed', (data: {
  crashPoint: number;
  roundId: string;
  winners: Array<{
    user: string;
    payout: number;
    multiplier: number;
  }>;
}) => {});

// Bet confirmations
socket.on('bet-placed', (data: {
  betId: string;
  newBalance: number;
}) => {});

socket.on('cash-out-success', (data: {
  payout: number;
  multiplier: number;
  newBalance: number;
}) => {});

// Error events
socket.on('bet-error', (data: {
  message: string;
  code: string;
}) => {});
```

## Data Security

### Input Validation

#### Client-Side Validation
```typescript
// Bet amount validation
const validateBetAmount = (amount: string): ValidationResult => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a number' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 10000) {
    return { valid: false, error: 'Maximum bet is 10,000 coins' };
  }
  
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  return { valid: true };
};

// Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
};
```

#### Server-Side Sanitization
```javascript
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS
      .substring(0, 1000); // Limit length
  }
  return input;
};

// Validate bet request
const validateBetInput = (req, res, next) => {
  const { amount } = req.body;
  
  // Type validation
  if (typeof amount !== 'number') {
    return res.status(400).json({ 
      message: 'Amount must be a number' 
    });
  }
  
  // Range validation
  if (amount <= 0 || amount > 10000) {
    return res.status(400).json({ 
      message: 'Invalid bet amount' 
    });
  }
  
  // Precision validation (max 2 decimal places)
  if (Math.round(amount * 100) !== amount * 100) {
    return res.status(400).json({ 
      message: 'Amount cannot have more than 2 decimal places' 
    });
  }
  
  req.body.amount = Math.round(amount * 100) / 100; // Normalize
  next();
};
```

### Rate Limiting

#### API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limit for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts'
});

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
```

#### Socket.IO Rate Limiting
```javascript
// Per-user rate limiting for socket events
const userEventLimits = new Map();

const rateLimit = (userId, eventType, maxEvents, windowMs) => {
  const key = `${userId}:${eventType}`;
  const now = Date.now();
  
  if (!userEventLimits.has(key)) {
    userEventLimits.set(key, []);
  }
  
  const events = userEventLimits.get(key);
  
  // Remove old events outside window
  const validEvents = events.filter(time => now - time < windowMs);
  
  if (validEvents.length >= maxEvents) {
    return false; // Rate limit exceeded
  }
  
  validEvents.push(now);
  userEventLimits.set(key, validEvents);
  return true;
};

// Apply in socket handlers
socket.on('place-bet', (data) => {
  if (!rateLimit(socket.user._id, 'place-bet', 10, 60000)) {
    socket.emit('error', { message: 'Too many bet attempts' });
    return;
  }
  
  // Process bet...
});
```

### Balance Protection

#### Atomic Balance Updates
```javascript
// Ensure balance never goes negative
const deductBalance = async (userId, amount) => {
  const result = await User.findOneAndUpdate(
    { 
      _id: userId, 
      balance: { $gte: amount } // Only if sufficient balance
    },
    { 
      $inc: { balance: -amount },
      $push: {
        balanceHistory: {
          type: 'deduction',
          amount,
          timestamp: new Date(),
          reason: 'bet_placed'
        }
      }
    },
    { new: true }
  );
  
  if (!result) {
    throw new Error('Insufficient balance');
  }
  
  return result;
};

// Add balance with validation
const addBalance = async (userId, amount, reason) => {
  if (amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  const result = await User.findByIdAndUpdate(
    userId,
    { 
      $inc: { balance: amount },
      $push: {
        balanceHistory: {
          type: 'addition',
          amount,
          timestamp: new Date(),
          reason
        }
      }
    },
    { new: true }
  );
  
  return result;
};
```

### Audit Logging

#### Security Event Logging
```javascript
const auditLog = async (event) => {
  const logEntry = {
    timestamp: new Date(),
    userId: event.userId,
    action: event.action,
    details: event.details,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    sessionId: event.sessionId
  };
  
  // Log to database
  await AuditLog.create(logEntry);
  
  // Log to file for external monitoring
  logger.info('AUDIT', logEntry);
};

// Usage examples
await auditLog({
  userId: user._id,
  action: 'LOGIN_SUCCESS',
  details: { email: user.email },
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
});

await auditLog({
  userId: user._id,
  action: 'BET_PLACED',
  details: { amount, roundId },
  ipAddress: socket.handshake.address,
  userAgent: socket.handshake.headers['user-agent']
});
```

## Complete Game Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AVIATOR GAME FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Visit /   │───▶│ Auth Form   │───▶│ API Call    │───▶│ JWT Token   │
│   (Login)   │    │ Email/Pass  │    │ Validation  │    │ + User Data │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                                                        │
        ▼                                                        ▼
┌─────────────┐                                        ┌─────────────┐
│ Guest View  │                                        │ Redirect to │
│ Recent      │                                        │   /game     │
│ Crashes     │                                        │   Route     │
└─────────────┘                                        └─────────────┘

2. GAME INITIALIZATION
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Connect to  │───▶│ Socket.IO   │───▶│ Game State  │───▶│ UI Update   │
│ WebSocket   │    │ Auth w/JWT  │    │ Sync        │    │ Components  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

3. BETTING PHASE (7 seconds)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Countdown   │───▶│ User Places │───▶│ Validation  │───▶│ Balance     │
│ Timer UI    │    │ Bet Amount  │    │ & Record    │    │ Deduction   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Socket      │    │ Amount      │    │ Database    │    │ User        │
│ Broadcast   │    │ Validation  │    │ Transaction │    │ Feedback    │
│ Updates     │    │ Balance     │    │ (Atomic)    │    │ Confirmation│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

4. GAME ACTIVE PHASE
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Start Game  │───▶│ Multiplier  │───▶│ Real-time   │───▶│ UI Animation│
│ Engine      │    │ Growth      │    │ Broadcast   │    │ Updates     │
│             │    │ +0.02x/50ms │    │ to Clients  │    │ Chart/Plane │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Pre-generated│    │ Check Crash │    │ Players Can │    │ Visual      │
│ Crash Point  │    │ Condition   │    │ Cash Out    │    │ Feedback    │
│ (1.01-100x)  │    │ Reached?    │    │ Anytime     │    │ Haptics/SFX │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

5. CASH OUT PROCESS
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Clicks │───▶│ Current     │───▶│ Calculate   │───▶│ Update      │
│ Cash Out    │    │ Multiplier  │    │ Payout      │    │ Database    │
│             │    │ Check       │    │ Amount×Mult │    │ Balance     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validate    │    │ Game Still  │    │ Atomic      │    │ Success     │
│ Timing      │    │ Active?     │    │ Transaction │    │ Notification│
│ Not Crashed │    │ Not Crashed │    │ Bet+Balance │    │ to User     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

6. CRASH EVENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Multiplier  │───▶│ Trigger     │───▶│ Mark Active │───▶│ Calculate   │
│ Reaches     │    │ Crash       │    │ Bets as     │    │ Round       │
│ Crash Point │    │ Event       │    │ Lost        │    │ Statistics  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Broadcast   │    │ Visual      │    │ Update Bet  │    │ Update      │
│ Crash to    │    │ Crash       │    │ Records     │    │ User Stats  │
│ All Clients │    │ Animation   │    │ Status      │    │ Win/Loss    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

7. ROUND END & RESULTS
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Display     │───▶│ Show        │───▶│ Update      │───▶│ Prepare     │
│ Crash Point │    │ Winners     │    │ Recent      │    │ Next Round  │
│ Final Mult  │    │ List        │    │ Crashes     │    │ (3s delay)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Historical  │    │ Payout      │    │ Game        │    │ Return to   │
│ Data Update │    │ Summary     │    │ Statistics  │    │ Phase 3     │
│ Charts      │    │ Amounts     │    │ Update      │    │ Betting     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Detailed Transaction Flow

#### Bet Placement Transaction
```
1. Client Input Validation
   ├── Amount > 0
   ├── Amount ≤ User Balance
   ├── Game in Betting Phase
   └── No Existing Bet for Round

2. Socket.IO Emission
   ├── Event: 'place-bet'
   ├── Data: { amount: 100 }
   └── Auth: JWT Token

3. Server-Side Processing
   ├── Authenticate User
   ├── Validate Game State
   ├── Check User Balance
   └── Start Database Transaction

4. Atomic Database Operations
   ├── Deduct from User Balance
   ├── Create Bet Record
   ├── Update User Statistics
   └── Commit Transaction

5. Response Broadcasting
   ├── Confirm to User (balance update)
   ├── Update Game Statistics
   └── Optional: Broadcast to Room
```

#### Cash Out Transaction
```
1. User Action
   ├── Click Cash Out Button
   ├── Current Multiplier: 2.45x
   └── Game State: Active

2. Timing Validation
   ├── Game Still Active?
   ├── Not Crashed Yet?
   ├── User Has Active Bet?
   └── Within Valid Time Window

3. Payout Calculation
   ├── Bet Amount: 100 coins
   ├── Current Multiplier: 2.45x
   ├── Gross Payout: 245 coins
   └── Net Profit: 145 coins

4. Database Transaction
   ├── Update Bet Record (status: cashed_out)
   ├── Add Payout to User Balance
   ├── Update User Win Statistics
   └── Record Cash Out Timestamp

5. User Feedback
   ├── Success Animation
   ├── Sound Effect
   ├── Haptic Feedback
   └── Balance Update in UI
```

This technical manual provides comprehensive understanding of the Aviator crash game's inner workings, from mathematical algorithms to database transactions and real-time communication protocols.

## Balance Management & Synchronization

### Real-time Balance System
The game implements a sophisticated balance management system with real-time synchronization between frontend and backend to ensure accurate financial tracking.

#### Frontend Balance State Management (`lib/store.ts`)
```typescript
interface User {
  id: string;
  email: string;
  balance: number;           // Total balance from database
  reservedBalance?: number;  // Amount reserved for pending withdrawals
  availableBalance?: number; // balance - reservedBalance (available for betting)
  isAdmin?: boolean;
}
```

#### Optimistic Balance Updates
The system uses optimistic updates for immediate UI responsiveness, followed by server validation:

```typescript
// 1. Place Bet - Optimistic Deduction
placeBet: (amount) => {
  const newBalance = user.balance - amount;
  const newAvailableBalance = newBalance - (user.reservedBalance || 0);
  
  // Immediate UI update
  set({ 
    currentBet: { amount, active: true },
    user: { 
      ...user, 
      balance: newBalance,
      availableBalance: newAvailableBalance
    }
  });
  
  // Server validation
  socket.emit('place-bet', { amount });
}

// 2. Cancel Bet - Optimistic Restoration
cancelBet: async () => {
  const restoredBalance = user.balance + currentBet.amount;
  const restoredAvailableBalance = restoredBalance - (user.reservedBalance || 0);
  
  // Immediate UI restoration
  set({ 
    currentBet: null,
    user: {
      ...user,
      balance: restoredBalance,
      availableBalance: restoredAvailableBalance
    }
  });
  
  // Server confirmation
  socket.emit('bet-cancelled', { amount });
}
```

#### Server-side Balance Validation (`backend/server.js`)
```javascript
// Bet Placement
socket.on('place-bet', async (data) => {
  const { amount } = data;
  const user = await User.findById(socket.userId);

  // Validate available balance (respects reserved amounts)
  if (!user || user.getAvailableBalance() < amount) {
    socket.emit('error', { 
      message: `Insufficient available balance. Available: ${user.getAvailableBalance()} coins`
    });
    return;
  }

  // Server-authoritative balance update
  user.balance -= amount;
  await user.save();
  
  socket.emit('bet-placed', { newBalance: user.balance });
});

// Bet Cancellation with Complete Balance Sync
socket.on('bet-cancelled', async (data) => {
  const { amount } = data;
  const user = await User.findById(socket.userId);

  // Restore balance
  user.balance += amount;
  await user.save();

  // Send complete balance state
  socket.emit('bet-cancelled-success', { 
    newBalance: user.balance,
    availableBalance: user.getAvailableBalance(),
    reservedBalance: user.reservedBalance
  });
});
```

#### Frontend Synchronization Handlers
```typescript
// Listen for server balance confirmations
socket.on('bet-cancelled-success', (data: { 
  newBalance: number; 
  availableBalance?: number; 
  reservedBalance?: number; 
}) => {
  // Sync with authoritative server state
  set((prev) => ({ 
    user: prev.user ? { 
      ...prev.user, 
      balance: data.newBalance,
      availableBalance: data.availableBalance ?? (data.newBalance - (prev.user.reservedBalance || 0)),
      reservedBalance: data.reservedBalance ?? prev.user.reservedBalance
    } as User : null
  }));
});

// Real-time balance updates from withdrawal/deposit actions
socket.on('balance-update', (data: { 
  userId: string; 
  newBalance: number;
  availableBalance?: number;
  reservedBalance?: number;
}) => {
  if (user && user.id === data.userId) {
    set((prev) => ({
      user: prev.user ? { 
        ...prev.user, 
        balance: data.newBalance,
        availableBalance: data.availableBalance ?? data.newBalance,
        reservedBalance: data.reservedBalance ?? 0
      } : null
    }));
  }
});
```

### Reserved Balance System
Prevents users from betting with funds that are pending withdrawal:

#### Database Model (`models/User.js`)
```javascript
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
```

#### UI Display Logic (`components/Header.tsx`)
```tsx
{/* Balance Display with Reserved Amount Indicator */}
<div className="bg-gray-700/50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
  <div className="text-green-400 font-bold text-sm sm:text-lg">
    {(user.availableBalance ?? user.balance)?.toLocaleString() || 0}
  </div>
  <div className="text-xs text-gray-400 hidden sm:block">
    {user.reservedBalance && user.reservedBalance > 0 
      ? `${user.reservedBalance.toLocaleString()} reserved`
      : 'Available'
    }
  </div>
</div>
```

### Financial Integrity Features

#### Withdrawal Request Flow
1. **Immediate Reservation**: Funds deducted from available balance instantly
2. **Visual Indicators**: Clear UI showing reserved vs available amounts  
3. **Protected Betting**: Cannot bet with reserved funds
4. **Admin Validation**: Secure approval process with double-checking

#### Error Prevention
- **Race Condition Protection**: Optimistic updates with server confirmation
- **Double-spending Prevention**: Reserved balance enforcement  
- **Network Resilience**: Fallback synchronization mechanisms
- **Data Consistency**: Server-authoritative balance management
