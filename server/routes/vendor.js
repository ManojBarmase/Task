// server/routes/vendor.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vendor = require('../models/Vendor');

// @route   POST api/vendors
// @desc    Add new vendor
// @access  Private
router.post('/', auth, async (req, res) => {
    const { vendorName, productTool, category, 
        contactPerson, contactEmail, phoneNumber, 
        annualSpend, website, notes } = req.body;
    
    try {
        // Simple check for required fields
        if (!vendorName || !productTool || !contactEmail) {
             return res.status(400).json({ msg: 'Please enter all required fields.' });
        }

        const newVendor = new Vendor({
           vendorName,
            productTool,
            category,
            contactPerson, // 👈️ नया फ़ील्ड
            contactEmail,
            phoneNumber,   // 👈️ नया फ़ील्ड
            annualSpend,   // अब यह `initialSpend` के बजाय `annualSpend` के रूप में आएगा
            website,       // 👈️ नया फ़ील्ड
            notes,         // 👈️ नया फ़ील्ड
            addedBy: req.user.id
        });

        const vendor = await newVendor.save();
        res.json(vendor);

    } catch (err) {
        console.error(err.message);
       // Duplicate vendor name/email error handling (अधिक सटीक)
        if (err.code === 11000) {
            let field = err.message.includes('vendorName') ? 'Vendor Name' : 'Contact Email';
            return res.status(400).json({ msg: `${field} already exists.` });
        }
        res.status(500).send('Server error');
    }
});


// @route   GET api/vendors
// @desc    Get all vendors
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Vendors page is generally accessible by everyone to view the directory
        const vendors = await Vendor.find().sort({ dateAdded: -1 });
        res.json(vendors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;