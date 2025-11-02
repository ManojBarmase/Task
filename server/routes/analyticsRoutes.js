// server/routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const Application = require('../models/ApplicationModel');

// @desc    Get all application usage data (for charts and tables)
// @route   GET /api/analytics/usage
// @access  Public (or Private for a real app)
router.get('/usage', async (req, res) => {
    try {
        const usageData = await Application.find({});
        res.json(usageData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching usage data', error: error.message });
    }
});

// @desc    Get aggregated metrics (for top metric cards)
// @route   GET /api/analytics/metrics
// @access  Public
router.get('/metrics', async (req, res) => {
    try {
        // Aggregate to calculate metrics
        const totalLicenses = await Application.aggregate([
            { $group: { _id: null, total: { $sum: '$licenses' } } }
        ]);
        
        // Simple counts/filters (Mocking for now, real filters needed later)
        const totalApplications = await Application.countDocuments();
        
        // Find high/underutilized apps
        const highEngagementApps = await Application.countDocuments({ activePercentage: { $gte: 50 } });
        const underutilizedApps = await Application.countDocuments({ activePercentage: { $lt: 20 } }); // Adjust threshold as needed
        
        res.json({
            totalApplications: { value: totalApplications, unit: 'Active', subtext: 'Being monitored' },
            totalLicenses: { value: totalLicenses[0]?.total || 0, unit: '', subtext: 'Across all applications' },
            highEngagementApps: { value: highEngagementApps, unit: '↗', subtext: 'With 50%+ active usage' },
            underutilizedApps: { value: underutilizedApps, unit: '↘', subtext: 'Potential cost savings' },
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching metrics', error: error.message });
    }
});

// @desc    Get AI-driven recommendations (Mock data for now)
// @route   GET /api/analytics/recommendations
// @access  Public
router.get('/recommendations', async (req, res) => {
    // Mock recommendations data to satisfy the frontend call and prevent 404
    const mockRecommendations = [
        { id: 1, title: 'Consolidate Design Tools', summary: 'Identify duplicate design licenses (e.g., Figma & Sketch) across teams for potential savings.' },
        { id: 2, title: 'Review Underutilized Licenses', summary: 'Check usage data for applications with <20% active users to reclaim licenses.' },
        { id: 3, title: 'Address Shadow IT Risks', summary: 'Investigate recent spikes in new, unapproved communication apps (e.g., WhatsApp Desktop).' },
    ];
    res.json(mockRecommendations);
});


// 👇️ NEW: Shadow IT Detection Route
router.get('/shadow-it', async (req, res) => {
    try {
        // Find applications where isApproved is explicitly false (Shadow IT)
        const shadowITApps = await Application.find({ isApproved: false }).lean(); 
        
        // Return only the necessary fields
        const data = shadowITApps.map(app => ({
            id: app.id,
            name: app.name,
            icon: app.icon,
            department: app.department,
            usersCount: app.usersCount,
            costEstimate: app.costEstimate,
            riskLevel: app.riskLevel,
        }));

        res.json(data);
    } catch (err) {
        console.error('Error fetching Shadow IT data:', err);
        // Server-side error logging
        res.status(500).json({ error: 'Failed to fetch Shadow IT data' });
    }
});
// 👆️ END NEW ROUTE

module.exports = router;