// client/src/components/ShodowITList.jsx
import React from 'react';

/**
 * Shadow IT Applications की लिस्ट प्रदर्शित करता है।
 * यह कंपोनेंट आपके लक्ष्य UI (Screenshot 45) के अनुसार एक सेंटर्ड अलर्ट बॉक्स दिखाता है।
 * @param {object[]} shadowITData - Shadow IT के रूप में चिह्नित अनुप्रयोगों (applications) का ऐरे।
 */
const ShadowITList = ({ shadowITData }) => {
    // shadowITData.length का उपयोग Alert box में संख्या दिखाने के लिए किया जाता है
    const detectedCount = shadowITData?.length || 0;

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-lg h-full">
            {/* Centered Alert Container */}
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                
                {/* Large Warning Icon */}
                <div className="p-4 bg-indigo-50 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                {/* Main Heading and Description */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Shadow IT Detection</h3>
                <p className="max-w-md text-sm text-gray-500 mb-6">
                    Discover unauthorized or unmanaged applications being used within your organization to maintain security compliance.
                </p>

                {/* Small Unauthorized Count Alert */}
                <div className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">{detectedCount} unauthorized applications</span> detected this month
                </div>
            </div>
        </div>
    );
};

export default ShadowITList;
