const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); // 👈 Multer ko import karein

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in .env");
}

// @route   POST api/auth/register
// @desc    Register new user
router.post('/register', async (req, res) => {
    // 👇 AB HUM SEEDHA firstName AUR lastName LENGE
    const { firstName, lastName, email, password } = req.body;

    try {
        // 1. Check user exist
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create User (No splitting needed now)
        user = new User({
            firstName,
            lastName,
            email,
            password
        });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Save User
        await user.save();

        // 5. Generate Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    role: user.role,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role
                    } 
                });
            }
        );

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/auth/register
// @desc    Register new user
// router.post('/register', async (req, res) => {
//     // 'name' ki jagah 'firstName' aur 'lastName' lein (frontend signup form se)
//     // Agar signup form sirf 'name' bhej raha hai, toh use 'firstName' maan lein
//     const { firstName, lastName, email, password } = req.body;
    
//     // Fallback agar signup form abhi bhi 'name' bhej raha hai
//     const fName = firstName || req.body.name; 

//     try {
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }

//         user = new User({ 
//             firstName: fName, 
//             lastName: lastName || '', // Agar lastName nahi hai toh empty string
//             email, 
//             password 
//         });

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);
//         await user.save();

//         const payload = { user: { id: user.id, role: user.role } };

//         jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
//             if (err) throw err;
//             res.json({ token, role: user.role, user: { id: user.id, firstName: user.firstName, email: user.email } });
//         });

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

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

