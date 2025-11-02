const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    details: {
        type: String,
        required: true,
        trim: true,
    },
    iconType: {
        type: String,
        required: true,
        enum: ['save', 'boost', 'consolidate'] // Seed data में उपयोग किए गए types
    },
}, {
    timestamps: true,
    collection: 'recommendations'
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
