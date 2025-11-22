const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 👇 YEH LINE BADLEIN (Sabse Zaroori)
// __dirname = server/middleware
// ../..     = Root Folder
// Result    = Root/uploads
const uploadDir = path.join(__dirname, '../../uploads'); 

console.log("🔧 Middleware Target:", uploadDir);

// Folder Check & Create
if (!fs.existsSync(uploadDir)) {
    console.log("⚠️ Root Uploads folder missing. Creating...");
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, 'doc-' + uniqueSuffix + '-' + cleanName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv', // .csv
        'text/plain' // .txt
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 15 },
    fileFilter: fileFilter
});

module.exports = upload;