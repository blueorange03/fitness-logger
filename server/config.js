// server/db.js
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI not set in env');

const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;
async function connect() {
  if (!db) {
    await client.connect();
    db = client.db(); // uses DB from URI path or default
    console.log('Connected to MongoDB');
  }
  return db;
}

module.exports = { connect, client };
