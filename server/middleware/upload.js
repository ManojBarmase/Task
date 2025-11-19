const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Path Logic (Wahi jo server.js mein kaam kar raha hai)
const uploadDir = path.join(process.cwd(), 'server', 'uploads');

// 2. Debug Log (Taaki hum confirm karein ki file load hui)
console.log("🔧 Middleware Loaded.");
console.log("   👉 Target Directory:", uploadDir);

// 3. Folder Check
if (!fs.existsSync(uploadDir)) {
    console.log("   ⚠️ Directory missing inside middleware. Creating...");
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 4. Debug Log (Har upload par dikhega)
        console.log("📂 Multer Saving File to:", uploadDir);
        
        // Absolute Path Pass karein
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + cleanName);
    }
});

const fileFilter = (req, file, cb) => {
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