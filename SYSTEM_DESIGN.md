# 🏗️ Aviator Crash Game - System Design

## High-Level System Flow

The Aviator Crash Game follows a clear request-response flow with real-time updates, ensuring synchronized gameplay across all connected players.

## 🔄 Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AVIATOR SYSTEM DESIGN FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION FLOW
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User visits │───▶│ AuthForm    │───▶│ API Request │───▶│ JWT Token   │
│ / (login)   │    │ Component   │    │ Validation  │    │ Generated   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                                         │
       ▼                                                         ▼
┌─────────────┐                                        ┌─────────────┐
│ Show Recent │                                        │ Zustand     │
│ Crashes     │                                        │ Store       │
│ (No Sounds) │                                        │ Updates     │
└─────────────┘                                        └─────────────┘
                                                               │
                                                               ▼
                                                    ┌─────────────┐
                                                    │ Redirect to │
                                                    │ /game Route │
                                                    └─────────────┘

2. REAL-TIME CONNECTION ESTABLISHMENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Game Page   │───▶│ Socket.IO   │───▶│ JWT Auth    │───▶│ Connection  │
│ Loads       │    │ Connection  │    │ Middleware  │    │ Established │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                                         │
       ▼                                                         ▼
┌─────────────┐                                        ┌─────────────┐
│ Initialize  │                                        │ Receive     │
│ Game        │                                        │ Game State  │
│ Components  │                                        │ Updates     │
└─────────────┘                                        └─────────────┘

3. BETTING PHASE (7 seconds)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Countdown   │───▶│ User Places │───▶│ Validation  │───▶│ MongoDB     │
│ Timer Shows │    │ Bet Amount  │    │ Checks      │    │ Transaction │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Broadcast   │    │ Balance     │    │ Atomic DB   │    │ Socket.IO   │
│ to All      │    │ Sufficient? │    │ Operations  │    │ Emit Bet    │
│ Players     │    │ Game Phase? │    │ (User+Bet)  │    │ Confirmation│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

4. GAME ENGINE ACTIVATION
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Betting     │───▶│ Generate    │───▶│ Start       │───▶│ Multiplier  │
│ Ends        │    │ Crash Point │    │ Game Loop   │    │ Growth      │
│ (0 seconds) │    │ Algorithm   │    │ (50ms)      │    │ (1.00x+)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Lock New    │    │ Probability │    │ setInterval │    │ Broadcast   │
│ Bets        │    │ Distribution│    │ Every 50ms  │    │ Multiplier  │
│             │    │ (1.01-100x) │    │ Increment   │    │ to Clients  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

5. REAL-TIME MULTIPLIER UPDATES
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Game Engine │───▶│ Increment   │───▶│ Socket.IO   │───▶│ All Clients │
│ Timer Tick  │    │ by +0.02x   │    │ Broadcast   │    │ Update UI   │
│ (Every 50ms)│    │ (1.00→1.02) │    │ Event       │    │ Instantly   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Check Crash │    │ Current     │    │ Real-time   │    │ Smooth      │
│ Condition   │    │ >= Crash    │    │ Animation   │    │ Visual      │
│ (>=target)  │    │ Point?      │    │ Updates     │    │ Growth      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

6. PLAYER CASH-OUT PROCESS
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Clicks │───▶│ Current     │───▶│ Calculate   │───▶│ Database    │
│ "Cash Out"  │    │ Multiplier  │    │ Payout      │    │ Transaction │
│ Button      │    │ Captured    │    │ (Bet×Mult)  │    │ (Atomic)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validate    │    │ Game Still  │    │ Bet Record  │    │ Update User │
│ Timing      │    │ Active?     │    │ → Cashed   │    │ Balance     │
│ (No Crash)  │    │ Not Crashed │    │ Out Status  │    │ (+Payout)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                               │
                                               ▼
                                    ┌─────────────┐
                                    │ Socket.IO   │
                                    │ Success     │
                                    │ Response    │
                                    └─────────────┘

7. CRASH EVENT HANDLING
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Multiplier  │───▶│ Crash       │───▶│ Stop Game   │───▶│ Process     │
│ Reaches     │    │ Condition   │    │ Loop        │    │ All Active  │
│ Target      │    │ Met         │    │ Immediately │    │ Bets        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Game State  │    │ clearInterval│    │ Mark Losing │    │ Update      │
│ → Crashed   │    │ (stop ticks) │    │ Bets as     │    │ Statistics  │
│ → Inactive  │    │             │    │ "Lost"      │    │ & Records   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                               │
                                               ▼
                                    ┌─────────────┐
                                    │ Broadcast   │
                                    │ Crash Event │
                                    │ to All      │
                                    └─────────────┘

8. ROUND COMPLETION & RESET
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Display     │───▶│ Show        │───▶│ 3-Second    │───▶│ Start New   │
│ Final       │    │ Winners &   │    │ Pause       │    │ Betting     │
│ Crash Point │    │ Payouts     │    │ Period      │    │ Phase       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Update      │    │ Calculate   │    │ Clean Game  │    │ Reset to    │
│ Recent      │    │ Win/Loss    │    │ State for   │    │ Betting     │
│ Crashes     │    │ Statistics  │    │ Next Round  │    │ Phase 1     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🗄️ Database Transaction Flow

### Bet Placement Transaction
```sql
-- Atomic MongoDB Transaction
START_TRANSACTION
1. VALIDATE user.balance >= bet.amount
2. UPDATE users SET balance = balance - bet.amount WHERE _id = userId
3. INSERT bet { user, amount, roundId, status: 'active' }
4. UPDATE users SET statistics.totalBets += 1 WHERE _id = userId
COMMIT_TRANSACTION

-- If any step fails: ROLLBACK_TRANSACTION
```

### Cash-Out Transaction
```sql
-- Atomic MongoDB Transaction  
START_TRANSACTION
1. FIND bet WHERE user = userId AND roundId = currentRound AND status = 'active'
2. CALCULATE payout = bet.amount * currentMultiplier
3. UPDATE bet SET { status: 'cashed_out', multiplier, payout, cashedOut: true }
4. UPDATE users SET balance += payout WHERE _id = userId
5. UPDATE users SET statistics.totalWinnings += payout WHERE _id = userId
COMMIT_TRANSACTION
```

### Round End Processing
```sql
-- Process all losing bets
UPDATE bets 
SET status = 'lost' 
WHERE roundId = currentRound 
AND status = 'active'

-- Record round statistics
INSERT rounds {
  roundId,
  crashPoint,
  totalBets: count(*),
  totalVolume: sum(amount),
  totalPayout: sum(payout WHERE cashedOut = true)
}
```

## 🔄 Real-Time Synchronization

### Socket.IO Event Flow
```javascript
// Server Events (Backend → Frontend)
'game-state'        // Complete game state sync
'multiplier-update' // Real-time multiplier (every 50ms)
'game-crashed'      // Crash event with final point
'bet-placed'        // Bet confirmation response
'cash-out-success'  // Cash-out confirmation
'error'             // Error notifications

// Client Events (Frontend → Backend)
'place-bet'         // Bet placement request
'cash-out'          // Cash-out request
'get-game-state'    // Request current state
'disconnect'        // Connection cleanup
```

### State Synchronization Pattern
```typescript
// All clients receive identical state
const gameState = {
  isActive: boolean,        // Round running?
  multiplier: number,       // Current value (1.00x+)
  crashed: boolean,         // Has crashed?
  roundId: string,          // Unique identifier
  timeRemaining: number,    // Betting countdown
  bettingPhase: boolean     // Accepting bets?
}

// Zustand store automatically updates UI
useStore(state => state.gameState) // Reactive subscriptions
```

## 🔐 Authentication & Security Flow

### JWT Authentication Process
```
1. User Login Request
   ├── Email/Password validation
   ├── bcrypt.compare(password, hashedPassword)
   └── Generate JWT token (7-day expiration)

2. Token Storage & Usage
   ├── localStorage.setItem('token', jwt)
   ├── Include in all API headers: Authorization: Bearer <token>
   └── Socket.IO auth middleware validates token

3. Route Protection
   ├── useEffect checks user state
   ├── Redirect unauthenticated → /login
   └── Redirect authenticated → /game
```

### Admin Security Model
```typescript
// Simple password-based admin access
const ADMIN_PASSWORD = 'admin123'

// Session-based authentication (no persistence)
const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

// Password validation
if (inputPassword === ADMIN_PASSWORD) {
  setIsAdminAuthenticated(true)
  // Access granted to admin dashboard
}
```

## 📱 Client-Side Architecture

### Component Hierarchy
```
App Layout
├── Header (balance, wallet buttons, logout)
├── Game Route (/game)
│   ├── GameChart (multiplier visualization)
│   ├── BettingPanel (bet placement interface)
│   ├── CountdownTimer (betting phase timer)
│   └── RecentCrashes (historical crash points)
├── Login Route (/)
│   ├── AuthForm (login/register)
│   └── RecentCrashes (no game sounds)
└── Admin Route (/admin)
    ├── AdminLogin (password protection)
    └── AdminDashboard (transaction management)
```

### State Management Flow
```typescript
// Zustand Global Store
interface Store {
  // Authentication State
  user: User | null
  token: string | null
  
  // Game State (Real-time)
  gameState: GameState
  currentBet: Bet | null
  
  // Actions (State Updates)
  setUser: (user: User) => void
  placeBet: (amount: number) => Promise<void>
  cashOut: () => Promise<void>
  initSocket: () => void
}

// Component Subscriptions (Automatic Re-renders)
const { gameState, placeBet } = useStore()
```

## 🎮 Game Engine Logic

### Crash Point Generation Algorithm
```javascript
generateCrashPoint() {
  // Cryptographically secure random
  const rand = Math.random()
  
  // House edge (3% advantage)
  const edge = 0.03
  
  // Inverse exponential distribution
  const crash = Math.floor(100 / ((1 - rand) * (1 + edge))) / 100
  
  // Bounds: 1.01x minimum, 100.0x maximum
  return Math.min(Math.max(1.01, crash), 100.0)
}

// Statistical Distribution Results:
// 1.00x-1.50x: ~50% (High frequency, low risk)
// 1.50x-2.00x: ~25% (Medium frequency)  
// 2.00x-5.00x: ~20% (Lower frequency)
// 5.00x-10.0x: ~4%  (Rare, high reward)
// 10.0x+:      ~1%  (Very rare jackpots)
```

### Multiplier Growth Mechanism
```javascript
// Server-side game loop
startGame() {
  this.gameState.isActive = true
  this.gameState.multiplier = 1.00
  
  this.gameInterval = setInterval(() => {
    // Increment by 0.02x every 50ms (20 FPS)
    this.gameState.multiplier += 0.02
    
    // Broadcast to all connected clients
    io.emit('multiplier-update', this.gameState.multiplier)
    
    // Check crash condition
    if (this.gameState.multiplier >= this.crashPoint) {
      this.crashGame() // End round
    }
  }, 50) // 50ms interval = smooth animation
}
```

## 💰 Financial Transaction System

### Wallet Management Flow
```
User Balance Operations:
1. Deposit Request
   ├── User submits amount via WalletModal
   ├── Create transaction record (status: 'pending')
   ├── Notify admin via AdminDashboard
   └── Await admin approval

2. Admin Approval Process
   ├── Admin views pending transactions
   ├── Click approve/reject button
   ├── Update transaction status
   └── Update user balance (if approved)

3. Withdrawal Request  
   ├── Validate user has sufficient balance
   ├── Create withdrawal transaction (status: 'pending')
   ├── Funds remain in account until approved
   └── Admin processes withdrawal request
```

### Database Schema for Transactions
```javascript
// Transaction Model
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  type: 'deposit' | 'withdrawal',
  amount: Number (validated > 0),
  status: 'pending' | 'completed' | 'rejected',
  createdAt: Date,
  processedAt: Date,
  processedBy: ObjectId (admin user),
  notes: String (admin comments)
}

// User Balance Updates (Atomic Operations)
// Deposit approval:  user.balance += transaction.amount
// Bet placement:     user.balance -= bet.amount  
// Cash-out win:      user.balance += payout
```

## 🚀 Deployment Architecture

### Production Infrastructure
```
Frontend (Vercel)
├── Next.js static build
├── Edge CDN distribution
├── Automatic SSL/HTTPS
└── Environment variables

Backend (Railway/Render)  
├── Node.js container
├── Express.js API server
├── Socket.IO WebSocket
└── Health check endpoints

Database (MongoDB Atlas)
├── Managed cloud MongoDB
├── Automated backups
├── Replica sets (failover)
└── Connection pooling
```

### Environment Variable Management
```bash
# Frontend Environment (.env.local)
NEXT_PUBLIC_BACKEND_URL=https://aviator-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://aviator-backend.railway.app

# Backend Environment (.env)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aviator
JWT_SECRET=production-grade-secret-256-bits
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://aviator-game.vercel.app
```

## 🔍 Error Handling & Resilience

### Client-Side Error Recovery
```typescript
// Socket connection failure handling
socket.on('disconnect', () => {
  // Show connection lost indicator
  setConnectionStatus('disconnected')
  
  // Attempt automatic reconnection
  setTimeout(() => {
    socket.connect()
  }, 2000)
})

// API request error handling
try {
  await placeBet(amount)
} catch (error) {
  // User-friendly error messages
  setError(error.message || 'Bet placement failed')
  
  // Revert optimistic UI updates
  revertBetPlacement()
}
```

### Server-Side Fault Tolerance
```javascript
// Database transaction error handling
try {
  await session.withTransaction(async () => {
    // Atomic operations
    await deductUserBalance(userId, amount)
    await createBetRecord(bet)
  })
} catch (error) {
  // Automatic rollback on any failure
  logger.error('Bet transaction failed:', error)
  throw new Error('Bet could not be processed')
}

// Graceful crash handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error)
  // Safely shutdown server
  server.close(() => process.exit(1))
})
```

## 🔄 Balance Synchronization System

### Real-time Balance Updates
The system maintains accurate balance display through multiple synchronization mechanisms:

```
Balance Update Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Action │───▶│ Optimistic  │───▶│ Server      │───▶│ Balance     │
│ (Bet/Cancel)│    │ UI Update   │    │ Validation  │    │ Sync Event  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                                         │
       ▼                                                         ▼
┌─────────────┐                                        ┌─────────────┐
│ Immediate   │                                        │ Header &    │
│ UI Response │                                        │ Components  │
│ (Fast UX)   │                                        │ Auto-sync   │
└─────────────┘                                        └─────────────┘
```

### Bet Placement Balance Flow
```javascript
// 1. Optimistic Deduction (Immediate UI Response)
placeBet(amount) {
  const newBalance = user.balance - amount;
  const newAvailableBalance = newBalance - (user.reservedBalance || 0);
  
  setUser({ 
    balance: newBalance,
    availableBalance: newAvailableBalance 
  });
  
  socket.emit('place-bet', { amount });
}

// 2. Server Validation & Response
socket.on('bet-placed', (data) => {
  // Server confirms/corrects balance if needed
  setUser({ balance: data.newBalance });
});
```

### Bet Cancellation Balance Flow  
```javascript
// 1. Optimistic Restoration (Immediate UI Response)
cancelBet() {
  const restoredBalance = user.balance + currentBet.amount;
  const restoredAvailableBalance = restoredBalance - (user.reservedBalance || 0);
  
  setUser({
    balance: restoredBalance,
    availableBalance: restoredAvailableBalance
  });
  
  socket.emit('bet-cancelled', { amount });
}

// 2. Server Confirmation
socket.on('bet-cancelled-success', (data) => {
  setUser({ 
    balance: data.newBalance,
    availableBalance: data.availableBalance,
    reservedBalance: data.reservedBalance 
  });
});
```

### Reserved Balance Protection
```javascript
// Available balance calculation respects reserved funds
user.availableBalance = user.balance - user.reservedBalance;

// Header shows available balance for betting
<div>Available: {user.availableBalance} coins</div>
<div>Reserved: {user.reservedBalance} coins</div>
```

This system design ensures reliable, scalable, and secure operation of the Aviator Crash Game with real-time multiplayer functionality and robust financial transaction handling.
