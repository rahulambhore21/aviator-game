require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crashgame');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@crashgame.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@crashgame.com',
      password: 'admin123',
      isAdmin: true,
      balance: 100000
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@crashgame.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
