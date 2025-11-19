const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vendor = require('../models/Vendor');
// 👇 YAHAN CHANGE HAI: Local Multer hata kar Central Middleware import karein
const upload = require('../middleware/upload'); 

// @route   POST api/vendors
// @desc    Add a new vendor
router.post('/', [auth, upload.single('document')], async (req, res) => {
    try {
        let vendorData = { ...req.body };

        // JSON Parsing (Address & Contact)
        try {
            if (typeof vendorData.billingAddress === 'string') {
                vendorData.billingAddress = JSON.parse(vendorData.billingAddress);
            }
            if (typeof vendorData.companyAddress === 'string') {
                vendorData.companyAddress = JSON.parse(vendorData.companyAddress);
            }
            if (typeof vendorData.primaryContact === 'string') {
                vendorData.primaryContact = JSON.parse(vendorData.primaryContact);
            }
        } catch (parseError) {
            return res.status(400).json({ msg: "Invalid address format" });
        }

        // 🛠️ FIX: File Path Handling
        if (req.file) {
            // Hum database mein 'uploads/filename.ext' save karenge
            vendorData.documentPath = `uploads/${req.file.filename}`;
        }

        // User ID Set Karein
        vendorData.addedBy = req.user.id;

        const newVendor = new Vendor(vendorData);
        const vendor = await newVendor.save();

        res.json(vendor);

    } catch (err) {
        console.error("Server Error:", err.message);
        // Duplicate Key Error Handling
        if (err.code === 11000) {
             let field = err.message.includes('vendorName') ? 'Vendor Name' : 'Contact Email';
             return res.status(400).json({ msg: `${field} already exists.` });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/vendors
// @desc    Get all vendors
router.get('/', auth, async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ dateAdded: -1 });
        res.json(vendors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/vendors/:id
// @desc    Get Single Vendor by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }

        res.json(vendor);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Vendor not found (invalid ID)' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;