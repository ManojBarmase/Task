//  client/src/components/AccessRiskAnalysis.jsx

import React from 'react';
import { UserCog } from 'lucide-react'; // UserCog icon ka use karenge

/**
 * Access Risk Analysis Tab Content.
 * Yeh component aapke target UI (Screenshot 46) ke anusaar ek centered alert box dikhata hai.
 * @param {object[]} riskData - Access risk data. Hum kewal count ka upyog karenge.
 */
const AccessRiskAnalysis = ({ riskData }) => {
    // Agar future mein humein riskData se count nikalna pada, toh iska upyog karenge.
    const detectedCount = riskData?.length || 3; // Filhal hardcode 3 users with elevated permissions

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-lg h-full">
            {/* Centered Content Container */}
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                
                {/* Large Icon (Yellow/Orange tone ke saath) */}
                <div className="p-4 bg-amber-50 rounded-full mb-6">
                    {/* UserCog icon (Lucide-React se) ya aap koi aur icon use kar sakte hain */}
                    <UserCog className="h-10 w-10 text-amber-600" strokeWidth={1.5} /> 
                </div>

                {/* Main Heading and Description */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Risk Analysis</h3>
                <p className="max-w-md text-sm text-gray-500 mb-6">
                    Identify employees with excessive permissions or access to sensitive applications across your SaaS stack.
                </p>

                {/* Small Elevated Permissions Count Alert */}
                <div className="inline-flex items-center rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-bold">{detectedCount} users with elevated permissions</span> detected
                </div>
            </div>
        </div>
    );
};

export default AccessRiskAnalysis;