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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);