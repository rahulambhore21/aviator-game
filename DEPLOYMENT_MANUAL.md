# 🚀 Aviator Crash Game - Deployment Manual

## Table of Contents
- [Deployment Overview](#deployment-overview)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Railway/Render)](#backend-deployment-railwayrender)
- [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [Domain & HTTPS Setup](#domain--https-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Analytics](#monitoring--analytics)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Backup & Recovery](#backup--recovery)

## Deployment Overview

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

Internet Users
      │
      ▼
┌─────────────┐    CDN/Edge     ┌─────────────┐    Load Balancer
│ Custom      │───▶ Network ───▶│ Vercel      │───▶ Auto-scaling
│ Domain      │    (Global)     │ Frontend    │    Serverless
│ HTTPS/SSL   │                 │ Next.js     │    Functions
└─────────────┘                 └─────────────┘
                                        │
                                        ▼ API Calls
                                ┌─────────────┐    WebSocket     ┌─────────────┐
                                │ Railway/    │◀────────────────▶│ Socket.IO   │
                                │ Render      │  Real-time      │ Connections │
                                │ Backend     │  Communication  │ (Persistent)│
                                │ Node.js     │                 │             │
                                └─────────────┘                 └─────────────┘
                                        │
                                        ▼ Database
                                ┌─────────────┐    Replica Set   ┌─────────────┐
                                │ MongoDB     │◀────────────────▶│ Backup      │
                                │ Atlas       │   Auto-failover │ Storage     │
                                │ (Primary)   │                 │ (Secondary) │
                                └─────────────┘                 └─────────────┘
```

### Technology Stack Production Setup
- **Frontend**: Next.js 15 on Vercel (Serverless)
- **Backend**: Node.js + Express on Railway/Render (Container)
- **Database**: MongoDB Atlas (Managed Cloud)
- **Real-time**: Socket.IO with Redis adapter (if needed)
- **CDN**: Vercel Edge Network + Cloudflare (optional)
- **SSL**: Automatic Let's Encrypt certificates
- **Monitoring**: Vercel Analytics + Custom logging

## Frontend Deployment (Vercel)

### Step 1: Prepare Next.js for Production

#### Update `next.config.ts`
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone', // For Docker if needed
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API routes optimization
  experimental: {
    serverActions: {
      allowedOrigins: ['aviator-game.vercel.app', 'your-domain.com'],
    },
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

#### Optimize `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "build:analyze": "ANALYZE=true next build",
    "clean": "rm -rf .next out",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 2: Vercel Configuration

#### Create `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "@backend-url",
    "NEXT_PUBLIC_WS_URL": "@websocket-url"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/proxy/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    }
  ]
}
```

### Step 3: Deployment Process

#### Option A: GitHub Integration (Recommended)
1. **Connect Repository**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Vercel Dashboard Setup**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Configure project settings

3. **Environment Variables in Vercel**
   ```bash
   # In Vercel Dashboard > Settings > Environment Variables
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   ```

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### Step 4: Custom Domain Setup

#### Add Domain in Vercel
1. Go to Project Settings > Domains
2. Add your custom domain: `aviator-game.com`
3. Configure DNS settings:

```dns
# DNS Configuration (at your domain registrar)
Type    Name    Value                           TTL
CNAME   www     cname.vercel-dns.com           3600
A       @       76.76.19.61                    3600
```

#### SSL Certificate
- Vercel automatically provisions SSL certificates
- Certificates auto-renew every 90 days
- HTTPS redirects are automatically configured

## Backend Deployment (Railway/Render)

### Step 1: Prepare Backend for Production

#### Update `package.json`
```json
{
  "name": "aviator-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "test": "jest",
    "lint": "eslint .",
    "setup": "node setup.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

#### Create `Procfile` (for Render)
```
web: node server.js
```

#### Create `railway.toml` (for Railway)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "aviator-backend"

[services.variables]
PORT = { default = "3001" }
NODE_ENV = { default = "production" }
```

### Step 2: Environment Configuration

#### Create `.env.production`
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/aviator_game?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secure-jwt-secret-256-bits-long

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://aviator-game.vercel.app

# Admin
ADMIN_EMAIL=admin@aviator-game.com
ADMIN_PASSWORD=secure-admin-password

# Rate Limiting
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/aviator.log

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=another-super-secure-session-secret

# External APIs (if any)
PAYMENT_API_KEY=your-payment-api-key
EMAIL_SERVICE_KEY=your-email-service-key
```

### Step 3: Railway Deployment

#### Deploy via GitHub
1. **Connect Repository**
   ```bash
   # Ensure code is in GitHub
   git add .
   git commit -m "Prepare backend for Railway deployment"
   git push origin main
   ```

2. **Railway Dashboard**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your backend repository

3. **Configure Environment Variables**
   ```bash
   # In Railway Dashboard > Variables
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aviator
   JWT_SECRET=your-jwt-secret
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://aviator-game.vercel.app
   ```

4. **Custom Domain (Optional)**
   ```bash
   # In Railway Dashboard > Settings > Domains
   # Add: api.aviator-game.com
   ```

#### Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Step 4: Render Deployment (Alternative)

#### Via Dashboard
1. Go to [render.com](https://render.com)
2. New > Web Service
3. Connect GitHub repository
4. Configure settings:

```yaml
# Render Configuration
Name: aviator-backend
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Starter ($7/month)
```

#### Health Check Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

#### Cluster Configuration
```javascript
// Recommended cluster settings
{
  "provider": "AWS", // or "GCP", "Azure"
  "region": "us-east-1", // Choose closest to your backend
  "tier": "M0", // Free tier for development
  "tier_production": "M10", // Dedicated for production
  "backup": true,
  "monitoring": true
}
```

#### Database Setup Script
```javascript
// setup-db.js
const { MongoClient } = require('mongodb');

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('aviator_game');
    
    // Create collections with validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'balance'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            },
            balance: {
              bsonType: 'number',
              minimum: 0
            }
          }
        }
      }
    });
    
    // Create indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { isAdmin: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    await db.collection('bets').createIndexes([
      { key: { user: 1, createdAt: -1 } },
      { key: { roundId: 1 } },
      { key: { status: 1 } }
    ]);
    
    await db.collection('rounds').createIndexes([
      { key: { roundId: 1 }, unique: true },
      { key: { createdAt: -1 } },
      { key: { crashPoint: 1 } }
    ]);
    
    console.log('Database setup completed successfully');
  } finally {
    await client.close();
  }
}

setupDatabase().catch(console.error);
```

### Step 2: Security Configuration

#### IP Whitelist
```bash
# In MongoDB Atlas Dashboard > Network Access
# Add IP addresses:
0.0.0.0/0  # Allow all (not recommended for production)
# Or specific IPs:
Railway_IP_Range  # Railway's IP range
Render_IP_Range   # Render's IP range
Your_Office_IP    # Your development IP
```

#### Database User
```javascript
// Create database user with minimal permissions
{
  "username": "aviator_app",
  "password": "SecureRandomPassword123!",
  "roles": [
    {
      "role": "readWrite",
      "db": "aviator_game"
    }
  ]
}
```

### Step 3: Connection String Optimization

#### Production Connection String
```bash
# Optimized for production
MONGODB_URI=mongodb+srv://aviator_app:password@cluster0.mongodb.net/aviator_game?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1
```

#### Connection Pool Configuration
```javascript
// In your database connection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  
  // Retry settings
  retryWrites: true,
  w: 'majority'
});
```

## Environment Configuration

### Frontend Environment Variables

#### Development (`.env.local`)
```bash
# Backend URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_SOUNDS=true

# Debug settings
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

#### Production (Vercel Environment Variables)
```bash
# Backend URLs
NEXT_PUBLIC_BACKEND_URL=https://aviator-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://aviator-backend.railway.app

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_SOUNDS=true

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=12345678

# Debug settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error
```

### Backend Environment Variables

#### Development (`.env`)
```bash
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/aviator_game_dev

# Security
JWT_SECRET=dev-jwt-secret-not-for-production
BCRYPT_ROUNDS=10

# Admin
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=admin123

# Logging
LOG_LEVEL=debug
```

#### Production Environment
```bash
# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://aviator-game.vercel.app

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aviator

# Security (Use strong, random values)
JWT_SECRET=prod-super-secure-jwt-secret-256-bits-minimum
BCRYPT_ROUNDS=12
SESSION_SECRET=prod-super-secure-session-secret

# Admin
ADMIN_EMAIL=admin@aviator-game.com
ADMIN_PASSWORD=SecureAdminPassword123!

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/aviator.log

# Rate Limiting
REDIS_URL=redis://red-xxxxx:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Environment Variables Security

#### Using Secrets Management
```javascript
// For sensitive variables, use platform secret management

// Railway Secrets
railway run --service backend npm start

// Render Environment Groups
// Group: Production
// Variables: Encrypted and accessible only to service

// Vercel Environment Variables
// Mark sensitive variables as "Secret" in dashboard
```

## Domain & HTTPS Setup

### Step 1: Domain Configuration

#### DNS Setup for Full Domain
```dns
# Main domain (example.com)
Type    Name    Value                           TTL
A       @       76.76.19.61                    3600  # Vercel IP
CNAME   www     cname.vercel-dns.com           3600  # WWW redirect

# API subdomain (api.example.com)
CNAME   api     your-backend.railway.app       3600  # Backend

# WebSocket subdomain (ws.example.com)
CNAME   ws      your-backend.railway.app       3600  # WebSocket
```

#### Cloudflare Setup (Optional CDN)
```bash
# Add domain to Cloudflare
1. Add site: aviator-game.com
2. Copy DNS records from current registrar
3. Update nameservers at registrar:
   - NS: cloudflare-ns1.com
   - NS: cloudflare-ns2.com

# Cloudflare settings:
SSL/TLS: Full (strict)
Always Use HTTPS: On
Min TLS Version: 1.2
Browser Cache TTL: 4 hours
```

### Step 2: SSL Certificate Management

#### Vercel SSL (Automatic)
```javascript
// SSL is automatic on Vercel
// Certificates are provisioned and renewed automatically
// No configuration needed

// Check SSL status
// Vercel Dashboard > Project > Domains > SSL Certificate
```

#### Custom SSL (Advanced)
```javascript
// For custom certificates (if needed)
// Vercel Dashboard > Project > Settings > Certificates

// Upload:
// - Certificate (.crt or .pem)
// - Private Key (.key)
// - Certificate Chain (if applicable)
```

### Step 3: HTTPS Enforcement

#### Frontend HTTPS Redirects
```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      // Force HTTPS in production
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://aviator-game.com/:path*',
        permanent: true,
      },
    ];
  },
};
```

#### Backend HTTPS Configuration
```javascript
// server.js - Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && 
      req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

## CI/CD Pipeline

### Step 1: GitHub Actions Setup

#### Frontend CI/CD (`.github/workflows/frontend.yml`)
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**', 'package.json', 'next.config.ts']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_BACKEND_URL: ${{ secrets.NEXT_PUBLIC_BACKEND_URL }}
          NEXT_PUBLIC_WS_URL: ${{ secrets.NEXT_PUBLIC_WS_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Backend CI/CD (`.github/workflows/backend.yml`)
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_DATABASE: test_aviator
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run linting
        run: |
          cd backend
          npm run lint
      
      - name: Run tests
        run: |
          cd backend
          npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017/test_aviator
          NODE_ENV: test
          JWT_SECRET: test-secret

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          project-id: ${{ secrets.RAILWAY_PROJECT_ID }}
          service: backend
```

### Step 2: Deployment Secrets

#### GitHub Secrets Configuration
```bash
# In GitHub Repository > Settings > Secrets and Variables > Actions

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_TOKEN=your-railway-token
RAILWAY_PROJECT_ID=your-project-id

# Environment Variables
NEXT_PUBLIC_BACKEND_URL=https://aviator-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://aviator-backend.railway.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aviator
JWT_SECRET=your-production-jwt-secret
```

### Step 3: Automated Testing

#### Test Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Integration Tests
```javascript
// tests/integration/game.test.js
describe('Game Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Complete game round flow', async () => {
    // Test betting phase
    // Test game start
    // Test cash out
    // Test crash
    // Verify database state
  });

  test('Multiple user betting', async () => {
    // Test concurrent bets
    // Test cash outs
    // Verify balance consistency
  });
});
```

## Monitoring & Analytics

### Step 1: Application Monitoring

#### Error Tracking with Sentry
```javascript
// Install Sentry
npm install @sentry/node @sentry/nextjs

// Backend setup (server.js)
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Frontend setup (next.config.ts)
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... other config
};

module.exports = withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'aviator-frontend',
});
```

#### Custom Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

module.exports = logger;
```

### Step 2: Performance Monitoring

#### Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Custom Metrics
```javascript
// Backend metrics collection
const metrics = {
  gameRounds: 0,
  activePlayers: 0,
  totalBets: 0,
  serverUptime: Date.now()
};

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    ...metrics,
    uptime: Date.now() - metrics.serverUptime,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});
```

### Step 3: Database Monitoring

#### MongoDB Atlas Monitoring
```javascript
// Monitor connection health
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
```

## Common Issues & Troubleshooting

### Issue 1: CORS Errors

#### Problem
```
Access to fetch at 'https://backend.railway.app/api/auth/login' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

#### Solution
```javascript
// Backend CORS configuration
const cors = require('cors');

app.use(cors({
  origin: [
    'https://aviator-game.vercel.app',
    'https://www.aviator-game.com',
    'https://aviator-game.com',
    process.env.CORS_ORIGIN
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));
```

### Issue 2: WebSocket Connection Failures

#### Problem
```
WebSocket connection failed: Error during WebSocket handshake
```

#### Solution
```javascript
// Client-side WebSocket configuration
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'], // Fallback to polling
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5
});

// Server-side CORS for Socket.IO
io.engine.on('connection_error', (err) => {
  console.log('Socket connection error:', err.req, err.code, err.message, err.context);
});
```

### Issue 3: Database Connection Timeouts

#### Problem
```
MongoServerSelectionError: Server selection timed out after 30000 ms
```

#### Solution
```javascript
// Optimized connection string
const mongoUri = `${process.env.MONGODB_URI}?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000`;

// Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};
```

### Issue 4: Environment Variables Not Loading

#### Problem
```
Cannot read properties of undefined (reading 'MONGODB_URI')
```

#### Solution
```javascript
// Verify environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Load .env file in development
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
```

### Issue 5: Build Failures

#### Problem
```
Type error: Cannot find module 'socket.io-client' or its corresponding type declarations
```

#### Solution
```bash
# Install missing types
npm install --save-dev @types/socket.io-client

# Update tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Security Hardening

### Step 1: Production Security Headers

#### Security Middleware
```javascript
// helmet.js security
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Step 2: Rate Limiting

#### Production Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

// API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
```

### Step 3: Input Validation

#### Request Validation
```javascript
const { body, validationResult } = require('express-validator');

// Bet validation
const validateBet = [
  body('amount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Bet amount must be between 0.01 and 10000'),
  body('amount')
    .custom(value => {
      const rounded = Math.round(value * 100) / 100;
      if (rounded !== value) {
        throw new Error('Amount cannot have more than 2 decimal places');
      }
      return true;
    }),
];

app.post('/api/game/bet', validateBet, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process bet...
});
```

## Performance Optimization

### Step 1: Frontend Optimization

#### Next.js Optimizations
```typescript
// next.config.ts
const nextConfig = {
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Static optimization
  output: 'export' // For static sites
};
```

#### Code Splitting
```typescript
// Lazy load components
import dynamic from 'next/dynamic';

const GameChart = dynamic(() => import('../components/GameChart'), {
  loading: () => <div>Loading game...</div>,
  ssr: false // Disable SSR for client-only components
});

const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), {
  loading: () => <div>Loading admin...</div>
});
```

### Step 2: Backend Optimization

#### Database Query Optimization
```javascript
// Optimize frequent queries
const getUserBets = async (userId, limit = 20) => {
  return await Bet.find({ user: userId })
    .select('amount multiplier payout cashedOut createdAt') // Only needed fields
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean(); // Return plain objects instead of Mongoose documents
};

// Use aggregation for complex queries
const getRoundStatistics = async (roundId) => {
  return await Bet.aggregate([
    { $match: { roundId } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalVolume: { $sum: '$amount' },
        totalPayout: { $sum: '$payout' },
        winners: { $sum: { $cond: ['$cashedOut', 1, 0] } }
      }
    }
  ]);
};
```

#### Caching Strategy
```javascript
const Redis = require('redis');
const client = Redis.createClient({ url: process.env.REDIS_URL });

// Cache game statistics
const getCachedGameStats = async () => {
  const cached = await client.get('game:stats');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const stats = await calculateGameStats();
  await client.setex('game:stats', 300, JSON.stringify(stats)); // Cache for 5 minutes
  return stats;
};
```

## Backup & Recovery

### Step 1: Database Backups

#### MongoDB Atlas Backups
```javascript
// Automated backups are included with MongoDB Atlas
// Configure backup schedule in Atlas dashboard:
// - Continuous Cloud Backup
// - Point-in-time recovery
// - Cross-region backups

// Manual backup script
const mongodump = require('mongodump');

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `./backups/aviator-${timestamp}`;
  
  await mongodump({
    uri: process.env.MONGODB_URI,
    out: backupPath
  });
  
  console.log(`Backup created: ${backupPath}`);
}

// Schedule backups (if using self-hosted)
const cron = require('node-cron');
cron.schedule('0 2 * * *', createBackup); // Daily at 2 AM
```

### Step 2: Application State Backups

#### Critical Data Export
```javascript
// Export user data
const exportUserData = async () => {
  const users = await User.find({})
    .select('-password')
    .lean();
  
  const timestamp = new Date().toISOString();
  const filename = `users-export-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(users, null, 2));
  return filename;
};

// Export game statistics
const exportGameData = async (days = 30) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const rounds = await Round.find({ createdAt: { $gte: cutoff } });
  const bets = await Bet.find({ createdAt: { $gte: cutoff } });
  
  return { rounds, bets };
};
```

### Step 3: Disaster Recovery Plan

#### Recovery Procedures
```bash
# 1. Restore Database (MongoDB Atlas)
# - Use Atlas dashboard to restore from backup
# - Point-in-time recovery available

# 2. Redeploy Applications
git checkout main
vercel --prod  # Redeploy frontend
railway up     # Redeploy backend

# 3. Verify Services
curl https://api.aviator-game.com/health
curl https://aviator-game.com

# 4. Test Critical Functions
# - User authentication
# - Game rounds
# - Betting functionality
# - Real-time updates
```

This deployment manual provides comprehensive guidance for deploying the Aviator crash betting game to production, ensuring security, performance, and reliability. Follow these procedures for a successful production deployment.
