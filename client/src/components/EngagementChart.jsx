 // client/src/components/EngagementChart.jsx

import React from 'react';

const getColor = (usageType) => {
    switch (usageType) {
        case 'highUsage': return 'bg-green-500'; // 0-3 days
        case 'mediumUsage': return 'bg-orange-500'; // 4-15 days
        case 'lowUsage': return 'bg-yellow-500'; // 16-30 days
        case 'noUsage': return 'bg-gray-300'; // Never logged in
        default: return 'bg-gray-200';
    }
};

const EngagementChart = ({ app }) => {
    const segments = [
        { key: 'noUsage', label: `${app.noUsage}%`, width: app.noUsage },
        { key: 'lowUsage', label: `${app.lowUsage}%`, width: app.lowUsage },
        { key: 'mediumUsage', label: `${app.mediumUsage}%`, width: app.mediumUsage },
        { key: 'highUsage', label: `${app.highUsage}%`, width: app.highUsage },
    ];

    return (
        <div className="flex items-center space-x-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            
            {/* App Icon and Name */}
            <div className="flex-shrink-0 w-48 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-sky-500 mr-3`}>
                    {app.icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.licenses} licenses</p>
                </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-1 h-6 rounded-md overflow-hidden">
                {segments.map((segment, index) => (
                    // Tailwind's style prop for dynamic width
                    <div 
                        key={index} 
                        style={{ width: `${segment.width}%` }} 
                        className={`h-full ${getColor(segment.key)}`}
                        title={`${segment.key}: ${segment.label}`}
                    >
                    </div>
                ))}
            </div>

            {/* Active Users/Warning */}
            <div className="flex-shrink-0 w-24 text-right">
                <p className={`text-sm font-medium ${app.activePercentage < 40 ? 'text-orange-500' : 'text-green-600'}`}>
                    {app.activeUsers} users
                </p>
                <p className="text-xs text-gray-500">{app.activePercentage}% active</p>
            </div>
        </div>
    );
};

export default EngagementChart;