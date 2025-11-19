// server/server.js
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
const vendorRoutes = require('./routes/vendor'); 
const contractRoutes = require('./routes/contract'); 
const analyticsRoutes = require('./routes/analyticsRoutes');
// ---------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const JWT_SECRET = process.env.JWT_SECRET; 

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set. Check your .env file.");
}

// 1. Allowed Origins को Environment Variable से पढ़ें
const allowedOrigins = [
  process.env.FRONTEND_URL, // Render URL या लोकल http://localhost:5173
  'http://localhost:5173',  // Local Vite Dev Server का default port
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'https://task-1mu1.onrender.com',
  'https://task-pink-seven.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // अगर origin allowedOrigins में है, या अगर origin undefined है (जैसे local server-to-server calls)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // अगर आप cookies या sessions का उपयोग कर रहे हैं
};

app.use(cors(corsOptions));

// Middleware
// app.use(cors()); 
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 2. MongoDB Connection...
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    // seedDatabase(); 
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// 3. Routes Define करें (Using imported variables now)
app.use('/api/auth', authRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes); 
app.use('/api/contracts', contractRoutes); 
app.use('/api/analytics', analyticsRoutes);

// app.get('/', (req, res) => {
//     res.send('ProcureIQ Backend API is running...');
// });

app.get('/api/status', (req, res) => {
  res.json({
    message: 'ProcureIQ Backend is running!',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});


app.get('/', (req, res) => {
    res.send('ProcureIQ Backend is Running. Frontend is hosted on Vercel.');
});
// 4. Static Files and Catch-all Handler (For React App)
// Render recommends placing the static middleware and catch-all handler AFTER all API routes.
// app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// 👇👇 YEH HAI MAIN FIX (Static Files Setup) 👇👇

// A. Client Build Path Define Karein
// __dirname abhi 'server' folder mein hai, isliye humein '../client/dist' jana hai
// const clientBuildPath = path.join(__dirname, '../client/dist');

// B. Static Files Serve Karein (CSS, JS, Images)
// app.use(express.static(clientBuildPath));

// C. Catch-All Route (Sabse Last Mein)
// Agar koi API route match nahi hua, aur koi static file nahi mili,
// toh React ka index.html bhej do (SPA routing ke liye)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(clientBuildPath, 'index.html'));
// });

// // FIX: Reverting to simple '*' which is stable on Express 4.x
// app.get('*', (req, res) => { 
//   res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
// });
// app.use((req, res, next) => {
//     // अगर कोई भी API रूट या स्टैटिक फ़ाइल नहीं मिली है,
//     // और रिक्वेस्ट GET है (ब्राउज़र नेविगेशन के लिए), तो index.html भेजें।
//     if (req.method === 'GET') {
//         res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
//     } else {
//         // 404/Not Found हैंडलिंग
//         next();
//     }
// });

// Agar aap chahte hain ki galat URL par 404 aaye (Instead of failing)
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// 5. Server Start करें
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
