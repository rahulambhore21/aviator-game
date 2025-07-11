require('dotenv').config({ path: '.env.dev' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function createLocalAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aviator-local');
    console.log('🎯 Connected to local MongoDB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@crashgame.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists in local database');
      console.log('📧 Email: admin@crashgame.com');
      console.log('🔑 Password: admin123');
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
    console.log('✅ Local admin user created successfully');
    console.log('📧 Email: admin@crashgame.com');
    console.log('🔑 Password: admin123');
    console.log('🎮 Access admin panel at: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createLocalAdminUser();