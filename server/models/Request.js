//  // server/models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { // Business Justification
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        // Agar aapne form me naye departments add kiye hain (Engineering, Sales), to unhe yahan bhi add karein
        enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D', 'Engineering', 'Sales'],
        required: true
    },
    
    // 👇 CHANGE 1: Vendor ko Dynamic Link banaya (String ki jagah ObjectId)
    vendor: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor', // Yeh 'Vendor' model se connect karega
        required: false, // User bina vendor select kiye bhi request bhej sakta hai
        default: null
    },

    // 2. 👇 NEW: Proposed Vendor (Agar employee naya vendor suggest kar rha hai)
    isNewVendor: { type: Boolean, default: false },
    proposedVendor: {
        vendorName: { type: String, trim: true },
        website: { type: String, trim: true },
        contactEmail: { type: String, trim: true }
    },

    // 👇 CHANGE 2: New Budget Fields (Form Step 4 ke liye)
    costPerLicense: {
        type: Number,
        default: 0
    },
    numLicenses: {
        type: Number,
        default: 0
    },

    // 👇 CHANGE 3: Attachments (Future use ke liye)
    attachments: [{
        type: String // File paths store karne ke liye
    }],

    status: {
        type: String,
        enum: ['Pending', 'Clarification Needed', 'In Review', 'Approved', 'Rejected', 'Withdrawn'],
        default: 'Pending'
    },
    
    // Reviewer communication fields
    reviewerNotes: {
        type: String,
        default: ''
    },
    requesterReply: {
        type: String,
        default: ''
    },
    
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    approvalDate: {
        type: Date 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request', RequestSchema);



// const mongoose = require('mongoose');

// const RequestSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     description: { // Request Intake Form से आएगा
//         type: String,
//         required: true
//     },
//     cost: {
//         type: Number,
//         required: true
//     },
//     department: {
//         type: String,
//         enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'],
//         required: true
//     },
//     vendorName: { 
//         type: String,
//         required: false, // इसे वैकल्पिक (optional) रखें
//         default: ''
//     },
//     status: {
//         type: String,
//         enum: ['Pending', 'Clarification Needed','In Review', 'Approved', 'Rejected'],
//         default: 'Pending'
//     },
//     // 👇️ NEW FIELD 1: Admin/Approver Notes (For Reviewer to send back questions/comments)
//     reviewerNotes: {
//         type: String,
//         default: ''
//     },
//     // 👇️ NEW FIELD 2: Employee Response to Notes
//     requesterReply: {
//         type: String,
//         default: ''
//     },
//     requester: { // किस यूज़र ने यह अनुरोध बनाया
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     approvalDate: { // अप्रूवल की तारीख
//         type: Date 
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model('Request', RequestSchema);