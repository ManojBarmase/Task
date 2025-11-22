const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// @route   GET api/requestors
// @desc    Get all requestors (Employees)
router.get('/', auth, async (req, res) => {
    try {
        // Hum sirf unhe fetch karenge jo 'employee' ya 'requester' hain
        const requestors = await User.find({ role: { $in: ['employee', 'requester'] } })
            .select('-password') // Password mat bhejo
            .sort({ createdAt: -1 });
        res.json(requestors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/requestors
// @desc    Add a new requestor (Create User)
router.post('/', auth, async (req, res) => {
    const { firstName, lastName, email, department, location } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Default Password set kar rahe hain (User baad mein change kar sakta hai)
        const defaultPassword = 'Strong@2029'; 

        user = new User({
            firstName,
            lastName,
            email,
            password: defaultPassword,
            department,
            officeLocation: location, // Frontend se 'location' aa raha hai, Model mein 'officeLocation' hai
            role: 'employee' // By default role employee hoga
        });

        // Password Hash karein
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(defaultPassword, salt);

        await user.save();

        // Password hata kar response bhejein
        const userRes = user.toObject();
        delete userRes.password;

        res.json(userRes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/requestors/:id
// @desc    Delete a requestor
router.delete('/:id', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Requestor removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;