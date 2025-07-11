# 🎲 Aviator Crash Game

A real-time multiplayer crash betting game built with Next.js, TypeScript, and Socket.IO. Players place bets, watch a multiplier grow, and cash out before the inevitable crash to win!

![Aviator Game](https://img.shields.io/badge/Game-Aviator%20Crash-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-green)

## 🎮 How to Play

1. **Login/Register** - Create an account (starts with 10,000 coins)
2. **Place Bet** - Choose your bet amount during the 7-second betting phase
3. **Watch Multiplier** - Airplane takes off, multiplier grows from 1.00x
4. **Cash Out** - Click to secure winnings before the crash
5. **Win or Lose** - If you cash out: win `bet × multiplier`. If not: lose your bet

## ✨ Features

### 🎯 Core Game
- **Real-time multiplayer** gameplay with WebSocket synchronization
- **Provably fair** crash point generation with ~3% house edge
- **7-second betting phase** followed by variable-length rounds
- **Instant cash out** system with live payout calculations
- **Bet history** tracking with win/loss statistics

### 💰 Financial System
- **Virtual wallet** with deposit/withdrawal requests
- **Reserved Balance System** - funds immediately reserved on withdrawal requests
- **Real-time balance updates** with optimistic UI and server confirmation
- **Bet cancellation sync** - proper balance restoration when cancelling bets
- **Protected betting** - cannot bet with funds reserved for withdrawal
- **Admin approval workflow** for all financial transactions
- **Financial integrity protection** against double-spending scenarios

### 🛠️ Admin Panel
- **Transaction oversight** - approve/reject deposits & withdrawals with validation
- **Enhanced withdrawal processing** - checks reserved balance before approval
- **User management** with comprehensive admin dashboard
- **Game monitoring** with real-time statistics and controls
- **Secure access** with admin-only authentication
- **Admin action logging** for audit trails

### 📱 User Experience
- **Immediate feedback** - balance updates instantly on all actions
- **Visual balance indicators** - clear separation of total/available/reserved amounts
- **Responsive design** works perfectly on all devices
- **Haptic feedback** for mobile interactions with sound controls
- **Touch-friendly** interface with optimized button sizes
- **Smooth animations** and real-time synchronization

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js + Express** - Server runtime and web framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB + Mongoose** - Database with ODM
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Frontend hosting with edge network
- **Railway/Render** - Backend container deployment
- **MongoDB Atlas** - Managed cloud database

## � Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas connection)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/aviator-game.git
cd aviator-game
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add environment variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add environment variables
MONGODB_URI=mongodb://localhost:27017/aviator_game
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

### 5. Access Application
- **Game**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (password: `admin123`)

## 📚 Documentation

| Manual | Purpose | Audience |
|--------|---------|----------|
| [Developer Manual](DEVELOPER_MANUAL.md) | Code structure, setup, component architecture | Developers |
| [Technical Manual](TECHNICAL_MANUAL.md) | Game algorithms, database schemas, API reference | Technical leads |
| [Deployment Manual](DEPLOYMENT_MANUAL.md) | Production deployment, CI/CD, monitoring | DevOps |
| [Glossary](GLOSSARY.md) | Key terms and definitions | All team members |

## 🎲 Game Mechanics

### Crash Point Generation
- Uses inverse exponential distribution
- Range: 1.01x to 100.0x multiplier
- ~50% crash between 1.00x-1.50x
- ~25% crash between 1.50x-2.00x
- Rare high multipliers (10x+) ~1% frequency

### Betting Rules
- Minimum bet: 1 coin
- Maximum bet: 10,000 coins
- One bet per round per user
- Auto cash-out feature available

### Multiplier Growth
- Starts at 1.00x when round begins
- Increases by +0.02x every 50ms (20 FPS)
- Smooth animation with client-side prediction
- Synchronized across all connected players

## 🔒 Security Features

- **JWT Authentication** with 7-day expiration
- **bcrypt Password Hashing** with 12 salt rounds
- **Rate Limiting** on API endpoints and Socket.IO events
- **Input Validation** on all user data
- **CORS Protection** with whitelisted origins
- **Admin Role Protection** for sensitive operations

## 🛡️ Production Deployment

### Quick Deploy
```bash
# Deploy frontend to Vercel
npm run build
vercel --prod

# Deploy backend to Railway
railway login
railway up
```

### Environment Variables (Production)
```bash
# Frontend (Vercel)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app

# Backend (Railway)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aviator
JWT_SECRET=production-secret-256-bits
NODE_ENV=production
```

## 📊 Project Stats

- **Components**: 12 React components
- **API Endpoints**: 8 REST routes
- **Socket Events**: 15 real-time events
- **Database Models**: 3 MongoDB schemas
- **Test Coverage**: 80%+ (backend logic)
- **Mobile Responsive**: 100%

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Tournaments** - Scheduled multiplayer competitions
- [ ] **Leaderboards** - Top players by winnings
- [ ] **Social Features** - Chat and player profiles
- [ ] **Payment Integration** - Real money deposits/withdrawals
- [ ] **Mobile App** - Native iOS/Android versions

## 🐛 Issues & Support

Found a bug or need help? Please [open an issue](https://github.com/your-username/aviator-game/issues) or contact the development team.

---

**Built with ❤️ by the Aviator Game Team**

## 🔄 Recent Enhancements

### Balance Management System ✅
- **Fixed bet cancellation sync issue** - header balance now updates correctly when cancelling bets
- **Optimistic UI updates** with server-authoritative confirmation for instant responsiveness
- **Reserved balance protection** prevents betting with funds pending withdrawal
- **Real-time balance synchronization** across all user sessions and devices

### Financial Security Improvements ✅  
- **Immediate withdrawal reservation** - funds deducted and marked as reserved instantly
- **Enhanced admin validation** - withdrawal approval checks reserved balance availability
- **Double-spending prevention** - mathematical protection against fund conflicts
- **Visual reservation indicators** - clear UI showing total vs available vs reserved amounts

### Technical Improvements ✅
- **Complete balance state management** - frontend and backend fully synchronized
- **Enhanced error handling** with comprehensive user feedback
- **Robust network resilience** for unstable connections
- **Comprehensive documentation** and technical manuals updated

