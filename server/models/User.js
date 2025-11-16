 // server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // सुनिश्चित करें कि हर email unique हो
    },
    password: {
        type: String,
        required: true
    },
   role: { // <-- नया फ़ील्ड
        type: String,
        default: 'employee',
        enum: ['employee', 'approver', 'admin']
    },
    // 👈️ प्रोफ़ाइल फ़ील्ड्स: पहली बार खाली रहेंगे
    companyName: {
        type: String,
        default: '', 
    },
    companyAddress: {
        type: String,
        default: '',
    },
    city: { // 👈️ नया 'city' फ़ील्ड जोड़ा गया
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    zipCode: {
        type: String,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);