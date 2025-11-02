// server/models/ApplicationModel.js

const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema({
    // Basic Info
    name: { type: String, required: true, unique: true }, // e.g., 'Asana', 'Slack'
    icon: { type: String, default: '' }, // e.g., 'A', 'S' for icon rendering
     category: { 
        type: String, 
        required: true, 
        enum: ['Marketing', 'Design', 'Project Management', 'Development', 'Productivity', 'Communication', 'Security', 'Finance'],
        default: 'Productivity' 
    }, // NEW FIELD: Category for filtering

    // License Data
    licenses: { type: Number, default: 0 },
    
    // Usage Data
    activeUsers: { type: Number, default: 0 },
    activePercentage: { type: Number, default: 0 }, // Calculated value (activeUsers / licenses * 100)
    
    // Engagement Segments (Usage over time)
    noUsage: { type: Number, default: 0 }, // Percentage of users (Never logged in / >30 days)
    lowUsage: { type: Number, default: 0 }, // Percentage of users (16-30 days ago)
    mediumUsage: { type: Number, default: 0 }, // Percentage of users (4-15 days ago)
    highUsage: { type: Number, default: 0 }, // Percentage of users (0-3 days ago)

}, {
    timestamps: true,
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;