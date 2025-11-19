const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. ABSOLUTE PATH GENERATE KAREIN
// __dirname = .../server/middleware
// ..        = .../server
// uploads   = .../server/uploads
// 1. DIRECT ROOT PATH (Sabse Safe Tareeka)
// Yeh '/opt/render/project/src/uploads' banayega
const uploadDir = path.join(process.cwd(), 'uploads'); 

console.log("🔧 Multer Configured for:", uploadDir);

// 2. Folder Check & Create
if (!fs.existsSync(uploadDir)) {
    console.log("⚠️ Directory missing. Creating at ROOT:", uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Absolute Path pass karein
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, 'doc-' + uniqueSuffix + '-' + cleanName);
    }
});

const fileFilter = (req, file, cb) => {
    // PDF, Doc, Images allow karein
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only Images, PDF and Docs allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: fileFilter
});

module.exports = upload;