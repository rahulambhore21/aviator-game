# 🎲 Crash Betting Game

A full-stack real-time crash betting game built with Next.js, Socket.io, and MongoDB. Players place bets, watch a multiplier grow from 0.00x, and try to cash out before the game crashes!

## 🚀 Demo

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:3002

## ✨ Features

### 🎮 Core Game Features
- **Real-time Multiplier**: Starts from 0.00x and increases every 100ms
- **Virtual Wallet**: 10,000 starting coins for new users
- **Betting System**: 5-second betting phase before each round
- **Cash Out**: Win bet × current multiplier anytime before crash
- **Random Crash Points**: Weighted distribution for fairness
- **Bet History**: Track wins/losses with detailed statistics

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly**: 44px+ touch targets for mobile
- **Haptic Feedback**: Vibration for bet/cashout/crash events
- **Sound Effects**: Audio feedback for all game actions
- **PWA Ready**: Installable as mobile app

### 🛠 Admin Dashboard
- **Game Control**: Start/pause rounds, set manual crash points
- **User Management**: View all users and their statistics
- **Analytics**: Total bets, volume tracking, round history
- **Real-time Monitoring**: Live game state and player activity

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based auth system
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Admin vs regular user permissions
- **Protected Routes**: Middleware authentication for admin panel

## 🏗️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Socket.io Client**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard route
│   │   └── page.tsx             # Admin page component
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── AdminDashboard.tsx       # Admin control panel
│   ├── AuthForm.tsx             # Login/register form
│   ├── BetHistory.tsx           # User bet history display
│   ├── BettingPanel.tsx         # Betting interface
│   ├── CountdownTimer.tsx       # Betting phase countdown
│   ├── CrashHistory.tsx         # Recent crash results
│   ├── GameChart.tsx            # Main game visualization
│   ├── GameDashboard.tsx        # Main game layout
│   ├── Header.tsx               # Navigation header
│   └── ToastNotifications.tsx   # User feedback system
├── lib/                         # Utility libraries
│   ├── api.ts                   # API functions
│   ├── mobile.ts                # Mobile utilities
│   ├── sounds.ts                # Sound management
│   └── store.ts                 # Zustand state store
├── backend/                     # Node.js backend
│   ├── models/                  # MongoDB schemas
│   │   ├── Bet.js              # Bet model
│   │   ├── Round.js            # Round model
│   │   └── User.js             # User model
│   ├── routes/                  # Express routes
│   │   ├── admin.js            # Admin API endpoints
│   │   ├── auth.js             # Authentication routes
│   │   └── game.js             # Game API endpoints
│   ├── middleware/              # Express middleware
│   │   └── auth.js             # JWT authentication
│   ├── gameEngine.js           # Core game logic
│   ├── server.js               # Express server setup
│   └── setup.js                # Admin user setup
└── public/                      # Static assets
    └── manifest.json            # PWA manifest
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  balance: Number (default: 10000),
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Bets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  roundId: String,
  amount: Number,
  multiplier: Number,
  payout: Number,
  cashedOut: Boolean,
  timestamp: Date
}
```

### Rounds Collection
```javascript
{
  _id: ObjectId,
  roundId: String (unique),
  crashPoint: Number,
  startTime: Date,
  endTime: Date,
  totalBets: Number,
  totalVolume: Number
}
```

## 🎯 Game Flow

1. **Registration/Login** → User gets 10,000 virtual coins
2. **Betting Phase** → 5-second countdown to place bets
3. **Game Active** → Multiplier grows from 0.00x every 100ms
4. **Decision Time** → Players can cash out anytime before crash
5. **Crash Event** → Random crash point ends the round
6. **Results** → Winners get bet × multiplier, losers lose bet
7. **New Round** → 3-second pause, then new betting phase

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd firstapp
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Environment Setup

Create `.env.local` in root directory:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

Create `.env` in backend directory:
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/crashgame
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3002
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@crashgame.com
```

### 5. Database Setup
```bash
# Start MongoDB service
mongod

# Create admin user
cd backend
npm run setup
```

### 6. Start Development Servers

**Backend Server:**
```bash
cd backend
npm run dev
```

**Frontend Server:**
```bash
npm run dev
```

## 🎮 Usage

### Regular Users
1. Visit http://localhost:3000
2. Register/login to get 10,000 coins
3. Wait for betting phase (5-second countdown)
4. Place your bet amount
5. Watch multiplier grow from 0.00x
6. Click "Cash Out" before crash to win!

### Admin Users
1. Login with: `admin@crashgame.com` / `admin123`
2. Visit http://localhost:3000/admin
3. Control game rounds (start/pause)
4. Set manual crash points
5. View user statistics and analytics

## 🎨 Components Overview

### GameChart.tsx
- Main game visualization with animated plane
- Real-time multiplier display
- Crash animations and effects
- Cash out button when player has active bet

### BettingPanel.tsx
- Bet amount input and quick select buttons
- Current balance display
- Betting validation and feedback

### BetHistory.tsx
- User's betting history with results
- Win/loss statistics
- Payout calculations

### AdminDashboard.tsx
- Game control panel for admins
- User statistics and analytics
- Round management tools

## 🔊 Sound & Haptic Features

### Sound Effects (`lib/sounds.ts`)
- **Background Music**: Continuous melodic background music
- **Bet Placement**: Confirmation sound
- **Cash Out**: Success chime
- **Flight Crash**: Dramatic engine failure + explosion sound sequence
- **Countdown**: Tick sound during betting phase
- **Sound Controls**: Toggle buttons for music and effects

### Haptic Feedback (`lib/mobile.ts`)
- **Light vibration**: Bet placement
- **Success pattern**: Successful cash out
- **Error vibration**: Game crash
- **Win celebration**: Big win feedback

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile

### Game (`/api/game`)
- `GET /history` - User bet history
- `GET /stats` - Game statistics

### Admin (`/api/admin`)
- `GET /stats` - Admin dashboard stats
- `POST /control` - Game control actions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent abuse of API endpoints
- **CORS Configuration**: Restrict cross-origin requests
- **Admin Middleware**: Role-based access control

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach
- **Touch Targets**: Minimum 44px for accessibility
- **Viewport Meta**: Proper scaling and zoom control
- **PWA Manifest**: Installable web app
- **Performance**: Optimized animations and updates

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build and deploy
npm run build
vercel --prod
```

### Backend (Railway/Render)
```bash
# Set environment variables
# Deploy backend service
```

### Database (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Update MONGODB_URI in environment variables

## 🧪 Testing

### Test Accounts
- **Admin**: admin@crashgame.com / admin123
- **Regular User**: Create new account (gets 10,000 coins)

### Testing Scenarios
1. **User Registration**: Create account and verify 10,000 starting balance
2. **Betting Flow**: Place bet, watch multiplier, cash out
3. **Game Crash**: Let game crash and verify bet loss
4. **Admin Controls**: Use admin panel to control game
5. **Mobile Experience**: Test on various screen sizes

## 📊 Performance Features

- **Real-time Updates**: Socket.io for instant game state sync
- **Optimistic UI**: Immediate feedback for user actions
- **State Management**: Zustand for efficient state updates
- **Responsive Images**: Optimized for all screen sizes
- **Lazy Loading**: Components loaded as needed

## 🎯 Game Mechanics

### Crash Point Generation
```javascript
// Weighted distribution favoring lower multipliers
if (random < 0.5) {
  // 50% chance: 0.0-2.0x
  return Math.random() * 2.0;
} else if (random < 0.8) {
  // 30% chance: 2.0-5.0x  
  return 2.0 + Math.random() * 3.0;
} else {
  // 20% chance: 5.0-10.0x
  return 5.0 + Math.random() * 5.0;
}
```

### Multiplier Growth
- Starts at 0.00x
- Increases by 0.02x every 50ms (faster speed)
- Visual and audio feedback at milestones

## 🛠️ Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Consistent naming conventions

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

## 🎲 Start Playing!

Ready to test your luck? Start both servers and visit http://localhost:3000 to begin your crash game adventure!

**Remember**: This is a demo with virtual currency. Please gamble responsibly in real applications.
