// server/models/User.js
const mongoose = require('mongoose'); // 👈 CommonJS syntax

const UserSchema = new mongoose.Schema({
    // 'name' ko 'firstName' aur 'lastName' se replace kiya
    firstName: {
        type: String,
        default: '' 
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'employee',
        enum: ['employee', 'approver', 'admin', 'requester', 'super-admin'] // Saare roles
    },

    // --- NAYI PROFILE FIELDS ---
    phone: {
        type: String,
        default: ''
    },
    jobTitle: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    officeLocation: {
        type: String,
        default: ''
    },
    profileImagePath: { // 👈 Image ke liye
        type: String,
        default: ''
    },
    // -------------------------
    
    // --- Purani profile fields ---
    companyName: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); // 👈 CommonJS syntax



// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     // 'name' ko 'firstName' aur 'lastName' se replace kiya
//     firstName: {
//         type: String,
//         default: '' // 'required: true' ko signup se hata sakte hain agar profile mein update karna hai
//     },
//     lastName: {
//         type: String,
//         default: ''
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         default: 'employee',
//         enum: ['employee', 'approver', 'admin', 'requester', 'super-admin'] // Aapke roles
//     },

//     // --- YEH NAYI FIELDS HAIN (Profile Page se) ---
//     phone: {
//         type: String,
//         default: ''
//     },
//     jobTitle: {
//         type: String,
//         default: ''
//     },
//     department: {
//         type: String,
//         default: ''
//     },
//     officeLocation: {
//         type: String,
//         default: ''
//     },
//     profileImagePath: { // 👈️ Image ke liye
//         type: String,
//         default: ''
//     },
//     // ---------------------------------------------
    
//     // --- Yeh fields aapke purane model se hain ---
//     companyName: {
//         type: String,
//         default: '',
//     },
//     companyAddress: {
//         type: String,
//         default: '',
//     },
//     city: {
//         type: String,
//         default: '',
//     },
//     country: {
//         type: String,
//         default: '',
//     },
//     zipCode: {
//         type: String,
//         default: '',
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model('User', UserSchema);