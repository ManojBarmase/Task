 // server/models/Request.js

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { // Request Intake Form से आएगा
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'],
        required: true
    },
    vendorName: { 
        type: String,
        required: false, // इसे वैकल्पिक (optional) रखें
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Clarification Needed','In Review', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    // 👇️ NEW FIELD 1: Admin/Approver Notes (For Reviewer to send back questions/comments)
    reviewerNotes: {
        type: String,
        default: ''
    },
    // 👇️ NEW FIELD 2: Employee Response to Notes
    requesterReply: {
        type: String,
        default: ''
    },
    requester: { // किस यूज़र ने यह अनुरोध बनाया
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvalDate: { // अप्रूवल की तारीख
        type: Date 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request', RequestSchema);