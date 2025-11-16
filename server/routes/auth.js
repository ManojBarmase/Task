 // server/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User Model को import करें
const auth = require('../middleware/auth'); // 👈️ Auth Middleware import करें

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

// @route   PUT api/auth/profile
// @desc    Update user profile details (requires token)
// @access  Private
router.put('/profile', auth, async (req, res) => {
    // केवल उन फ़ील्ड्स को निकालें जिन्हें हम अपडेट करना चाहते हैं
    const { name, companyName, companyAddress, city,country, zipCode } = req.body;
    
    // Email और Role को अपडेट करने की अनुमति न दें!
    const profileFields = {};
    if (name) profileFields.name = name;
    if (companyName) profileFields.companyName = companyName;
    if (companyAddress) profileFields.companyAddress = companyAddress;
    if (city) profileFields.city = city;
    if (country) profileFields.country = country;
    if (zipCode) profileFields.zipCode = zipCode;

    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Mongoose के findByIdAndUpdate का उपयोग करके अपडेट करें
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true, runValidators: true } // new: true अपडेटेड डॉक्यूमेंट वापस करेगा
        ).select('-password');
        
        // 💡 यदि आपके User मॉडल में ये फ़ील्ड्स नहीं हैं, तो Mongoose इन्हें अनदेखा कर देगा।
        // सुनिश्चित करें कि आपका User मॉडल इन सभी फ़ील्ड्स को सपोर्ट करता है।

        // फ्रंटएंड को अपडेटेड डेटा भेजें (profileDetails.jsx के Fetch में उपयोग होगा)
        const updatedProfileData = {
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName || companyName, // Fallback if DB update is not set up
            companyAddress: user.companyAddress || companyAddress,
            city: user.city,
            country: user.country || country,
            zipCode: user.zipCode || zipCode,
        };
        
        res.json(updatedProfileData);

    } catch (err) {
        console.error(err.message);
        // यदि वैलिडेशन या सर्वर में कोई और समस्या है
        res.status(500).send('Server error during profile update');
    }
});

// @route   GET api/auth/profile
// @desc    Get user profile details (requires token)
// @access  Private
// router.get('/profile', auth, async (req, res) => {
//     try {
//         // req.user.id को auth middleware से प्राप्त करें
//         // select('-password') का उपयोग करके हम password को बाहर रखते हैं
//         const user = await User.findById(req.user.id).select('-password'); 

//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }
        
//         // 💡 DUMMY DATA जोड़ें: क्योंकि आपका User मॉडल में शायद ये फ़ील्ड नहीं हैं
//         // असली काम में, ये फ़ील्ड User मॉडल या एक अलग Company/Profile मॉडल में होने चाहिए।
//         const profileData = {
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             // 👈️ यहां वास्तविक DB से डेटा आना चाहिए
//             companyName: user.companyName || 'Procure Solutions Inc.', 
//             companyAddress: user.companyAddress || '123 Tech Park Rd, Unit 4',
//             country: user.country || 'India',
//             zipCode: user.zipCode || '110001',
//         };

//         res.json(profileData);

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });
router.get('/profile', auth, async (req, res) => {
    try {
        // डेटाबेस से सभी आवश्यक फ़ील्ड्स को Fetch करें
        const user = await User.findById(req.user.id)
            .select('-password -date'); // password और date को बाहर रखें

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // 👈️ सीधे DB से प्राप्त यूजर ऑब्जेक्ट को भेजें।
        // चूँकि हमने User स्कीमा में default: '' सेट किया है, यदि यूजर ने इन्हें कभी
        // नहीं भरा है, तो वे खाली स्ट्रिंग के रूप में रिटर्न होंगे।
        res.json(user); 

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;