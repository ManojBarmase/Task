 // client/src/components/Recommendations.jsx

import React from 'react';
import { Lightbulb, DollarSign, Users } from 'lucide-react';

const RecommendationItem = ({ rec }) => (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold text-lg flex-shrink-0">
            {rec.id}
        </div>
        <div>
            <h4 className="text-base font-bold text-gray-800">{rec.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{rec.detail}</p>
        </div>
    </div>
);

const Recommendations = ({ recommendations }) => {
    return (
        <div className="mt-8 space-y-4">
            <h3 className="flex items-center text-lg font-bold text-gray-800">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                AI-Powered Recommendations
            </h3>
            <div className="space-y-4">
                {recommendations.map(rec => (
                    <RecommendationItem key={rec.id} rec={rec} />
                ))}
            </div>
        </div>
    );
};

export default Recommendations;