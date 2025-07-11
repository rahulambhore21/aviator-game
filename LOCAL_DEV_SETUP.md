# Local Development Setup

## 🚀 Quick Start (Local Development)

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start local development server with hot reload
npm run dev
```

The backend will run on `http://localhost:10000` (different from production port)

### Frontend Setup
```bash
# In the root directory
npm install

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000` and connect to local backend

---

## 🌍 Environment Configuration

### Local Development (.env.dev)
- **Backend Port**: 10000
- **MongoDB**: `mongodb://localhost:27017/aviator-local`
- **Frontend URL**: `http://localhost:3000`

### Production (.env)
- **Backend Port**: 3002
- **MongoDB**: MongoDB Atlas cluster
- **Frontend URL**: `https://aviator-game-rahul.vercel.app`

---

## 📝 Development Notes

1. **Local MongoDB**: Make sure MongoDB is running locally on port 27017
2. **Hot Reload**: Backend uses nodemon for automatic restart on file changes
3. **Separate Database**: Local development uses `aviator-local` database
4. **No Production Impact**: All local changes are isolated from production

---

## 🔧 Admin Setup (Local)

To create an admin user locally:
```bash
cd backend
node setup.js
```

Default admin credentials:
- **Email**: admin@crashgame.com
- **Password**: admin123

---

## 📱 Testing

- **Game**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health**: http://localhost:10000/health