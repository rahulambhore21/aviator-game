# MongoDB E11000 Duplicate Key Error Fix

## 🚨 Problem
Getting `E11000 duplicate key error` on `address` field because multiple users have `null` addresses, and MongoDB treats `null` as a duplicate value in unique indexes.

## ✅ Solution Applied

### 1. Updated User Schema
- Changed `address` field to use `sparse: true`
- Added explicit sparse unique index: `{ address: 1 }, { unique: true, sparse: true }`

### 2. Fixed Index Configuration
A **sparse index** only includes documents that have a value for the indexed field, effectively ignoring `null` values.

## 🔧 How to Apply the Fix

### Step 1: Run the Migration Script
```bash
cd backend
node fix-address-index.js
```

This script will:
- Connect to your MongoDB database
- Drop the existing problematic `address` index
- Create a new sparse unique index that allows multiple `null` values
- Verify the new index is working

### Step 2: Manual MongoDB Commands (Alternative)
If you prefer to run commands manually in MongoDB shell:

```javascript
// Connect to your database
use crashgame

// Drop the existing address index
db.users.dropIndex("address_1")

// Create new sparse unique index
db.users.createIndex(
  { "address": 1 }, 
  { 
    "unique": true, 
    "sparse": true,
    "name": "address_1_sparse"
  }
)

// Verify the index
db.users.getIndexes()
```

## 🎯 What This Solves

### Before (Broken):
```javascript
// This would fail with E11000 error
const user1 = new User({ email: "user1@test.com", password: "123456" }); // address: null
const user2 = new User({ email: "user2@test.com", password: "123456" }); // address: null
```

### After (Fixed):
```javascript
// This now works perfectly
const user1 = new User({ email: "user1@test.com", password: "123456" }); // address: null ✅
const user2 = new User({ email: "user2@test.com", password: "123456" }); // address: null ✅
const user3 = new User({ email: "user3@test.com", password: "123456", address: "123 Main St" }); // ✅
const user4 = new User({ email: "user4@test.com", password: "123456", address: "123 Main St" }); // ❌ Duplicate address
```

## 🧠 Key Concepts

**Sparse Index**: Only indexes documents that contain the indexed field. Documents with `null`, `undefined`, or missing fields are excluded from the index.

**Benefits**:
- Multiple users can have `null` addresses
- Users with actual addresses still get uniqueness validation
- No duplicate key errors on registration
- Database performance is maintained

## ✅ Verification

After running the fix, you should be able to:
1. Register multiple users without addresses
2. Still get uniqueness validation for actual addresses
3. No more E11000 errors on user registration

Run the migration script and your duplicate key error will be resolved! 🎉