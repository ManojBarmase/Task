// server/routes/contract.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contract = require('../models/Contract');
const Vendor = require('../models/Vendor'); // Vendor model is needed to link contracts

// @route   POST api/contracts
// @desc    Add new contract
// @access  Private
router.post('/', auth, async (req, res) => {
    const { vendorId, contractTitle, start_date, end_date, contractValue, renewalStatus, termsLink } = req.body;
    
    try {
        // Validation
        if (!vendorId || !contractTitle || !start_date || !end_date || !contractValue) {
             return res.status(400).json({ msg: 'Please enter all required contract fields.' });
        }
        
        // Check if Vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ msg: 'Vendor not found.' });
        }

        const newContract = new Contract({
            vendor: vendorId, // Use vendorId to link
            contractTitle,
            start_date,
            end_date,
            contractValue,
            renewalStatus,
            termsLink,
            addedBy: req.user.id
        });

        const contract = await newContract.save();
        res.json(contract);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   GET api/contracts
// @desc    Get all contracts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Fetch contracts and populate the vendor details for display
        const contracts = await Contract.find()
            .sort({ end_date: 1 }) // Soonest expiring first
            // Populating vendor details to show Vendor Name/Product
            .populate('vendor', ['vendorName', 'productTool']); 
            
        res.json(contracts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/contracts/:id
// @desc    Update a contract (for renewal)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { start_date, end_date, contractValue, renewalStatus, lastRenewed } = req.body;
    
    try {
        let contract = await Contract.findById(req.params.id);

        if (!contract) return res.status(404).json({ msg: 'Contract not found' });

        // Build the update object
        const contractFields = {};
        if (start_date) contractFields.start_date = start_date; // New Contract Start Date
        if (end_date) contractFields.end_date = end_date;       // New Contract End Date
        if (contractValue !== undefined) contractFields.contractValue = contractValue;
        if (renewalStatus) contractFields.renewalStatus = renewalStatus;
        if (lastRenewed) contractFields.lastRenewed = lastRenewed;

        // Update and save
        contract = await Contract.findByIdAndUpdate(
            req.params.id,
            { $set: contractFields },
            { new: true } // Return the updated document
        ).populate('vendor', ['vendorName', 'productTool']); // Populate vendor data for the frontend update

        res.json(contract);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;