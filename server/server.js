const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
const seedDatabase = require('./seedData');
const path = require('path');

// --- 1. Import All Routes Explicitly ---
const authRoutes = require('./routes/auth'); 
const dashboardRoutes = require('./routes/dashboard');
const requestRoutes = require('./routes/request');
const vendorRoutes = require('./routes/vendor'); // <--- NEW IMPORT
const contractRoutes = require('./routes/contract'); // <--- NEW IMPORT
const analyticsRoutes = require('./routes/analyticsRoutes');
// ---------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const JWT_SECRET = process.env.JWT_SECRET; 

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set. Check your .env file.");
}

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 2. MongoDB Connection...
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    seedDatabase(); 
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// 3. Routes Define करें (Using imported variables now)
app.use('/api/auth', authRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes); // <--- Updated to use imported variable
app.use('/api/contracts', contractRoutes); // <--- Updated to use imported variable
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('ProcureIQ Backend API is running...');
});

app.get('/api/status', (req, res) => {
  res.json({
    message: 'ProcureIQ Backend is running!',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 4. Static Files and Catch-all Handler (For React App)
// Render recommends placing the static middleware and catch-all handler AFTER all API routes.
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
});

// 5. Server Start करें
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
