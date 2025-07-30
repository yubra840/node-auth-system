// server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'node-auth-system-frontend')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'node-auth-system-frontend', 'signup.html'));
});

// MongoDB URI
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri); // ← No deprecated options


async function startServer() {

  try {
    await client.connect();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('✅ Connected to MongoDB');

    const db = client.db('marketsAZ');
    const usersCollection = db.collection('users');

    // Pass collection to route modules

    app.use('/routes', authRoutes(usersCollection));
    app.use('/routes', passwordRoutes(usersCollection));

    app.listen(PORT, () => {
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

startServer();


// Start server
