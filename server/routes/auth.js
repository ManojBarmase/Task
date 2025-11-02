 // server/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User Model को import करें

// .env से JWT Secret Key सेट करें (अभी हम इसे server.js में सेट करेंगे)
// const JWT_SECRET = 'your_strong_jwt_secret'; 
// const JWT_SECRET = global.JWT_SECRET;
// if (!JWT_SECRET) {
//     // अगर सर्वर ने इसे सेट नहीं किया है, तो डिफॉल्ट या एरर दें
//     console.error("JWT_SECRET is not set. Check server.js configuration.");
// }

// 🚨 अब हम सीधे process.env का उपयोग करेंगे!
const JWT_SECRET = process.env.JWT_SECRET; 

if (!JWT_SECRET) {
    // यह चेतावनी अब भी आएगी अगर .env में कुछ गलत है, लेकिन अब यह global पर निर्भर नहीं है।
    console.error("JWT_SECRET is not set. Check your .env file.");
}

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. देखें कि यूज़र पहले से मौजूद है या नहीं
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. नया यूज़र बनाएँ
        user = new User({ name, email, password });

        // 3. Password को hash करें (सुरक्षा के लिए)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. यूज़र को DB में Save करें
        await user.save();

        // 5. JWT payload तैयार करें (टोकन के अंदर क्या जानकारी होगी)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // 6. Token बनाएँ और भेजें
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '5h' }, // टोकन 5 घंटे तक मान्य रहेगा
            (err, token) => {
                if (err) throw err;
                res.json({ token,role: user.role }); // Frontend को token भेजें
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. देखें कि यूज़र मौजूद है या नहीं
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Hash किए गए password की तुलना करें
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. JWT payload तैयार करें
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // 4. Token बनाएँ और भेजें
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role }); 
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;