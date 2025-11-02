// server/routes/request.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Auth middleware
const Request = require('../models/Request');
const role = require('../middleware/role');

// @route   POST api/requests
// @desc    Create a new Purchase Request (Create)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, cost, department } = req.body;

        const newRequest = new Request({
            title,
            description,
            cost,
            department,
            requester: req.user.id, // Auth middleware से यूज़र ID प्राप्त करें
            status: 'Pending'
        });

        const request = await newRequest.save();
        res.json(request);

    } catch (err) {
        console.error(err.message);
        // MongoDB validation error (जैसे required field missing)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server error');
    }
});


// server/routes/request.js (GET /api/requests route को अपडेट करें)

router.get('/', auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        let filter = {}; // डिफ़ॉल्ट रूप से कोई फ़िल्टर नहीं (Admin/Approver के लिए)

        // अगर यूज़र कर्मचारी है, तो केवल उसके अनुरोध दिखाएँ
        if (userRole === 'employee') {
            filter = { requester: req.user.id }; // केवल वही अनुरोध दिखाएँ जिसका requester ID वर्तमान यूज़र से मेल खाता हो
        }
        
        // Find requests based on the filter
        const requests = await Request.find(filter)
            .sort({ createdAt: -1})
            .populate('requester', ['name', 'email']); // requester का नाम Populating

        res.json(requests);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   PUT api/requests/:id/status
// @desc    Update Request Status (Approval/Rejection) (Update)
// @access  Private (Require Approver Role - यह logic बाद में role-based auth middleware में आएगा)
router.put('/:id/status', auth,role(['approver', 'admin']), async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // Safety check: केवल Approved, Rejected, या In Review में ही update हो
    if (!['Approved', 'Rejected', 'In Review'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status update value.' });
    }

    try {
        let request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        // Status update करें
        request.status = status;
        
        // यदि approved, तो approval date सेट करें
        if (status === 'Approved') {
            request.approvalDate = Date.now();
        }else if (status === 'Rejected') {
            // यदि Reject हुआ तो approvalDate सेट करने की आवश्यकता नहीं है
        }

        await request.save();
        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/requests/:id
// @desc    Delete a Request (Delete)
// @access  Private (Require Admin Role - यह logic बाद में आएगा)
router.delete('/:id', auth, async (req, res) => {
    try {
        const request = await Request.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        res.json({ msg: 'Request removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;