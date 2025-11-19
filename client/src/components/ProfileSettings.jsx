import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiEdit3 } from 'react-icons/fi'; // react-icons install kar lein (npm i react-icons)
import axios from 'axios';
// API Base URL (Aap isse .env file se bhi la sakte hain)
// Yahaan VITE_API_URL daalein (e.g., http://localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Initial data, yeh aap baad mein API se laayenge
// const initialProfileData = {
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john.doe@quikprocure.com',
//   phone: '+1 (555) 123-4567',
//   jobTitle: 'Procurement Manager',
//   department: 'Operations',
//   officeLocation: 'HQ - San Francisco, CA',
//   avatar: 'JD', // Ya image URL
// };

// Helper: Image URL ko poora banata hai
// 2. Image URL Helper (Windows path fix + Base URL)
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Agar path mein pehle se http hai (e.g. Cloudinary url), toh wahi return karein
    if (imagePath.startsWith('http')) return imagePath;

    // Backslash ko Forward slash mein badlein
    let cleanPath = imagePath.replace(/\\/g, '/');

    // Agar path 'uploads/' se shuru nahi hota, toh laga dein
    if (!cleanPath.startsWith('uploads/')) {
        // Kabhi kabhi server poora path bhej deta hai, use clean karein
        const parts = cleanPath.split('uploads/');
        if (parts.length > 1) {
            cleanPath = 'uploads/' + parts[1];
        }
    }

    // Final URL banayein
    return `${API_BASE_URL}/${cleanPath}`;
};


// 👇 YEH NAYI LIST ADD KAREIN
const departmentOptions = [
  "IT",
  "Marketing",
  "R&D",
  "Facilities",
  "HR",
  "Finance",
  "Sales",
  "Legal",
  "Engineering",
  "Operations" // Yeh pehle se tha, isse bhi rakhein
];

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
 const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        jobTitle: '', department: '', officeLocation: '',
        profileImagePath: '' // 👈 Image path ke liye
    });
  // 2. YEH NAYI LINES ADD KAREIN
  const [selectedFile, setSelectedFile] = useState(null); // Actual file store karne ke liye
  const [previewImage, setPreviewImage] = useState(null); // Image preview URL store karne ke liye
  const fileInputRef = useRef(null); // Hidden input ko control karne ke liye
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);


  // 1. Component load hote hi user data fetch karein
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication error: No token found.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'x-auth-token': token,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data.');
                }

                const data = await response.json();
                setFormData(data); // Server se aaya data state mein set karein
                
                // Server se aayi image ko set karein
                if(data.profileImagePath) {
                    setPreviewImage(getFullImageUrl(data.profileImagePath));
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []); // Empty array ka matlab yeh sirf ek baar chalega

    // 2. Local preview ke liye
    useEffect(() => {
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewImage(objectUrl);
            
            // Cleanup function
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [selectedFile]);


  // Jab user input fields mein type karega
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

   // 4. YEH NAYE FUNCTIONS ADD KAREIN

  // Jab user file select karta hai
 const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

  // Jab user "Change Photo" button par click karta hai
  const handleChangePhotoClick = () => {
    // Hidden file input par click trigger karein
    fileInputRef.current.click();
  };

  // "Save Changes" par click karne par
    // 3. "Save Changes" par API call
    const handleSaveChanges = async () => {
        setError(null);
        setSuccessMessage(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication error: No token found.');
            return;
        }
    const uploadData = new FormData();
        // Saara text data
        for (const key in formData) {
            uploadData.append(key, formData[key]);
        }
        
        // Nayi file (agar hai)
        if (selectedFile) {
            uploadData.append('profileImage', selectedFile, selectedFile.name);
        }

        // --- AXIOS LOGIC SHURU ---
        try {
            // API call ko 'await axios.put()' se replace karein
            const response = await axios.put(
                `${API_BASE_URL}/api/auth/profile`, // API URL
                uploadData, // Request body (FormData)
                {
                    headers: {
                        'x-auth-token': token
                        // 'Content-Type': 'multipart/form-data' YEH NAHI LIKHNA HAI.
                        // Axios FormData ke liye Content-Type khud set kar deta hai.
                    }
                }
            );

            // Axios mein response seedhe 'response.data' mein aata hai
            const result = response.data; 

            setSuccessMessage(result.message);
            setFormData(result.user);
            setIsEditing(false);
            setSelectedFile(null);
            if (result.user.profileImagePath) {
                setPreviewImage(getFullImageUrl(result.user.profileImagePath));
            }else {
                setPreviewImage(null); // Agar user ne image remove ki hai (future feature)
            }

        } catch (err) {
            // Axios 4xx/5xx errors ko yahaan catch block mein bhejta hai
            if (err.response) {
                // Server ne error response bheja hai
                setError(err.response.data.message || 'Failed to update profile.');
            } else if (err.request) {
                // Request bheji gayi par response nahi mila
                setError('Network error: No response from server.');
            } else {
                // Kuch aur error hua
                setError(err.message);
            }
        }
        // --- AXIOS LOGIC KHATAM ---
    };

    // 4. "Cancel" par data reset karein
    const handleCancel = () => {
        setIsEditing(false);
        setSelectedFile(null);
        // Data ko server se aaye data par reset karein (isliye dobara fetch karna behtar hai)
        window.location.reload(); // Sabse aasan tareeka
    };

    // --- Loading aur Error States ---
    if (isLoading) {
        return <div className="p-8">Loading profile...</div>;
    }

    if (error && !isEditing) { // Edit mode mein error na dikhayein
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

  return (
    // p-8 aapke MainLayout ke 'main' tag mein padding add karega
    <div className="p-8"> 
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your profile information and requestors</p>
      </div>

     {/* --- Success/Error Messages --- */}
            {successMessage && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700">{successMessage}</div>}
            {error && <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">{error}</div>}
    
      {/* Tabs (Aapke screenshot ke hisab se) */}
      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <span className="cursor-pointer border-sky-600 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              My Profile
            </span>
            <span className="cursor-pointer border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Requestors
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content (View/Edit) */}
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal details and contact information.</p>
          </div>
          {/* == Buttons == */}
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md shadow-sm text-sm"
              >
                <FiEdit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md shadow-sm text-sm"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>



        {/* == Profile Form / View == */}
       <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center">
                        <div className="h-32 w-32 rounded-full flex items-center justify-center text-white text-5xl font-bold overflow-hidden bg-sky-600">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                // Initials dikhayein
                                <span className="flex items-center justify-center h-full w-full">
                                    {(formData.firstName?.[0] || 'J') + (formData.lastName?.[0] || 'D')}
                                </span>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                        />
                        
                        {/* Edit mode mein hi 'Change Photo' dikhayein */}
                        {isEditing && (
                            <button
                                onClick={handleChangePhotoClick}
                                className="mt-4 text-sm font-medium text-sky-600 hover:text-sky-700"
                            >
                                Change Photo
                            </button>
                        )}
                        
                        {!isEditing && (
                            <div className="text-center mt-4">
                                <p className="text-lg font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                                <p className="text-sm text-gray-500">{formData.jobTitle}</p>
                                <p className="text-sm text-gray-500">{formData.department}</p>
                            </div>
                        )}
       </div>
          
          {/* Details Section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <InfoField label="First Name" icon={<FiUser />} value={formData.firstName || ''} name="firstName" isEditing={isEditing} onChange={handleInputChange} />
                        <InfoField label="Last Name" icon={<FiUser />} value={formData.lastName || ''} name="lastName" isEditing={isEditing} onChange={handleInputChange} />
                        <InfoField label="Email" icon={<FiMail />} value={formData.email || ''} name="email" isEditing={isEditing} onChange={handleInputChange} type="email" />
                        <InfoField label="Phone" icon={<FiPhone />} value={formData.phone || ''} name="phone" isEditing={isEditing} onChange={handleInputChange} />
                        <InfoField label="Job Title" icon={<FiBriefcase />} value={formData.jobTitle || ''} name="jobTitle" isEditing={isEditing} onChange={handleInputChange} />
                       {/* 👇 IS LINE KO UPDATE KAREIN 👇 */}
                          <InfoField 
                            label="Department" 
                            icon={<FiBriefcase />} 
                            value={formData.department || ''} 
                            name="department" 
                            isEditing={isEditing} 
                            onChange={handleInputChange} 
                            isDropdown={true}
                            options={departmentOptions} // 👈 YEH NAYI LINE ADD KAREIN
                          />
                        <InfoField label="Office Location" icon={<FiMapPin />} value={formData.officeLocation || ''} name="officeLocation" isEditing={isEditing} onChange={handleInputChange} className="md:col-span-2" />
                    </div>
        </div>
      </div>
    </div>
  );
};

// Helper component (isi file mein neeche bana lein)
const InfoField = ({ label, icon, value, name, isEditing, onChange, type = 'text', className = '', isDropdown = false, options = [] }) => {
  
  return (
    <div className={className}>
      <label className="flex items-center text-sm font-medium text-gray-500">
        {React.cloneElement(icon, { className: 'h-4 w-4 mr-2 text-gray-400' })}
        {label}
      </label>
      {isEditing ? (
        isDropdown ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          >
            <option value="">-- Select Department --</option>
            {/* 3. Ab hum list ko loop karke options banayenge */}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        )
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-900 h-9 py-2">{value}</p>
      )}
    </div>
  );
};

export default ProfileSettings;