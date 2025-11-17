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
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .png, or .jpg files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload; // 👈 CommonJS syntax