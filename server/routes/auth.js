const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); // 👈 Multer ko import karein

const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST api/auth/register
// @desc    Register new user
router.post('/register', async (req, res) => {
    // 'name' ki jagah 'firstName' aur 'lastName' lein (frontend signup form se)
    // Agar signup form sirf 'name' bhej raha hai, toh use 'firstName' maan lein
    const { firstName, lastName, email, password } = req.body;
    
    // Fallback agar signup form abhi bhi 'name' bhej raha hai
    const fName = firstName || req.body.name; 

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ 
            firstName: fName, 
            lastName: lastName || '', // Agar lastName nahi hai toh empty string
            email, 
            password 
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role, user: { id: user.id, firstName: user.firstName, email: user.email } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            // Login par poora user object bhej dein (password chhodkar)
            const userResponse = user.toObject(); // Mongoose doc ko plain object banayein
            delete userResponse.password; // Password hata dein
            
            res.json({ token, role: user.role, user: userResponse });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile details (with image)
// @access  Private
router.put('/profile', [auth, upload.single('profileImage')], async (req, res) => {
    try {
        const { 
            firstName, lastName, email, phone, 
            jobTitle, department, officeLocation 
        } = req.body;

        const updateData = {
            firstName, lastName, email, phone, 
            jobTitle, department, officeLocation
        };
        
        if (req.file) {
            // Path save karein jise server.js static serve kar raha hai
            // e.g., 'uploads/profileImage-123456.png'
            updateData.profileImagePath = `uploads/${req.file.filename}`; 
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // auth middleware se
            { $set: updateData }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Profile updated successfully!', 
            user: updatedUser 
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// @route   GET api/auth/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -date'); 
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; // 👈 CommonJS syntax


// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // User Model (Updated wala)
// const auth = require('../middleware/auth'); // Auth Middleware
// const upload = require('../middleware/upload'); // 👈 1. Multer middleware ko import karein

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//     console.error("JWT_SECRET is not set. Check your .env file.");
// }

// // @route   POST api/auth/register
// // @desc    Register new user
// // @access  Public
// router.post('/register', async (req, res) => {
//     // 2. 'name' ki jagah 'firstName' aur 'lastName' lein
//     const { firstName, lastName, email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }

//         // 3. Naye model ke hisab se user banayein
//         user = new User({ 
//             firstName, 
//             lastName, 
//             email, 
//             password 
//         });

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         await user.save();

//         const payload = {
//             user: {
//                 id: user.id,
//                 role: user.role
//             }
//         };

//         jwt.sign(
//             payload,
//             JWT_SECRET,
//             { expiresIn: '5h' },
//             (err, token) => {
//                 if (err) throw err;
//                 // 4. Signup ke baad initial data bhej dein
//                 res.json({ 
//                     token, 
//                     role: user.role,
//                     user: {
//                         id: user.id,
//                         firstName: user.firstName,
//                         lastName: user.lastName,
//                         email: user.email,
//                         role: user.role
//                     }
//                 });
//             }
//         );

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // @route   POST api/auth/login
// // @desc    Authenticate user & get token
// // @access  Public
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ msg: 'Invalid Credentials' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ msg: 'Invalid Credentials' });
//         }

//         const payload = {
//             user: {
//                 id: user.id,
//                 role: user.role
//             }
//         };

//         jwt.sign(
//             payload,
//             JWT_SECRET,
//             { expiresIn: '5h' },
//             (err, token) => {
//                 if (err) throw err;
//                 // 5. Login ke baad user ka data bhi bhej dein
//                 res.json({ 
//                     token, 
//                     role: user.role,
//                     user: {
//                         id: user.id,
//                         firstName: user.firstName,
//                         lastName: user.lastName,
//                         email: user.email,
//                         role: user.role,
//                         profileImagePath: user.profileImagePath // Taaki image dikha sakein
//                     }
//                 });
//             }
//         );

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // @route   PUT api/auth/profile
// // @desc    Update user profile details (with image)
// // @access  Private
// // 6. 👇️ YEH POORA ROUTE REPLACE KAREIN
// router.put('/profile', [auth, upload.single('profileImage')], async (req, res) => {
//     try {
//         // 1. Frontend se text data aa raha hai
//         const { 
//             firstName, 
//             lastName, 
//             email, 
//             phone, 
//             jobTitle, 
//             department, 
//             officeLocation 
//         } = req.body;

//         // 2. Data ko ek object mein rakhein
//         const updateData = {
//             firstName,
//             lastName,
//             email,
//             phone,
//             jobTitle,
//             department,
//             officeLocation
//         };
        
//         // 3. Agar file upload hui hai (req.file), toh uska path add karein
//         if (req.file) {
//             updateData.profileImagePath = req.file.path;
//             console.log("File uploaded to:", req.file.path);
//         }

//         // 4. Database mein update karein (ID humein 'auth' middleware se milegi)
//         const updatedUser = await User.findByIdAndUpdate(
//             req.user.id, // 👈️ auth middleware se aa raha hai
//             { $set: updateData }, 
//             { new: true }
//         ).select('-password'); // Password chhodkar sab bhej do

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // 5. Frontend ko updated data bhej dein
//         res.status(200).json({ 
//             message: 'Profile updated successfully!', 
//             user: updatedUser 
//         });

//     } catch (error) {
//         console.error('Profile update error:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// // @route   GET api/auth/profile
// // @desc    Get current user's profile
// // @access  Private
// // 7. 👇️ YEH ROUTE BILKUL SAHI HAI! ISE WAISE HI REHNE DEIN.
// // Yeh naye User.js model se saara naya data (jobTitle, phone, etc.) fetch kar lega.
// router.get('/profile', auth, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id)
//             .select('-password -date'); 

//         if (!user) {
//             return res.status(404).json({ msg: 'User not found' });
//         }
        
//         res.json(user); // Frontend ko user data bhej dein

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;


// //  // server/routes/auth.js

// // const express = require('express');
// // const router = express.Router();
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const User = require('../models/User'); // User Model को import करें
// // const auth = require('../middleware/auth'); // 👈️ Auth Middleware import करें

// // // .env से JWT Secret Key सेट करें (अभी हम इसे server.js में सेट करेंगे)
// // // const JWT_SECRET = 'your_strong_jwt_secret'; 
// // // const JWT_SECRET = global.JWT_SECRET;
// // // if (!JWT_SECRET) {
// // //     // अगर सर्वर ने इसे सेट नहीं किया है, तो डिफॉल्ट या एरर दें
// // //     console.error("JWT_SECRET is not set. Check server.js configuration.");
// // // }

// // // 🚨 अब हम सीधे process.env का उपयोग करेंगे!
// // const JWT_SECRET = process.env.JWT_SECRET; 

// // if (!JWT_SECRET) {
// //     // यह चेतावनी अब भी आएगी अगर .env में कुछ गलत है, लेकिन अब यह global पर निर्भर नहीं है।
// //     console.error("JWT_SECRET is not set. Check your .env file.");
// // }

// // // @route   POST api/auth/register
// // // @desc    Register new user
// // // @access  Public
// // router.post('/register', async (req, res) => {
// //     const { name, email, password } = req.body;

// //     try {
// //         // 1. देखें कि यूज़र पहले से मौजूद है या नहीं
// //         let user = await User.findOne({ email });
// //         if (user) {
// //             return res.status(400).json({ msg: 'User already exists' });
// //         }

// //         // 2. नया यूज़र बनाएँ
// //         user = new User({ name, email, password });

// //         // 3. Password को hash करें (सुरक्षा के लिए)
// //         const salt = await bcrypt.genSalt(10);
// //         user.password = await bcrypt.hash(password, salt);

// //         // 4. यूज़र को DB में Save करें
// //         await user.save();

// //         // 5. JWT payload तैयार करें (टोकन के अंदर क्या जानकारी होगी)
// //         const payload = {
// //             user: {
// //                 id: user.id,
// //                 role: user.role
// //             }
// //         };

// //         // 6. Token बनाएँ और भेजें
// //         jwt.sign(
// //             payload,
// //             JWT_SECRET,
// //             { expiresIn: '5h' }, // टोकन 5 घंटे तक मान्य रहेगा
// //             (err, token) => {
// //                 if (err) throw err;
// //                 res.json({ token,role: user.role }); // Frontend को token भेजें
// //             }
// //         );

// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Server error');
// //     }
// // });

// // // @route   POST api/auth/login
// // // @desc    Authenticate user & get token
// // // @access  Public
// // router.post('/login', async (req, res) => {
// //     const { email, password } = req.body;

// //     try {
// //         // 1. देखें कि यूज़र मौजूद है या नहीं
// //         let user = await User.findOne({ email });
// //         if (!user) {
// //             return res.status(400).json({ msg: 'Invalid Credentials' });
// //         }

// //         // 2. Hash किए गए password की तुलना करें
// //         const isMatch = await bcrypt.compare(password, user.password);
// //         if (!isMatch) {
// //             return res.status(400).json({ msg: 'Invalid Credentials' });
// //         }

// //         // 3. JWT payload तैयार करें
// //         const payload = {
// //             user: {
// //                 id: user.id,
// //                 role: user.role
// //             }
// //         };

// //         // 4. Token बनाएँ और भेजें
// //         jwt.sign(
// //             payload,
// //             JWT_SECRET,
// //             { expiresIn: '5h' },
// //             (err, token) => {
// //                 if (err) throw err;
// //                 res.json({ token, role: user.role }); 
// //             }
// //         );

// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Server error');
// //     }
// // });

// // // @route   PUT api/auth/profile
// // // @desc    Update user profile details (requires token)
// // // @access  Private
// // router.put('/profile', auth, async (req, res) => {
// //     // केवल उन फ़ील्ड्स को निकालें जिन्हें हम अपडेट करना चाहते हैं
// //     const { name, companyName, companyAddress, city,country, zipCode } = req.body;
    
// //     // Email और Role को अपडेट करने की अनुमति न दें!
// //     const profileFields = {};
// //     if (name) profileFields.name = name;
// //     if (companyName) profileFields.companyName = companyName;
// //     if (companyAddress) profileFields.companyAddress = companyAddress;
// //     if (city) profileFields.city = city;
// //     if (country) profileFields.country = country;
// //     if (zipCode) profileFields.zipCode = zipCode;

// //     try {
// //         let user = await User.findById(req.user.id);

// //         if (!user) {
// //             return res.status(404).json({ msg: 'User not found' });
// //         }

// //         // Mongoose के findByIdAndUpdate का उपयोग करके अपडेट करें
// //         user = await User.findByIdAndUpdate(
// //             req.user.id,
// //             { $set: profileFields },
// //             { new: true, runValidators: true } // new: true अपडेटेड डॉक्यूमेंट वापस करेगा
// //         ).select('-password');
        
// //         // 💡 यदि आपके User मॉडल में ये फ़ील्ड्स नहीं हैं, तो Mongoose इन्हें अनदेखा कर देगा।
// //         // सुनिश्चित करें कि आपका User मॉडल इन सभी फ़ील्ड्स को सपोर्ट करता है।

// //         // फ्रंटएंड को अपडेटेड डेटा भेजें (profileDetails.jsx के Fetch में उपयोग होगा)
// //         const updatedProfileData = {
// //             name: user.name,
// //             email: user.email,
// //             role: user.role,
// //             companyName: user.companyName || companyName, // Fallback if DB update is not set up
// //             companyAddress: user.companyAddress || companyAddress,
// //             city: user.city,
// //             country: user.country || country,
// //             zipCode: user.zipCode || zipCode,
// //         };
        
// //         res.json(updatedProfileData);

// //     } catch (err) {
// //         console.error(err.message);
// //         // यदि वैलिडेशन या सर्वर में कोई और समस्या है
// //         res.status(500).send('Server error during profile update');
// //     }
// // });

// // router.get('/profile', auth, async (req, res) => {
// //     try {
// //         // डेटाबेस से सभी आवश्यक फ़ील्ड्स को Fetch करें
// //         const user = await User.findById(req.user.id)
// //             .select('-password -date'); // password और date को बाहर रखें

// //         if (!user) {
// //             return res.status(404).json({ msg: 'User not found' });
// //         }
        
// //         // 👈️ सीधे DB से प्राप्त यूजर ऑब्जेक्ट को भेजें।
// //         // चूँकि हमने User स्कीमा में default: '' सेट किया है, यदि यूजर ने इन्हें कभी
// //         // नहीं भरा है, तो वे खाली स्ट्रिंग के रूप में रिटर्न होंगे।
// //         res.json(user); 

// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Server error');
// //     }
// // });


// // module.exports = router;