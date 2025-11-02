// server/seedData.js
const Application = require('./models/ApplicationModel');
const Recommendation = require('./models/RecommendationModel');

// Sample Application data with the new 'category' field
const applications = [
    { 
        name: 'Slack', 
        icon: 'S', 
        category: 'Communication', 
        licenses: 350, 
        activeUsers: 263, 
        activePercentage: 75, 
        noUsage: 10, 
        lowUsage: 5, 
        mediumUsage: 10, 
        highUsage: 75 
    },
    { 
        name: 'Dashlane', 
        icon: 'D', 
        category: 'Security', 
        licenses: 350, 
        activeUsers: 199, 
        activePercentage: 57, 
        noUsage: 20, 
        lowUsage: 15, 
        mediumUsage: 8, 
        highUsage: 57 
    },
    { 
        name: 'Figma', 
        icon: 'F', 
        category: 'Design', 
        licenses: 180, 
        activeUsers: 99, 
        activePercentage: 55, 
        noUsage: 15, 
        lowUsage: 15, 
        mediumUsage: 15, 
        highUsage: 55 
    },
    { 
        name: 'Zoom', 
        icon: 'Z', 
        category: 'Communication', 
        licenses: 350, 
        activeUsers: 175, 
        activePercentage: 50, 
        noUsage: 12, 
        lowUsage: 8, 
        mediumUsage: 30, 
        highUsage: 50 
    },
    { 
        name: 'Notion', 
        icon: 'N', 
        category: 'Productivity', 
        licenses: 280, 
        activeUsers: 98, 
        activePercentage: 35, 
        noUsage: 10, 
        lowUsage: 20, 
        mediumUsage: 35, 
        highUsage: 35 
    },
    { 
        name: 'GitHub', 
        icon: 'G', 
        category: 'Development', 
        licenses: 150, 
        activeUsers: 38, 
        activePercentage: 25, 
        noUsage: 25, 
        lowUsage: 15, 
        mediumUsage: 35, 
        highUsage: 25 
    },
    { 
        name: 'LinkedIn', 
        icon: 'L', 
        category: 'Marketing', 
        licenses: 350, 
        activeUsers: 112, 
        activePercentage: 32, 
        noUsage: 45, 
        lowUsage: 8, 
        mediumUsage: 15, 
        highUsage: 32 
    },
    { 
        name: 'Sketch', 
        icon: 'K', 
        category: 'Design', 
        licenses: 120, 
        activeUsers: 12, 
        activePercentage: 10, 
        noUsage: 35, 
        lowUsage: 15, 
        mediumUsage: 40, 
        highUsage: 10 
    },
    { 
        name: 'Webflow', 
        icon: 'W', 
        category: 'Design', 
        licenses: 85, 
        activeUsers: 26, 
        activePercentage: 30, 
        noUsage: 42, 
        lowUsage: 28, 
        mediumUsage: 0, 
        highUsage: 30 
    },
    { 
        name: 'Asana', 
        icon: 'A', 
        category: 'Project Management', 
        licenses: 220, 
        activeUsers: 33, 
        activePercentage: 15, 
        noUsage: 30, 
        lowUsage: 25, 
        mediumUsage: 30, 
        highUsage: 15 
    },
];

// Sample Recommendation data
const recommendations = [
    { 
        id: 1, 
        title: "Optimize LinkedIn licenses to save ~$15,000/year",
        details: "LinkedIn has 45% no usage (158 unused licenses). Consider reducing to active users only.",
        iconType: "save" // Custom type for icon
    },
    { 
        id: 2, 
        title: "Boost Asana adoption with team training",
        details: "Only 15% high usage detected. Schedule onboarding sessions to increase project management efficiency.",
        iconType: "boost"
    },
    { 
        id: 3, 
        title: "Consolidate design tools to reduce overhead",
        details: "Multiple design tools detected (Sketch, Figma, Webflow). Standardizing to Figma could reduce costs by 40%.",
        iconType: "consolidate"
    }
];

// Seeding function
const seedDatabase = async () => {
    try {
        // Drop existing data (in case you didn't do it manually)
        await Application.deleteMany({});
        await Recommendation.deleteMany({});
        
        // Insert new data
        await Application.insertMany(applications);
        await Recommendation.insertMany(recommendations);

        console.log('✅ Database seeded successfully with new Category data!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
};

module.exports = seedDatabase;
