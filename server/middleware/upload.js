const multer = require('multer');
const path = require('path');

// 1. Kahaan aur kis naam se file save karni hai
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 'uploads/' folder mein save karein
        // __dirname -> current folder (middleware)
        // ../uploads -> root ka uploads folder
        cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Sirf image files ko allow karein
// 👇 IS 'fileFilter' KO REPLACE KAREIN 👇
const fileFilter = (req, file, cb) => {
    // Allowed file types: Images + PDF + Word Docs
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'application/pdf', // 👈 PDF ke liye zaroori
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, PDF, DOC, and DOCX are allowed!'), false); // Reject file
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload; // 👈 CommonJS syntax