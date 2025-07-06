require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crashgame');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@crashgame.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      
      // Make sure the existing user has admin privileges
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin');
      }
      
      console.log('📧 Email: admin@crashgame.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Admin Status: true');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      email: 'admin@crashgame.com',
      password: hashedPassword,
      balance: 50000,
      isAdmin: true
    });

    await adminUser.save();
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@crashgame.com');
    console.log('🔑 Password: admin123');
    console.log('💰 Balance: 50,000 coins');
    console.log('👑 Admin Status: true');
    console.log('');
    console.log('🚀 You can now access the admin panel at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

console.log('🔧 Setting up admin user...');
createAdminUser();
