 // server/routes/dashboard.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');

// @route   GET api/dashboard/metrics
// @desc    Get dashboard metrics (cards data)
// @access  Private
router.get('/metrics', auth, async (req, res) => {
    try {
        // A. Pending Requests Count
        const pendingRequests = await Request.countDocuments({ status: 'Pending' });

        // B. Total Spend (सभी Approved Requests का कुल cost)
        const totalSpendResult = await Request.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { 
                _id: null, 
                totalCost: { $sum: '$cost' } 
            }}
        ]);
        const totalSpend = totalSpendResult.length > 0 ? totalSpendResult[0].totalCost : 0;

        // C. Upcoming Renewals (पिछले 30 दिनों में Approved) - यह एक अनुमानित metric है
        // वास्तविक Renewal logic में 'renewal_date' फ़ील्ड की आवश्यकता होगी, 
        // लेकिन सरलता के लिए हम पिछले 30 दिनों में Approved Requests की संख्या का उपयोग करेंगे।
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const upcomingRenewals = await Request.countDocuments({ 
            approvalDate: { $gte: thirtyDaysAgo } 
        });

        // D. Vendors in Review (मान लेते हैं कि यह 'In Review' Requests के बराबर है)
        const vendorsInReview = await Request.countDocuments({ status: 'In Review' });
        
        res.json({
            pendingRequests: pendingRequests,
            upcomingRenewals: upcomingRenewals,
            totalSpend: totalSpend,
            vendorsInReview: vendorsInReview
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;