const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Bulletproof Path Logic (Root se calculate karein)
// process.cwd() = Project Root
// Path banega: ProjectRoot/server/uploads
const uploadDir = path.join(process.cwd(), 'server', 'uploads');

// 2. Debugging Log (Taaki humein Render logs mein path dikhe)
console.log("📂 Upload Directory Target:", uploadDir);

// 3. Folder Create Logic
if (!fs.existsSync(uploadDir)) {
    console.log("⚠️ Folder missing. Creating now...");
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Folder Created Successfully!");
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 4. Multer ko ye Absolute Path dein
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Space hata kar safe naam banayein
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
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    fileFilter: fileFilter
});

module.exports = upload;