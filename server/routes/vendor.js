// server/routes/vendor.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const multer = require('multer'); // 👇️ Import multer
const path = require('path'); // Node.js built-in module

// --- MULTER SETUP START ---
// Storage configuration: Saves files to the 'uploads' folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // सुनिश्चित करें कि यह 'uploads' फ़ोल्डर मौजूद है या Nodemon द्वारा बनाया गया है
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // फ़ाइल का नाम: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (Optional: allow only specific file types)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.includes('document')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type!'), false);
    }
};

// Multer upload instance
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: fileFilter 
});
// --- MULTER SETUP END ---

// @route   POST api/vendors
// @desc    Add new vendor
// @access  Private
// router.post('/', auth,upload.single('document'), async (req, res) => {
//     const { vendorName, productTool, category, 
//         contactPerson, contactEmail, phoneNumber, 
//         annualSpend, registeredId, 
//         billingCountry, billingAddress, billingCity, billingZip,
//        companyCountry, companyAddress, companyCity, companyZip,website, notes } = req.body;
    
//     try {
//         // Simple check for required fields
//         if (!vendorName || !productTool || !contactEmail) {
//              return res.status(400).json({ msg: 'Please enter all required fields.' });
//         }
       
//         // 1. Address Objects को व्यवस्थित करें
//         const newBillingAddress = {
//             country: billingCountry,
//             address: billingAddress,
//             city: billingCity,
//             zip: billingZip
//         };

//         const newCompanyAddress = {
//             country: companyCountry,
//             address: companyAddress,
//             city: companyCity,
//             zip: companyZip
//         };

//         // 2. फ़ाइल पाथ प्राप्त करें
//         const documentPath = req.file ? req.file.path : null;

//         // 3. नया Vendor ऑब्जेक्ट बनाएं
//         const newVendor = new Vendor({
//            vendorName,
//             productTool,
//             category,
//             contactPerson, // 👈️ नया फ़ील्ड
//             contactEmail,
//             phoneNumber,   // 👈️ नया फ़ील्ड
//             annualSpend,   // अब यह `initialSpend` के बजाय `annualSpend` के रूप में आएगा
//             billingAddress: newBillingAddress, // नया
//             companyAddress: newCompanyAddress, // नया
//             // 👇️ NEW FIELD: documentPath
//             documentPath: documentPath,
//             addedBy: req.user.id, // auth middleware से user ID
//             website,       // 👈️ नया फ़ील्ड
//             notes,         // 👈️ नया फ़ील्ड
//             addedBy: req.user.id
//         });
//         // 4. डेटाबेस में सेव करें
//         const vendor = await newVendor.save();
//         // res.json(vendor);
//         res.status(201).json(vendor);

//     } catch (err) {
//         console.error(err.message);
//         // Multer error handling
//         if (err instanceof multer.MulterError) {
//              return res.status(400).json({ msg: `Multer Error: ${err.message}` });
//         }
//         if (err.message === 'Unsupported file type!') {
//             return res.status(400).json({ msg: 'File type not supported. Please upload a PDF, DOC, or image.' });
//         }
//        // Duplicate vendor name/email error handling (अधिक सटीक)
//         if (err.code === 11000) {
//             let field = err.message.includes('vendorName') ? 'Vendor Name' : 'Contact Email';
//             return res.status(400).json({ msg: `${field} already exists.` });
//         }
//         res.status(500).send('Server error');
//     }
// });
// @route   POST api/vendors
// @desc    Add a new vendor
router.post('/', [auth, upload.single('document')], async (req, res) => {
    try {
        // 1. req.body ki copy banayein
        let vendorData = { ...req.body };

        // 2. 🛠️ JSON STRING PARSING (Yeh "Cast to string" error fix karega)
        // Agar address/contact string format mein aaye hain, toh unhein wapas Object banayein
        if (typeof vendorData.billingAddress === 'string') {
            vendorData.billingAddress = JSON.parse(vendorData.billingAddress);
        }
        if (typeof vendorData.companyAddress === 'string') {
            vendorData.companyAddress = JSON.parse(vendorData.companyAddress);
        }
        if (typeof vendorData.primaryContact === 'string') {
            vendorData.primaryContact = JSON.parse(vendorData.primaryContact);
        }

        // 3. Document path set karein (agar file upload hui hai)
        if (req.file) {
            vendorData.documentPath = req.file.path;
        }

        // 4. Added By User ID set karein
        vendorData.addedBy = req.user.id;

        // 5. Vendor Save Karein
        const newVendor = new Vendor(vendorData);
        const vendor = await newVendor.save();

        res.json(vendor);

    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(500).send('Server Error');
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

// 2. 👇 YEH NAYA ROUTE ADD KAREIN (Get Single Vendor by ID)
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