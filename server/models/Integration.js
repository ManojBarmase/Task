const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['Connected', 'Available', 'Coming Soon'],
        default: 'Available' 
    },
    syncDate: { type: Date },
    syncFrequency: { type: String },
    icon: { type: String }, // Emoji or icon name
    isHR: { type: Boolean, default: false },
    
    // Configuration Details (Optional - jab user connect karega)
    clientId: { type: String },
    clientSecret: { type: String }, // In real app, encrypt this!
    apiKey: { type: String }
});

module.exports = mongoose.model('Integration', IntegrationSchema);