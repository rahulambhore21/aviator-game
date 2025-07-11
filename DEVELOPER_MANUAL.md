# 🎲 Aviator Crash Game - Developer Manual

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Authentication System](#authentication-system)
- [Real-time Communication](#real-time-communication)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Testing & Development](#testing--development)
- [Best Practices](#best-practices)

## Project Overview

### Purpose
The Aviator Crash Game is a real-time multiplayer betting game where players:
1. Place bets before each round starts
2. Watch a multiplier grow from 1.00x upward
3. Cash out before the "crash" to win (bet × multiplier)
4. Lose their bet if they don't cash out before the crash

### Key Features
- **Real-time gameplay** with WebSocket synchronization
- **Virtual wallet system** with deposits/withdrawals
- **Admin panel** for transaction management
- **Mobile-responsive design** with haptic feedback
- **Provably fair** crash point generation
- **Route separation** (login/game/admin) for optimal UX

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard route
│   │   └── page.tsx             # Admin page (/admin)
│   ├── game/                     # Game route (authenticated only)
│   │   └── page.tsx             # Game page (/game)
│   ├── globals.css              # Global Tailwind styles
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Login page (/)
│
├── components/                   # React components
│   ├── AdminDashboard.tsx       # Transaction management interface
│   ├── AdminLogin.tsx           # Admin password authentication
│   ├── AdminPage.tsx            # Admin page wrapper with header
│   ├── AuthForm.tsx             # Login/register form
│   ├── BettingPanel.tsx         # Dual betting interface
│   ├── CountdownTimer.tsx       # Betting phase countdown
│   ├── GameChart.tsx            # Main game visualization
│   ├── Header.tsx               # Navigation with wallet controls
│   ├── RecentCrashes.tsx        # Historical crash results
│   └── WalletModal.tsx          # Deposit/withdrawal interface
│
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client functions
│   ├── mobile.ts                # Mobile utilities & haptics
│   ├── sounds.ts                # Audio management
│   └── store.ts                 # Zustand global state
│
├── backend/                     # Node.js backend server
│   ├── middleware/              # Express middleware
│   │   └── auth.js             # JWT authentication
│   ├── models/                  # MongoDB schemas
│   │   ├── Bet.js              # Bet records
│   │   ├── Round.js            # Game rounds
│   │   └── User.js             # User accounts
│   ├── routes/                  # API endpoints
│   │   ├── admin.js            # Admin statistics
│   │   ├── auth.js             # Authentication routes
│   │   └── game.js             # Game data routes
│   ├── gameEngine.js           # Core game logic
│   ├── server.js               # Express server setup
│   └── setup.js                # Database initialization
│
└── public/                      # Static assets
    ├── favicon.ico
    └── manifest.json            # PWA manifest
```

### Directory Explanations

#### `/app` - Next.js App Router
- **Route-based architecture** with automatic code splitting
- **`layout.tsx`** - Global layout with font loading and metadata
- **`page.tsx`** - Login page with authentication and recent crashes
- **`/game/page.tsx`** - Protected game route with full interface
- **`/admin/page.tsx`** - Admin dashboard for transaction management

#### `/components` - Reusable UI Components
- **Authentication**: `AuthForm.tsx`, `AdminLogin.tsx`
- **Game Interface**: `GameChart.tsx`, `BettingPanel.tsx`, `CountdownTimer.tsx`
- **Navigation**: `Header.tsx` with responsive design
- **Modals**: `WalletModal.tsx` with tabs and transaction history
- **Admin**: `AdminDashboard.tsx`, `AdminPage.tsx`

#### `/lib` - Utility Libraries
- **`store.ts`** - Zustand state management with TypeScript
- **`api.ts`** - Axios-based API client with interceptors
- **`sounds.ts`** - Web Audio API for game sounds
- **`mobile.ts`** - Mobile detection and haptic feedback

#### `/backend` - Express.js Server
- **MVC Architecture** with models, routes, and middleware
- **Real-time Engine** in `gameEngine.js`
- **Authentication** with JWT and bcrypt
- **Database Models** with Mongoose schemas

## Local Development Setup

### Prerequisites
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
MongoDB >= 5.0.0
```

### Installation Steps

#### 1. Clone and Install Dependencies
```bash
# Clone repository
git clone https://github.com/rahulambhore21/aviator-game.git
cd aviator-game

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Environment Variables

Create `.env.local` in root directory:
```env
# Frontend Environment Variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_ENABLE_SOUNDS=true
NEXT_PUBLIC_ENABLE_HAPTICS=true
```

Create `.env` in `/backend` directory:
```env
# Backend Environment Variables
PORT=3002
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/crashgame
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development

# Admin Credentials
ADMIN_EMAIL=admin@crashgame.com
ADMIN_PASSWORD=admin123
```

#### 3. Database Setup
```bash
# Start MongoDB locally
mongod

# Initialize database with admin user
cd backend
node setup.js
```

#### 4. Development Scripts

```bash
# Terminal 1: Start Frontend (Next.js)
npm run dev
# Opens http://localhost:3000

# Terminal 2: Start Backend (Express + Socket.IO)
cd backend
npm run dev
# Opens http://localhost:3002
```

### Available Scripts

#### Frontend Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

#### Backend Scripts
```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "setup": "node setup.js"
}
```

## Authentication System

### Flow Diagram
```
User Registration/Login Flow:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   AuthForm  │───▶│   API Call  │───▶│   Backend   │
│ (email/pwd) │    │ auth/login  │    │ JWT + User  │
└─────────────┘    └─────────────┘    └─────────────┘
        │                                    │
        ▼                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Set User   │◀───│ Store Token │◀───│  Response   │
│ & Redirect  │    │ in Storage  │    │{user, token}│
└─────────────┘    └─────────────┘    └─────────────┘
```

### Frontend Authentication

#### AuthForm Component (`components/AuthForm.tsx`)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    let response;
    if (mode === 'login') {
      response = await authAPI.login({ email, password });
    } else {
      response = await authAPI.register({ email, password });
    }

    // Store user data and token
    setUser(response.user);
    setToken(response.token);
    initSocket(); // Initialize real-time connection
    
    // Automatic redirect handled by useEffect in page components
  } catch (err) {
    setError(err.response?.data?.message || 'Authentication failed');
  } finally {
    setLoading(false);
  }
};
```

#### Route Protection
```typescript
// In /game/page.tsx
useEffect(() => {
  if (!user) {
    router.push('/'); // Redirect to login
  }
}, [user, router]);

// In /page.tsx (login)
useEffect(() => {
  if (user) {
    router.push('/game'); // Redirect to game
  }
}, [user, router]);
```

### Backend Authentication

#### JWT Token Generation (`backend/routes/auth.js`)
```javascript
// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

#### Auth Middleware (`backend/middleware/auth.js`)
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

## Real-time Communication

### Socket.IO Architecture

#### Client-Side Connection (`lib/store.ts`)
```typescript
initSocket: () => {
  const { token } = get();
  if (!token) return;

  const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002', {
    auth: { token } // Send JWT for authentication
  });

  // Event listeners
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('game-state', (state: GameState) => {
    set((prev) => ({ gameState: { ...prev.gameState, ...state } }));
  });

  socket.on('multiplier-update', (multiplier: number) => {
    set((prev) => ({ 
      gameState: { ...prev.gameState, multiplier }
    }));
  });

  socket.on('game-crashed', (crashPoint: number) => {
    hapticFeedback.error();
    playSound.flightCrash();
    // Update game state and handle user bets
  });

  set({ socket });
}
```

#### Server-Side Connection (`backend/server.js`)
```javascript
// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.user.email} connected`);
  
  // Send current game state
  socket.emit('game-state', gameEngine.gameState);
  
  // Handle bet placement
  socket.on('place-bet', (data) => {
    gameEngine.placeBet(socket.user._id, data.amount, socket.id);
  });
  
  socket.on('cash-out', () => {
    gameEngine.cashOut(socket.user._id);
  });
});
```

### Game Engine (`backend/gameEngine.js`)

#### Core Game Loop
```javascript
class GameEngine {
  constructor(io) {
    this.io = io;
    this.gameState = {
      isActive: false,
      multiplier: 1.00,
      crashed: false,
      roundId: null,
      bettingPhase: true,
      timeRemaining: 7000, // 7 seconds betting phase
    };
    
    this.startBettingPhase();
  }
  
  startBettingPhase() {
    this.gameState = {
      isActive: false,
      multiplier: 1.00,
      crashed: false,
      roundId: `round_${Date.now()}`,
      bettingPhase: true,
      timeRemaining: 7000,
    };
    
    this.crashPoint = this.generateCrashPoint();
    this.io.emit('game-state', this.gameState);
    
    // Countdown timer
    this.bettingInterval = setInterval(() => {
      this.gameState.timeRemaining -= 100;
      this.io.emit('game-state', this.gameState);
      
      if (this.gameState.timeRemaining <= 0) {
        this.startGame();
      }
    }, 100);
  }
  
  startGame() {
    clearInterval(this.bettingInterval);
    
    this.gameState = {
      ...this.gameState,
      isActive: true,
      bettingPhase: false,
      multiplier: 1.00,
    };
    
    this.io.emit('game-state', this.gameState);
    
    // Multiplier growth
    this.gameInterval = setInterval(() => {
      this.gameState.multiplier += 0.02;
      this.io.emit('multiplier-update', this.gameState.multiplier);
      
      if (this.gameState.multiplier >= this.crashPoint) {
        this.crashGame();
      }
    }, 50); // 50ms updates = smooth animation
  }
}
```

## Component Architecture

### Component Hierarchy
```
App
├── Layout (globals, fonts, metadata)
├── LoginPage (/)
│   ├── Header
│   ├── RecentCrashes
│   └── AuthForm
├── GamePage (/game)
│   ├── Header
│   │   └── WalletModal
│   ├── RecentCrashes
│   ├── GameChart
│   │   └── CountdownTimer (embedded)
│   └── BettingPanel
└── AdminPage (/admin)
    ├── AdminLogin
    └── AdminDashboard
```

### Key Component Patterns

#### 1. Container Components
Handle business logic and state management:
```typescript
// Example: GamePage
export default function GamePage() {
  const { user, gameState } = useStore();
  const router = useRouter();
  
  // Route protection
  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);
  
  // Render presentational components
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <GameChart />
      <BettingPanel />
    </div>
  );
}
```

#### 2. Presentational Components
Focus on UI rendering and user interactions:
```typescript
// Example: BettingPanel
function SingleBettingPanel({ panelId, title }: BetPanelProps) {
  const { placeBet, cashOut } = useStore();
  const [betAmount, setBetAmount] = useState(100);
  
  const handleBet = () => {
    placeBet(betAmount);
  };
  
  return (
    <div className="betting-panel">
      {/* UI elements */}
    </div>
  );
}
```

#### 3. Modal Components
Handle overlay UI with proper portal usage:
```typescript
// Example: WalletModal
export default function WalletModal({ isOpen, onClose, mode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6">
        {/* Modal content */}
      </div>
    </div>
  );
}
```

## State Management

### Zustand Store Structure

#### Store Interface (`lib/store.ts`)
```typescript
interface Store {
  // Authentication State
  user: User | null;
  token: string | null;
  
  // Game State
  gameState: GameState;
  currentBet: { amount: number; active: boolean } | null;
  betHistory: Bet[];
  
  // Real-time Connection
  socket: Socket | null;
  
  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  placeBet: (amount: number) => void;
  cashOut: () => void;
  initSocket: () => void;
}
```

#### State Updates Pattern
```typescript
// Synchronous state updates
setUser: (user) => set({ user }),

// Asynchronous actions with side effects
placeBet: (amount) => {
  const { user, socket } = get();
  
  // Validation
  if (!user || !socket || user.balance < amount) return;
  
  // Optimistic update
  set({ currentBet: { amount, active: true } });
  
  // Side effects
  hapticFeedback.bet();
  playSound.bet();
  
  // Server communication
  socket.emit('place-bet', { amount });
},
```

### State Persistence
```typescript
// Token persistence
setToken: (token) => {
  set({ token });
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
},

// Initialize from localStorage
token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
```

## Testing & Development

### Development Workflow

#### 1. Start Development Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: MongoDB
mongod
```

#### 2. Test User Accounts
```javascript
// Default test accounts created by setup.js
{
  email: "admin@crashgame.com",
  password: "admin123",
  isAdmin: true,
  balance: 100000
}

// Regular users created via registration
{
  email: "user@example.com", 
  password: "password123",
  isAdmin: false,
  balance: 10000
}
```

#### 3. API Testing
```bash
# Test authentication
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crashgame.com","password":"admin123"}'

# Test protected route
curl -X GET http://localhost:3002/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Socket.IO Testing
```javascript
// Browser console testing
const socket = io('http://localhost:3002', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('game-state', (state) => {
  console.log('Game state:', state);
});

socket.emit('place-bet', { amount: 100 });
```

### Debugging Tools

#### 1. Browser DevTools
- **Network Tab**: Monitor API requests and WebSocket connections
- **Application Tab**: Check localStorage for tokens
- **Console**: Socket.IO debug messages and errors

#### 2. Server Logging
```javascript
// Add to gameEngine.js for debugging
console.log(`Round ${this.gameState.roundId} started with crash point: ${this.crashPoint}`);
console.log(`User ${userId} placed bet: ${amount}`);
```

#### 3. Database Inspection
```bash
# MongoDB shell
mongo crashgame

# Check collections
show collections
db.users.find()
db.bets.find()
db.rounds.find()
```

## Best Practices

### Code Organization

#### 1. Component Structure
```typescript
// Standard component template
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ }: ComponentProps) {
  // 1. Hooks
  const { } = useStore();
  const [localState, setLocalState] = useState();
  
  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3. Event handlers
  const handleClick = () => {
    // Logic
  };
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### 2. State Management
```typescript
// Keep state minimal and normalized
interface GameState {
  isActive: boolean;
  multiplier: number;
  crashed: boolean;
  // Don't duplicate derived data
}

// Use selectors for computed values
const { gameState } = useStore();
const canBet = gameState.bettingPhase && !gameState.isActive;
```

#### 3. Error Handling
```typescript
// API calls
try {
  const response = await api.post('/endpoint', data);
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error.response?.status === 401) {
    logout(); // Redirect to login
  } else {
    setError('Something went wrong');
  }
}

// Socket.IO
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Implement reconnection logic
});
```

### Performance Optimization

#### 1. Component Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Render data */}</div>;
});

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

#### 2. State Updates
```typescript
// Batch state updates in Zustand
set((state) => ({
  ...state,
  gameState: { ...state.gameState, multiplier: newMultiplier },
  currentBet: newBet
}));

// Avoid unnecessary re-renders
const { multiplier } = useStore(state => state.gameState.multiplier);
```

#### 3. Asset Optimization
```typescript
// Lazy load components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});

// Optimize images
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false} // Only true for above-the-fold images
/>
```

### Security Considerations

#### 1. Input Validation
```typescript
// Frontend validation
const validateBetAmount = (amount: number) => {
  if (!amount || amount <= 0) return 'Invalid amount';
  if (amount > userBalance) return 'Insufficient balance';
  return null;
};

// Backend validation
const betAmount = parseFloat(req.body.amount);
if (isNaN(betAmount) || betAmount <= 0) {
  return res.status(400).json({ message: 'Invalid bet amount' });
}
```

#### 2. Authentication
```typescript
// Always check authentication state
const { user } = useStore();
if (!user) {
  router.push('/');
  return;
}

// Validate tokens on server
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### 3. Environment Variables
```bash
# Never commit secrets
# Use different values for production
JWT_SECRET=use-a-strong-random-secret-in-production
MONGODB_URI=mongodb://localhost:27017/crashgame-dev
```

### Contributing Guidelines

#### 1. Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-betting-panel

# Make changes with descriptive commits
git commit -m "feat: add dual betting panel with auto-cashout"

# Push and create PR
git push origin feature/new-betting-panel
```

#### 2. Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Component is responsive (mobile-friendly)
- [ ] Accessibility attributes are added
- [ ] Performance implications are considered
- [ ] Security vulnerabilities are checked

#### 3. Testing Requirements
```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';

test('should place bet when amount is valid', () => {
  render(<BettingPanel />);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
  fireEvent.click(screen.getByText('Bet'));
  expect(mockPlaceBet).toHaveBeenCalledWith(100);
});
```

This developer manual provides comprehensive guidance for setting up, understanding, and contributing to the Aviator crash game codebase. Follow these patterns and practices to maintain code quality and consistency across the project.
