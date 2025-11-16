 // client/src/components/UserProfileModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building, MapPin, Mail, Globe, Loader2, Edit, Save, ShieldAlert , Users , LogOut} from 'lucide-react'; // Edit और Save आइकन जोड़े गए

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ModalOverlay = ({ onClose, children }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 sm:p-6" // Center the modal
        onClick={onClose}
    >
        <div 
            className="bg-white w-full max-w-sm max-h-[90vh] shadow-2xl overflow-y-auto rounded-lg" // Added max-h-[90vh]
            onClick={(e) => e.stopPropagation()} 
        >
            {children}
        </div>
    </div>
);

const UserProfileModal = ({ onClose , onLogout }) => {
    // 1. Loading/Error States
    const [profileDetails, setProfileDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // 2. Editing States
    // 👈️ Edit मोड को ट्रैक करने के लिए नया स्टेट
    const [isEditing, setIsEditing] = useState(false);
    // 👈️ इनपुट फ़ील्ड के डेटा को स्टोर करने के लिए नया स्टेट
    const [formData, setFormData] = useState({});

    const token = localStorage.getItem('token');

    // --- A. Fetch Data (Same as before) ---
    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         if (!token) return setError('User not authenticated.');
    //         try {
    //             const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
    //                 headers: { 'x-auth-token': token }
    //             });
    //             setProfileDetails(response.data);
    //             // 👈️ Fetch होने के बाद formData को सेट करें
    //             setFormData(response.data); 
    //         } catch (err) {
    //             setError('Failed to load profile data.');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchProfile();
    // }, [token]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return setError('User not authenticated.');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { 'x-auth-token': token }
                });
                
                const fetchedData = response.data;
                setProfileDetails(fetchedData);
                setFormData(fetchedData); 

                // 👈️ नया लॉजिक: चेक करें कि क्या नाम/कंपनी का नाम खाली है
                const requiresSetup = !fetchedData.name || !fetchedData.companyName;

                // यदि नाम या कंपनी का नाम खाली है, तो तुरंत Edit मोड चालू करें
                if (requiresSetup) {
                    setIsEditing(true);
                    setSaveMessage('Please complete your profile details.');
                }
                
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    // --- B. Handle Input Change ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- C. Handle Save (Update API Call) ---
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        
        try {
            // 👈️ /api/auth/profile पर PUT रिक्वेस्ट भेजें
            const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
                headers: { 'x-auth-token': token }
            });

            // 1. Profile Details को अपडेट करें
            setProfileDetails(response.data);
            // 2. Editing मोड से बाहर निकलें
            setIsEditing(false);
            setSaveMessage('✅ Profile updated successfully!');
            
        } catch (err) {
            console.error("Profile Save Error:", err.response?.data);
            setSaveMessage(`❌ Save failed: ${err.response?.data?.msg || 'Server error'}`);
        } finally {
            setIsSaving(false);
            // संदेश को 3 सेकंड बाद हटा दें
            setTimeout(() => setSaveMessage(''), 3000); 
        }
    };

    // ... (Loading and Error Handling JSX - Same as previous response) ...
    if (loading) {
         return (
             <ModalOverlay onClose={onClose}>
                 <div className="flex items-center justify-center p-10">
                     <Loader2 className="w-8 h-8 text-sky-500 animate-spin mr-2" />
                     <p className="text-gray-700">Loading Profile...</p>
                 </div>
             </ModalOverlay>
         );
     }

     if (error || !profileDetails) {
         return (
             <ModalOverlay onClose={onClose}>
                 <div className="p-6 text-red-600 flex items-center">
                     <ShieldAlert className="w-5 h-5 mr-3" />
                     <p>{error || 'No profile data found.'}</p>
                 </div>
             </ModalOverlay>
         );
     }
    
    // De-structure from the current active data source
    const activeData = isEditing ? formData : profileDetails;
    const { name, email, role, companyName, companyAddress, city, country, zipCode } = activeData;
    const userNameInitial = name ? name.charAt(0) : 'U';

    // ----------------------------------------------------
    // JSX Rendering
    // ----------------------------------------------------
    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                
                {/* Header and Close Button */}
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <h3 className="text-2xl font-semibold text-sky-800">{isEditing ? 'Edit Profile' : 'My Profile'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Status Message */}
                {saveMessage && (
                    <div className={`p-2 mb-4 text-center text-sm rounded ${saveMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {saveMessage}
                    </div>
                )}

                {/* User Info (Top) */}
                <div className="flex flex-col items-center mb-6 p-4 bg-sky-50 rounded-lg">
                    <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white font-bold text-xl mb-2">
                        {userNameInitial}
                    </span>
                    <p className="font-bold text-lg text-gray-800">{name}</p>
                    {/* Email display in view mode */}
                    {!isEditing && <p className="text-sm text-gray-600">{email}</p>}
                    <p className="text-sm text-sky-600 mt-1">{role ? role.toUpperCase() : 'N/A'}</p>
                </div>
                
                {/* Profile Details (Dynamic Rendering) */}
                <h4 className="text-lg font-bold text-gray-700 mb-3">Company Details</h4>
                <div className="space-y-3 text-sm">
                    
                    {/* Name/Email in Editing Mode */}
                    {isEditing && (
                        <ProfileInput 
                            label="Full Name" 
                            icon={Users} 
                            name="name" 
                            value={formData.name || ''} 
                            onChange={handleInputChange} 
                        />
                    )}
                    
                    {/* Email - Non-editable (usually primary key) */}
                    {isEditing && (
                        <div className="flex items-center text-gray-500 bg-gray-100 p-2 rounded">
                            <Mail className="w-4 h-4 mr-3" />
                            <span className="font-medium">Email (Non-Editable):</span>
                            <span className="ml-2">{email}</span>
                        </div>
                    )}

                    {/* Company Name */}
                    <ProfileInput 
                        label="Company Name" 
                        icon={Building} 
                        name="companyName" 
                        value={activeData.companyName || ''} 
                        onChange={handleInputChange} 
                        readOnly={!isEditing}
                    />

                    {/* Company Address */}
                    <ProfileInput 
                        label="Address" 
                        icon={MapPin} 
                        name="companyAddress" 
                        value={activeData.companyAddress || ''} 
                        onChange={handleInputChange} 
                        readOnly={!isEditing}
                    />
                    
                    {/* 👈️ नया 'City' इनपुट जोड़ा गया */}
                    <ProfileInput 
                        label="City" 
                        icon={MapPin} // आप इसके लिए भी MapPin या कोई अन्य आइकन उपयोग कर सकते हैं
                        name="city" 
                        value={activeData.city || ''} 
                        onChange={handleInputChange} 
                        readOnly={!isEditing}
                    />

                    {/* Country */}
                    <ProfileInput 
                        label="Country" 
                        icon={Globe} 
                        name="country" 
                        value={activeData.country || ''} 
                        onChange={handleInputChange} 
                        readOnly={!isEditing}
                    />
                    
                    {/* Zip Code */}
                    <ProfileInput 
                        label="Zip Code" 
                        icon={MapPin} 
                        name="zipCode" 
                        value={activeData.zipCode || ''} 
                        onChange={handleInputChange} 
                        readOnly={!isEditing}
                    />
                    
                </div>
            </div>
            
            {/* Footer/Action Button */}
            <div className="p-6 border-t mt-4">
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
                    >
                        <Edit className="w-5 h-5 mr-2" /> Edit Profile
                    </button>
                ) : (
                    <div className="space-y-3">
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )} 
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            onClick={() => {
                                setIsEditing(false); 
                                setFormData(profileDetails); // बदलाव को रीसेट करें
                            }} 
                            className="w-full text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* ❌ Edit/Save बटनों के बाद लॉगआउट बटन जोड़ें */}
                <div className="mt-4 border-t pt-4"> 
                    <button 
                        onClick={onLogout} // 👈️ onLogout फ़ंक्शन यहाँ कॉल करें
                        className="w-full text-red-600 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center border border-red-300"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Log Out
                    </button>
                </div>

            </div>
        </ModalOverlay>
    );
};

// 💡 Helper Component: इनपुट फील्ड या टेक्स्ट डिस्प्ले को संभालता है
const ProfileInput = ({ label, icon: Icon, name, value, onChange, readOnly = false }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-gray-500 flex items-center">
            <Icon className="w-4 h-4 mr-2 text-sky-500" /> {label}
        </label>
        {readOnly ? (
            <p className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">{value || 'N/A'}</p>
        ) : (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                placeholder={`Enter ${label}`}
            />
        )}
    </div>
);


export default UserProfileModal;