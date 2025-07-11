# Deployment Configuration

## Frontend URLs
- **Production Frontend**: https://aviator-game-rahul.vercel.app
- **Local Development**: http://localhost:3000

## Backend URLs  
- **Production Backend**: https://aviator-game-lzz1.onrender.com
- **Local Development**: http://localhost:3002

## Environment Variables Set

### Frontend (.env.production & .env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://aviator-game-lzz1.onrender.com
NEXT_PUBLIC_API_URL=https://aviator-game-lzz1.onrender.com/api
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/crashgame
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3002
FRONTEND_URL=https://aviator-game-rahul.vercel.app
NODE_ENV=production
```

## Configuration Updates Applied

✅ **Frontend API Configuration**
- Updated `lib/api.ts` default URL
- Updated `lib/userAPI.ts` default URL  
- Updated `lib/adminStore.ts` default URL
- Updated `lib/store.ts` socket connection URL
- Updated `components/RecentCrashes.tsx` socket URL

✅ **Backend CORS Configuration**
- Updated Express CORS origins
- Updated Socket.IO CORS origins
- Added production frontend URL to allowed origins

✅ **Environment Files**
- Created `.env.production` for Vercel deployment
- Created `.env.local` for local development
- Updated backend `.env` with production URLs

## Deployment Checklist

### For Vercel (Frontend)
1. Deploy to Vercel using the production environment variables
2. Ensure environment variables are set in Vercel dashboard
3. Frontend will automatically use production backend URL

### For Render (Backend)  
1. Deploy backend to Render
2. Set environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET` 
   - `FRONTEND_URL=https://aviator-game-rahul.vercel.app`
   - `NODE_ENV=production`
3. Backend will allow CORS from production frontend

## Testing
- Frontend will connect to production backend at `https://aviator-game-lzz1.onrender.com`
- Socket connections will establish properly between production domains
- CORS is configured to allow cross-origin requests between domains