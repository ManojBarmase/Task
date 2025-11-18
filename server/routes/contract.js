// server/routes/contract.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contract = require('../models/Contract');
const upload = require('../middleware/upload');
const Vendor = require('../models/Vendor'); // Vendor model is needed to link contracts


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

// 2. 👇 YEH NAYA ROUTE ADD KAREIN (Get Single Contract by ID)
router.get('/:id', auth, async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('vendor', 'vendorName contactName contactEmail phone'); // 👈 Vendor ki zaroori details populate karein

        if (!contract) {
            return res.status(404).json({ msg: 'Contract not found' });
        }

        res.json(contract);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Contract not found (invalid ID)' });
        }
        res.status(500).send('Server Error');
    }
});



// @route   POST api/contracts
// @desc    Add new contract
// @access  Private
router.post('/', [auth, upload.single('document')], async (req, res) => {   
    try {
        // Agar req.body undefined hai, toh Multer nahi chala
        if (!req.body) {
            return res.status(400).json({ msg: 'No data received. Ensure Multer is working.' });
        }
         const { vendorId, contractTitle, start_date, end_date, contractValue, renewalStatus, termsLink, paymentFrequency, contactPerson } = req.body;
        // Validation
        if (!vendorId || !contractTitle || !start_date || !end_date || !contractValue) {
             return res.status(400).json({ msg: 'Please enter all required contract fields.' });
        }
        
        // Check if Vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ msg: 'Vendor not found.' });
        }

        const contractData = new Contract({
            vendor: vendorId, // Use vendorId to link
            contractTitle,
            start_date,
            end_date,
            contractValue,
            renewalStatus,
            termsLink,
            addedBy: req.user.id,
            paymentFrequency,
            contactPerson
        });
  
        // 👈 Saving File Path
       if (req.file) {
            // Purana Code: contractData.documentPath = req.file.path; 
            
            // Naya Code: Clean relative path banayein
            // Yeh 'uploads/filename.pdf' save karega jo browser samajh sakta hai
            contractData.documentPath = `uploads/${req.file.filename}`; 
        }

        const newContract = new Contract(contractData);
        const contract = await newContract.save();
        res.json(contract);

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