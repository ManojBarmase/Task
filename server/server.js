 // server/server.js

const express = require('express');
const mongoose = require('mongoose');
// const { MOCK_USAGE_DATA } = require('./mockData');
const cors = require('cors');
require('dotenv').config(); 
const seedDatabase = require('./seedData');
const analyticsRoutes = require('./routes/analyticsRoutes');
// const bodyParser = require('body-parser');

// import the Authentication Route 
const authRoutes = require('./routes/auth'); 
const dashboardRoutes = require('./routes/dashboard');
const requestRoutes = require('./routes/request');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// JWT Secret को global variable के रूप में सेट करें (auth.js में इस्तेमाल के लिए)
// global.JWT_SECRET = process.env.JWT_SECRET; 

// Middleware
app.use(cors()); 
app.use(express.json()); 
// app.use(bodyParser.json());

// 1. MongoDB Connection...
// (बाकी कनेक्शन कोड पहले जैसा ही रहेगा)
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    // 🎯 NEW: Call the seed function after successful connection
    seedDatabase(); 
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// 2. Routes Define करें
// Auth Routes को /api/auth path पर मैप करें
app.use('/api/auth', authRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', require('./routes/vendor'));
app.use('/api/contracts', require('./routes/contract'));

// Use the new analytics routes
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

// app.get('/api/analytics/usage', (req, res) => {
//     // 200 (OK) स्टेटस के साथ सीधे ARRAY भेजें
//     // Note: यदि आपका React कोड `usageRes.data.data` की अपेक्षा कर रहा है, 
//     // तो आप यहाँ एक wrapper object `{ data: MOCK_USAGE_DATA }` भेज सकते हैं।
    
//     // अभी हम सीधा Array भेज रहे हैं, जो बेहतर प्रैक्टिस है।
//     console.log('Serving usage data...');
//     res.json(MOCK_USAGE_DATA); 
// });


// Server Start करें
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});