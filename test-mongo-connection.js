/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key) {
    let value = valueParts.join('=').trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key.trim()] = value;
  }
});

const MONGO_URI = env.MONGO_URI;

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  console.log('Connection String:', MONGO_URI?.replace(/:[^:]*@/, ':****@'));
  console.log('');

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    console.log('   (This may take 10-30 seconds on first connection)');
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
    });

    console.log('✅ Connection successful!\n');
    console.log('✅ MongoDB Atlas is responding');
    console.log('✅ Database:', MONGO_URI?.split('/').pop()?.split('?')[0]);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected cleanly\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Syscall:', error.syscall);
    console.error('Hostname:', error.hostname);
    
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check MongoDB Atlas cluster is RUNNING (not paused)');
    console.error('2. Verify IP whitelist includes your network');
    console.error('3. Try disabling VPN/Antivirus temporarily');
    console.error('4. Check if ISP allows MongoDB DNS/connections');
    console.error('5. Verify .env.local has correct password (no special chars issues)');
    
    process.exit(1);
  }
}

testConnection();
