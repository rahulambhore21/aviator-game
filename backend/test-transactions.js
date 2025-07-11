require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function testTransactions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crashgame');
    console.log('🎯 Connected to MongoDB');

    // Create a test user if none exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        password: 'testpass123',
        balance: 1000
      });
      await testUser.save();
      console.log('👤 Created test user');
    }

    // Create a test transaction if none exists
    const existingTransaction = await Transaction.findOne({ user: testUser._id });
    if (!existingTransaction) {
      const transaction = new Transaction({
        user: testUser._id,
        type: 'deposit',
        amount: 500,
        status: 'pending',
        reference: `TEST_${Date.now()}`
      });
      await transaction.save();
      console.log('💰 Created test transaction');
    }

    // Test fetching transactions with population
    const transactions = await Transaction.find({})
      .populate('user', 'email')
      .populate('processedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`📋 Found ${transactions.length} transactions:`);
    transactions.forEach(transaction => {
      console.log(`  - ${transaction._id}: ${transaction.type} ${transaction.amount} by ${transaction.user?.email || 'Unknown'}`);
    });

    // Test the formatted structure
    const formatted = transactions.map(transaction => ({
      _id: transaction._id,
      user: transaction.user ? { email: transaction.user.email } : { email: 'Unknown user' },
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod || null,
      adminNotes: transaction.adminNotes || null,
      processedBy: transaction.processedBy ? { email: transaction.processedBy.email } : null,
      processedAt: transaction.processedAt,
      reference: transaction.reference,
      createdAt: transaction.createdAt
    }));

    console.log('✅ Formatted transactions structure looks good!');
    console.log('Sample formatted transaction:', JSON.stringify(formatted[0], null, 2));

  } catch (error) {
    console.error('❌ Error testing transactions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testTransactions();