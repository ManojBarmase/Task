// client/src/components/UserProfileModal.jsx

import React from 'react';
import { X, Building, MapPin, Mail, Globe } from 'lucide-react';

const UserProfileModal = ({ onClose }) => {
    // यहाँ यूजर की डिटेल localStorage या Context से लाई जा सकती है
    const userName = localStorage.getItem('userName') || 'Jone Doe';
    const userEmail = localStorage.getItem('userEmail') || 'user@company.com';
    const userRole = localStorage.getItem('userRole') || 'User';

    // यह डमी डेटा है। इसे वास्तविक API कॉल से भरें।
    const profileDetails = {
        companyName: 'Procure Solutions Pvt. Ltd.',
        companyAddress: '123 Procurement Lane',
        country: 'India',
        zipCode: '110001',
    };

    return (
        // मॉडल के पीछे की बैकग्राउंड (Overlay)
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end p-4 sm:p-6"
            onClick={onClose} // 👈️ बैकग्राउंड पर क्लिक करने पर बंद
        >
            {/* मॉडल कंटेंट बॉक्स */}
            <div 
                className="bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto rounded-lg"
                onClick={(e) => e.stopPropagation()} // 👈️ अंदर क्लिक करने पर मॉडल बंद नहीं होगा
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-4 mb-4">
                        <h3 className="text-2xl font-semibold text-sky-800">My Profile</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Info (Top) */}
                    <div className="flex flex-col items-center mb-6 p-4 bg-sky-50 rounded-lg">
                        <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white font-bold text-xl mb-2">
                            {userName.charAt(0)}
                        </span>
                        <p className="font-bold text-lg text-gray-800">{userName}</p>
                        <p className="text-sm text-sky-600">{userRole.toUpperCase()}</p>
                    </div>
                    
                    {/* Profile Details */}
                    <h4 className="text-lg font-bold text-gray-700 mb-3">Company Details</h4>
                    <div className="space-y-3 text-sm">
                        {/* Company Name */}
                        <div className="flex items-center text-gray-600">
                            <Building className="w-4 h-4 mr-3 text-sky-500" />
                            <span className="font-medium">Company:</span>
                            <span className="ml-2">{profileDetails.companyName}</span>
                        </div>
                        
                        {/* Email */}
                        <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-3 text-sky-500" />
                            <span className="font-medium">Email:</span>
                            <span className="ml-2">{userEmail}</span>
                        </div>

                        {/* Address */}
                        <div className="pt-2 border-t mt-3">
                            <h5 className="font-semibold text-gray-700 mb-2">Billing Address:</h5>
                            <p className="text-gray-600 pl-7">{profileDetails.companyAddress}</p>
                            
                            <div className="flex items-center text-gray-600 mt-2">
                                <Globe className="w-4 h-4 mr-3 text-sky-500" />
                                <span className="font-medium">Country:</span>
                                <span className="ml-2">{profileDetails.country}</span>
                            </div>

                            <div className="flex items-center text-gray-600 mt-2">
                                <MapPin className="w-4 h-4 mr-3 text-sky-500" />
                                <span className="font-medium">ZIP/Code:</span>
                                <span className="ml-2">{profileDetails.zipCode}</span>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* Footer/Action Button */}
                <div className="p-6 border-t mt-4">
                    <button className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;