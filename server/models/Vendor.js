// server/models/Vendor.js

const mongoose = require('mongoose');

// Address Sub-schema (Billing और Company Address दोनों के लिए इसका उपयोग करेंगे)
const AddressSchema = new mongoose.Schema({
    country: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true }
}, { _id: false }); // _id: false इसे स्वतंत्र MongoDB ID देने से रोकता है

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
    // 👇️ NEW FIELD: Company Registered ID
    registeredId: {
        type: String,
        trim: true
    },
    
    // 👇️ NEW FIELD: Billing Address (using AddressSchema)
    billingAddress: AddressSchema,
    // 👇️ NEW FIELD: Company Address (using AddressSchema)
    companyAddress: AddressSchema,
    // NEW FIELD: Path to the uploaded document on the server
    documentPath: {
        type: String,
        required: false // Document is optional
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