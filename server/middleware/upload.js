const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 👈 1. fs module import karein

// 1. Absolute Path Banayein (server/uploads)
// __dirname = .../project/server/middleware
// ../uploads = .../project/server/uploads
const uploadDir = path.resolve(__dirname, '../uploads');

// 2. Folder Check & Create Logic (Recursive)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created Absolute Uploads Directory at:', uploadDir);
}

// 1. Kahaan aur kis naam se file save karni hai
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 'uploads/' folder mein save karein
        // __dirname -> current folder (middleware)
        // ../uploads -> root ka uploads folder
        cb(null, uploadDir);
        // cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       // Space hata kar clean naam banayein
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + cleanName);
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