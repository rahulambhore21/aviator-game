require('dotenv').config();
const mongoose = require('mongoose');

async function fixAddressIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crashgame');
    console.log('🎯 Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('📋 Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Check if the problematic address index exists
    const addressIndex = indexes.find(idx => idx.key && idx.key.address === 1);
    
    if (addressIndex) {
      console.log('🗑️  Dropping existing address index:', addressIndex.name);
      await collection.dropIndex(addressIndex.name);
      console.log('✅ Dropped index successfully');
    } else {
      console.log('ℹ️  No existing address index found');
    }

    // Create the new sparse unique index
    console.log('🔧 Creating new sparse unique index for address...');
    await collection.createIndex(
      { address: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'address_1_sparse'
      }
    );
    console.log('✅ Created sparse unique index for address');

    // Verify the new index
    const newIndexes = await collection.indexes();
    const newAddressIndex = newIndexes.find(idx => idx.name === 'address_1_sparse');
    
    if (newAddressIndex) {
      console.log('🎉 New index created successfully:');
      console.log('   Name:', newAddressIndex.name);
      console.log('   Key:', newAddressIndex.key);
      console.log('   Unique:', newAddressIndex.unique);
      console.log('   Sparse:', newAddressIndex.sparse);
    }

    console.log('🏁 Index migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing address index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
fixAddressIndex();