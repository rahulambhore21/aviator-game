# Admin Credentials Configuration

## 🔐 Hardcoded Admin Login

The admin login credentials are now **hardcoded directly in the code** for easy modification without touching the database or environment variables.

## 📍 Location

**File**: `backend/routes/auth.js`  
**Function**: `POST /admin-login`  
**Lines**: Look for the `ADMIN_CREDENTIALS` object

## 🛠️ How to Change Admin Password

1. Open `backend/routes/auth.js`
2. Find the `ADMIN_CREDENTIALS` object:

```javascript
const ADMIN_CREDENTIALS = {
  email: 'admin@crashgame.com',
  password: 'admin123'  // Change this password whenever you want
};
```

3. Change the `password` field to your desired password
4. Save the file
5. Restart your backend server

## ✅ Current Default Credentials

- **Email**: `admin@crashgame.com`
- **Password**: `admin123`

## 🔄 How It Works

1. When admin tries to log in, the system checks against the hardcoded password
2. If credentials match, it finds or creates an admin user in the database
3. The admin user in database is created automatically with the hardcoded credentials
4. JWT token is generated for authentication

## 🎯 Benefits

- ✅ **No Database Dependency**: Change password without touching database
- ✅ **No Environment Variables**: No need to update .env files
- ✅ **Easy Updates**: Just edit the code and restart
- ✅ **Version Control**: Password changes are tracked in git
- ✅ **Instant Changes**: No deployment config needed

## ⚠️ Security Note

Since the password is hardcoded in the source code:
- Ensure your code repository is private
- Consider this approach for development/testing environments
- For production, you may want to use environment variables

## 🚀 Quick Change Examples

### Change to a Strong Password
```javascript
const ADMIN_CREDENTIALS = {
  email: 'admin@crashgame.com',
  password: 'MySecur3P@ssw0rd2024!'
};
```

### Change Email and Password
```javascript
const ADMIN_CREDENTIALS = {
  email: 'superadmin@mysite.com',
  password: 'SuperSecret123!'
};
```

### Change for Different Environments
```javascript
const ADMIN_CREDENTIALS = {
  email: 'admin@crashgame.com',
  password: process.env.NODE_ENV === 'production' ? 'ProdPass123!' : 'DevPass123'
};
```

## 🔧 Testing the Change

1. Change the password in the code
2. Restart backend: `npm start` or `node server.js`
3. Go to admin login page
4. Use the new password to log in
5. ✅ Success!

---

**Last Updated**: January 2024  
**Current Password**: `admin123` (change this as needed)