// server/models/Vendor.js

const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendorName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productTool: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Productivity', 'Communication', 'Project Management', 'Cloud Services', 'Hardware', 'Other', 'CRM','Development','Design Software'],
        default: 'Other'
    },
    contactPerson: { // 👈️ नया फ़ील्ड
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phoneNumber: { // 👈️ नया फ़ील्ड
        type: String,
        trim: true
    },
    annualSpend: {
        type: Number,
        default: 0
    },
    website: { // 👈️ नया फ़ีल्ड
        type: String,
        trim: true
    },
    notes: { // 👈️ नया फ़ील्ड
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 4.0
    },
    complianceStatus: {
        type: String,
        enum: ['Compliant', 'Pending', 'Non-Compliant'],
        default: 'Pending'
    },
    // यह ट्रैक करने के लिए कि वेंडर को किसने जोड़ा
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vendor', VendorSchema);