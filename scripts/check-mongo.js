// Diagnostic script to check DNS SRV resolution and attempt mongoose connection
// Usage: set MONGO_URI="<your mongodb+srv uri>" && node scripts/check-mongo.js
/* eslint-disable @typescript-eslint/no-require-imports */

const dns = require('dns').promises;
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const FALLBACK = process.env.MONGO_URI_FALLBACK;

async function checkSrv(uri) {
  try {
    const m = uri.match(/^mongodb\+srv:\/\/([^\/]+)/);
    if (!m) {
      console.log('Not an SRV URI; skipping SRV lookup');
      return;
    }
    // m[1] can be user:pass@host or host. Extract the hostname portion after '@' if present
    let hostPart = m[1];
    const atIndex = hostPart.lastIndexOf('@');
    if (atIndex !== -1) {
      hostPart = hostPart.slice(atIndex + 1);
    }
    // If there is a replica set list separated by commas, take the first host for SRV lookup
    const host = hostPart.split(',')[0];
    const srvName = `_mongodb._tcp.${host}`;
    console.log('Resolving SRV for', srvName);
    const records = await dns.resolveSrv(srvName);
    console.log('SRV records:', records);
  } catch (err) {
    console.error('SRV lookup failed:', err && err.code ? `${err.code} - ${err.message}` : err);
  }
}

async function tryConnect(uri) {
  console.log('\nAttempting mongoose.connect with:', uri ? uri.replace(/:[^:]*@/, ':****@') : uri);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('Mongoose connected successfully');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongoose connect failed:', err && err.code ? `${err.code} - ${err.message}` : err);
  }
}

(async function main() {
  console.log('MONGO_URI present?', !!MONGO_URI);
  if (!MONGO_URI) {
    console.error('Please set MONGO_URI environment variable before running this script.');
    process.exit(1);
  }

  await checkSrv(MONGO_URI);
  await tryConnect(MONGO_URI);

  if (FALLBACK) {
    console.log('\nTrying fallback URI...');
    await tryConnect(FALLBACK);
  } else {
    console.log('\nNo MONGO_URI_FALLBACK set; if SRV fails, create a standard (mongodb://) connection string in Atlas and set MONGO_URI_FALLBACK to test.');
  }
})();
