const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Integration = require('../models/Integration');

// --- DATA TO SEED (Initial Data) ---
const initialIntegrations = [
    {
        name: 'Coupa ERP',
        category: 'ERP Systems',
        description: 'Sync contracts, purchase orders, and vendor data',
        status: 'Connected',
        syncDate: new Date('2025-01-15'),
        syncFrequency: 'Real-time',
        icon: '🔗',
        isHR: false,
    },
    {
        name: 'NetSuite ERP',
        category: 'ERP Systems',
        description: 'Enterprise resource planning and contract management',
        status: 'Connected',
        syncDate: new Date('2025-02-03'),
        syncFrequency: 'Every 6 hours',
        icon: '🏢',
        isHR: false,
    },
    {
        name: 'NetSuite Finance',
        category: 'Finance',
        description: 'Financial management and accounting integration',
        status: 'Available',
        icon: '💰',
        isHR: false,
    },
    {
        name: 'QuickBooks',
        category: 'Accounting',
        description: 'Accounting software for contract invoicing',
        status: 'Connected',
        syncDate: new Date('2024-12-12'),
        syncFrequency: 'Daily',
        icon: '📊',
        isHR: false,
    },
    {
        name: 'QuickBooks Finance',
        category: 'Finance',
        description: 'Advanced financial reporting and analytics',
        status: 'Available',
        icon: '📈',
        isHR: false,
    },
    {
        name: 'Sage Intacct',
        category: 'Accounting',
        description: 'Cloud financial management software',
        status: 'Available',
        icon: '☁️',
        isHR: false,
    },
    {
        name: 'BambooHR',
        category: 'HRMS',
        description: 'HR software for employee data and onboarding',
        status: 'Connected',
        syncDate: new Date('2025-02-01'),
        syncFrequency: 'Daily',
        icon: '🌿',
        isHR: true,
    },
    {
        name: 'Hibob',
        category: 'HRMS',
        description: 'Modern HRIS for employee management',
        status: 'Available',
        icon: '🧑‍🤝‍🧑',
        isHR: true,
    },
    {
        name: 'Workday',
        category: 'HRMS',
        description: 'Enterprise cloud platform for HR and finance',
        status: 'Available',
        icon: '💼',
        isHR: true,
    },
    {
        name: 'ADP Workforce',
        category: 'HRMS',
        description: 'Payroll and HR management system',
        status: 'Available',
        icon: '🔴',
        isHR: true,
    },
    {
        name: 'Namely',
        category: 'HRMS',
        description: 'All-in-one HR platform for mid-sized companies',
        status: 'Coming Soon',
        icon: '🟦',
        isHR: true,
    },
    {
        name: 'Gusto',
        category: 'HRMS',
        description: 'Payroll, benefits, and HR for small businesses',
        status: 'Available',
        icon: '🟣',
        isHR: true,
    },
    {
        name: 'Salesforce CRM',
        category: 'CRM',
        description: 'Customer Relationship Management',
        status: 'Available',
        icon: '☁️',
        isHR: false,
    },
    {
        name: 'Okta SSO',
        category: 'SSO',
        description: 'Single Sign-On authentication',
        status: 'Available',
        icon: '🔑',
        isHR: false,
    },
];

// @route   GET api/integrations
// @desc    Get all integrations
router.get('/', auth, async (req, res) => {
    try {
        const integrations = await Integration.find();
        res.json(integrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/integrations/:id/connect
// @desc    Connect (Update Status)
router.put('/:id/connect', auth, async (req, res) => {
    try {
        const { status, syncFrequency, clientId, apiKey } = req.body;

        const updatedIntegration = await Integration.findByIdAndUpdate(
            req.params.id,
            { 
                status, 
                syncFrequency, 
                syncDate: new Date(), 
                clientId, 
                apiKey 
            },
            { new: true }
        );

        res.json(updatedIntegration);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 👇👇 NEW SEED ROUTE (Run this once to populate DB) 👇👇
// @route   GET api/integrations/seed
// @desc    Seed database with initial integrations
router.get('/seed', async (req, res) => {
    try {
        // 1. Clear existing data (Optional, taki duplicate na ho)
        await Integration.deleteMany({});
        
        // 2. Insert new data
        await Integration.insertMany(initialIntegrations);
        
        res.json({ msg: 'Integrations Seeded Successfully!', count: initialIntegrations.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;