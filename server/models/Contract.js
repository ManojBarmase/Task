// server/models/Contract.js

const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor', // Vendor Model से लिंक करें
        required: true
    },
    contractTitle: {
        type: String,
        required: true,
        trim: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    contractValue: {
        type: Number,
        required: true
    },
    renewalStatus: {
        type: String,
        enum: ['Auto-Renew', 'Manual Review', 'Pending', 'Cancelled'],
        default: 'Pending'
    },
    paymentFrequency: { type: String, default: 'Monthly' },

    // Contract Specific Contact (Overrrides Vendor Contact)
    contactPerson: { type: String, trim: true },
    // File Path
    documentPath: { type: String },
    lastRenewed: {
        type: Date,
        default: Date.now
    },
    // Optional fields for tracking
    termsLink: {
        type: String,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);