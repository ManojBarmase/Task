const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. ABSOLUTE PATH GENERATE KAREIN
// __dirname = .../server/middleware
// ..        = .../server
// uploads   = .../server/uploads
const uploadDir = path.resolve(__dirname, '..', 'uploads');

console.log("🔧 Middleware Init. Absolute Path:", uploadDir);

// 2. FOLDER CHECK & CREATE
if (!fs.existsSync(uploadDir)) {
    console.log("⚠️ Upload folder missing. Creating at:", uploadDir);
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("✅ Folder Created!");
    } catch (err) {
        console.error("❌ Failed to create folder:", err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 3. LOGGING: Confirm karein ki Multer ko kya path mil raha hai
        console.log("📂 Multer Writing to:", uploadDir);
        
        // Absolute path pass karein
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + cleanName);
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