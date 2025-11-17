// server/routes/request.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Auth middleware
const Request = require('../models/Request');
const role = require('../middleware/role');

// @route   POST api/requests
// @desc    Create a new Purchase Request (Create)
// @access  Private
// ⭐ (कोई बदलाव नहीं - यह सही है)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, cost, department, vendorName } = req.body;

        const newRequest = new Request({
            title,
            description,
            cost,
            department,
            vendorName: vendorName || '',
            requester: req.user.id, // Auth middleware से यूज़र ID प्राप्त करें
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


// @route   GET api/requests
// @desc    Get all requests (filtered by role)
// @access  Private
// ⭐ (कोई बदलाव नहीं - यह सही है)
router.get('/', auth, async (req, res) => {
    try {
        // 1. Query Parameters से फ़िल्टर वैल्यू प्राप्त करें
        const { department, status, minCost, maxCost } = req.query;
        const userRole = req.user.role;
        let filter = {}; // MongoDB query filter object

        // 2. Department Filter
        if (department && department !== 'All Departments') {
            filter.department = department;
        }

        // 3. Status Filter
        if (status && status !== 'All Statuses') {
            filter.status = status;
        }

        // 4. Cost Range Filter (हमेशा लागू करें, क्योंकि minCost/maxCost हमेशा भेजे जाते हैं)
        const minC = parseFloat(minCost);
        const maxC = parseFloat(maxCost);

        if (!isNaN(minC) && !isNaN(maxC)) {
            // यदि min/max 0/बड़ी संख्या नहीं है, तो cost filter जोड़ें
            if (minC > 0 || maxC < 9999999) {
                 filter.cost = { $gte: minC, $lte: maxC }; 
            }
        }
        
        // ⭐ FIX: Employee के लिए Requester फ़िल्टर जोड़ें (ओवरराइट न करें!)
        if (userRole === 'employee') {
            // मौजूदा filters (department, status, cost) को रखते हुए requester ID जोड़ें
            filter.requester = req.user.id;
        }
        
        // Find requests based on the combined filter
        const requests = await Request.find(filter)
            .sort({ createdAt: -1})
            .populate('requester', ['name', 'email']); // requester का नाम Populating

        res.json(requests);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   GET api/requests/:id
// @desc    Get a single request by its ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('requester', ['name', 'email', 'department']); // रिक्वेस्टर की जानकारी भी लाएं

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        // (सुरक्षा जांच - क्या यह कर्मचारी सिर्फ अपनी रिक्वेस्ट देख सकता है?)
        if (req.user.role === 'employee' && request.requester._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to view this request' });
        }
        
        res.json(request);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Request not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/requests/:id
// @desc    Employee edits their own request
// @access  Private (Employee only)
router.put('/:id', auth, role(['employee']), async (req, res) => {
    const { title, description, cost, department, vendorName } = req.body;
    
    try {
        let request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        // 1. सुरक्षा जांच: क्या यह वही कर्मचारी है जिसने इसे बनाया है?
        if (request.requester.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // 2. लॉजिक जांच: क्या रिक्वेस्ट अभी भी 'Pending' है?
        if (request.status !== 'Pending') {
            return res.status(400).json({ msg: 'Cannot edit a request that is already under review.' });
        }

        // 3. अपडेट करें
        const updatedFields = {
            title,
            description,
            cost: parseFloat(cost) || 0,
            department,
            vendorName: vendorName || ''
        };

        request = await Request.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true }
        ).populate('requester', ['name', 'email']); // फ्रंटएंड को अपडेटेड डेटा भेजें

        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/requests/:id/status
// @desc    Approve or Reject a Request (Final Decision)
// @access  Private (Approver/Admin)
router.put('/:id/status', auth, role(['approver', 'admin']), async (req, res) => {
    const { status } = req.body; // status must be 'Approved' or 'Rejected'
    const { id } = req.params;

    // 👇️ CHANGED: सेफ्टी चेक को केवल 'Approved' और 'Rejected' के लिए सीमित किया गया
    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status update. Must be Approved or Rejected.' });
    }
    // 👆️ END CHANGE

    try {
        let request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        // 👇️ CHANGED: अप्रूवल केवल Pending या In Review रिक्वेस्ट पर ही हो सकता है
        if (request.status !== 'Pending' && request.status !== 'In Review') {
            return res.status(400).json({ msg: `Cannot approve/reject a request with status '${request.status}'` });
        }
        // 👆️ END CHANGE

        // Status update करें
        request.status = status;
        
        // यदि approved, तो approval date सेट करें
        if (status === 'Approved') {
            request.approvalDate = Date.now();
        } else if (status === 'Rejected') {
            // (Approval date को null ही रहने दें)
        }

        await request.save();
        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/requests/:id
// @desc    Delete a Request
// @access  Private (Admin)
// ⭐ (कोई बदलाव नहीं - यह सही है)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
    try {
        // (हम कर्मचारी को भी उसकी Pending रिक्वेस्ट डिलीट करने की अनुमति दे सकते हैं,
        //  लेकिन अभी के लिए इसे Admin-only रखते हैं)
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


// 👇️ CHANGED: इस राउट का नाम बदला गया (review -> clarify) और लॉजिक बदला गया
// @route   PUT api/requests/:id/clarify
// @desc    Admin/Approver adds Notes and sets status to 'Clarification Needed'
// @access  Private (Approver/Admin Role)
router.put('/:id/clarify', auth, role(['approver', 'admin']), async (req, res) => {
    const { reviewerNotes } = req.body;
    const { id } = req.params;

    if (!reviewerNotes) {
        return res.status(400).json({ msg: 'Notes are required to request clarification.' });
    }

    try {
        let request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }
        
        // एडमिन 'Pending' (पहली बार) या 'In Review' (जवाब के बाद) रिक्वेस्ट पर स्पष्टीकरण मांग सकता है
        if (request.status !== 'Pending' && request.status !== 'In Review') {
             return res.status(400).json({ msg: `Cannot request clarification for a request that is '${request.status}'.` });
        }

        // Status 'Clarification Needed' पर अपडेट करें
        request.status = 'Clarification Needed';
        // Reviewer/Admin Notes जोड़ें
        request.reviewerNotes = reviewerNotes;
        // कर्मचारी के पिछले जवाब को साफ़ करें (ताकि बातचीत का थ्रेड साफ़ रहे)
        request.requesterReply = '';
        
        await request.save();
        
        // Requester details को populate करके response में भेजें
        await request.populate('requester', ['name', 'email']); 

        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// 👆️ END CHANGE


// 👇️ CHANGED: इस राउट का लॉजिक बदला गया
// @route   PUT api/requests/:id/reply
// @desc    Employee replies to reviewer notes and sets status to 'In Review'
// @access  Private (Employee Role)
router.put('/:id/reply', auth, role(['employee']), async (req, res) => {
    const { requesterReply } = req.body;
    const { id } = req.params;

    if (!requesterReply) {
        return res.status(400).json({ msg: 'Reply text is required.' });
    }

    try {
        let request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }
        
        // सुनिश्चित करें कि कर्मचारी केवल अपनी ही रिक्वेस्ट का जवाब दे रहा है
        if (request.requester.toString() !== req.user.id) {
             return res.status(401).json({ msg: 'Not authorized to reply to this request' });
        }
        
        // केवल 'Clarification Needed' रिक्वेस्ट का ही जवाब दिया जा सकता है
        if (request.status !== 'Clarification Needed') {
             return res.status(400).json({ msg: `Cannot reply to request in '${request.status}' status.` });
        }

        // Requester Reply जोड़ें
        request.requesterReply = requesterReply;
        // Status 'In Review' पर सेट करें, ताकि Approver को पता चले कि इसे फिर से देखना है
        request.status = 'In Review'; 
        
        await request.save();
        res.json(request);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// 👆️ END CHANGE

module.exports = router;