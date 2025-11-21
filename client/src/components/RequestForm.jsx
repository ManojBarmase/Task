// client/src/components/RequestForm.jsx (पूरी फ़ाइल को बदलें)
// client/src/components/RequestForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, CornerDownLeft, Loader2, Check, LayoutDashboard, Upload, Paperclip } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL ;
const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D', 'Engineering', 'Sales'];

// --- Step Components ---

// Step 1: Basic Info (Screenshot 146)
const Step1 = ({ formData, handleChange, handleNext }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>
            <p className="text-gray-500 text-sm mt-1">Enter the basic information about your request</p>
        </div>
        
        {/* Request Title */}
        <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Request Title</label>
            <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., Office Supplies - Q1 2025"
            />
        </div>

        {/* Department */}
        <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
                <option value="" disabled>Select department</option>
                {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>
        </div>
        
        <div className="flex justify-end pt-4">
            <button
                type="button"
                onClick={() => { if (formData.title && formData.department) handleNext(); }}
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={!formData.title || !formData.department}
            >
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </div>
);

// Step 2: Justification (Screenshot 147)
// Step 2: Justification (Updated Dynamic)
const Step2 = ({ formData, handleChange, handleNext, handlePrev, attachments, handleFileChange, removeFile }) => {
    
    // Hidden inputs ko click karne ke liye Refs
    const fileInputRef = React.useRef(null);
    const screenshotInputRef = React.useRef(null);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Justification</h3>
                <p className="text-gray-500 text-sm mt-1">Provide business justification</p>
            </div>

            {/* Business Justification Textarea */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Business Justification</label>
                <textarea
                    name="description"
                    id="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Explain why this purchase is necessary..."
                ></textarea>
            </div>

            {/* 👇 Dynamic Attachments Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments & Screenshots</label>
                <div className="flex space-x-3">
                    
                    {/* Upload Files Button */}
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()} // Trigger Hidden Input
                        className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" /> Upload Files
                    </button>
                    {/* Hidden Input for Docs */}
                    <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                    />

                    {/* Add Screenshots Button */}
                    <button 
                        type="button" 
                        onClick={() => screenshotInputRef.current.click()} // Trigger Hidden Input
                        className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Paperclip className="w-4 h-4 mr-2" /> Add Screenshots
                    </button>
                    {/* Hidden Input for Images */}
                    <input 
                        type="file" 
                        multiple 
                        ref={screenshotInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                        accept="image/png, image/jpeg, image/jpg" 
                    />
                </div>

                {/* Selected Files List (Show what user selected) */}
                {attachments && attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                                <span className="truncate text-gray-700">{file.name}</span>
                                <button 
                                    type="button" 
                                    onClick={() => removeFile(index)} 
                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Buttons (Prev/Next) waisa hi rahega... */}
             <div className="flex justify-between pt-4">
                 <button type="button" onClick={handlePrev} className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </button>
                <button type="button" onClick={() => { if (formData.description) handleNext(); }} className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300" disabled={!formData.description}>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );
};

// Step 3: Vendor Recommendations (Screenshot 148)
// Step 3: Vendor Recommendations (Updated Logic)
const Step3 = ({ formData, handleChange, handleNext, handlePrev, vendors }) => {
    const [noVendor, setNoVendor] = useState(false);

    // Dropdown Change Handler
    const handleDropdownChange = (e) => {
        const value = e.target.value;
        if (value === 'add-new') {
            // Set flag for new vendor
            handleChange({ target: { name: 'isNewVendor', value: true } });
            // Clear selected ID
            handleChange({ target: { name: 'vendor', value: '' } });
        } else {
            // Existing vendor selected
            handleChange({ target: { name: 'isNewVendor', value: false } });
            handleChange({ target: { name: 'vendor', value: value } });
        }
    };

    // Handler for Proposed Vendor Fields
    const handleProposedChange = (e) => {
        const { name, value } = e.target;
        // Parent state update karne ka tareeka thoda alag hoga kyunki ye nested object hai
        // Hum isse parent component mein ek special prop ke through handle kar sakte hain, 
        // ya simple tareeke se formData update karein:
        
        // NOTE: Iske liye main component mein handleChange logic update karna padega (niche dekhein)
        handleChange({ target: { name: `proposedVendor.${name}`, value: value } });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Vendor Recommendations</h3>
                <p className="text-gray-500 text-sm mt-1">Select the vendor for this request</p>
            </div>
            
            {/* Checkbox: No Vendor */}
            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="noVendor" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={noVendor}
                    onChange={(e) => {
                        setNoVendor(e.target.checked);
                        if (e.target.checked) {
                            handleChange({ target: { name: 'vendor', value: '' } });
                            handleChange({ target: { name: 'isNewVendor', value: false } });
                        }
                    }}
                />
                <label htmlFor="noVendor" className="ml-2 block text-sm text-gray-700">
                    I don't have vendor recommendations
                </label>
            </div>

            {!noVendor && (
                <div className="space-y-4">
                    {/* Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
                        <select
                            name="vendor"
                            value={formData.isNewVendor ? 'add-new' : (formData.vendor || '')}
                            onChange={handleDropdownChange}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" disabled>Select vendor</option>
                            {vendors.map(v => (
                                <option key={v._id} value={v._id}>{v.vendorName}</option>
                            ))}
                            <option disabled>──────────</option>
                            <option value="add-new" className="text-blue-600 font-medium">+ Suggest New Vendor</option>
                        </select>
                    </div>

                    {/* 👇 INPUT FIELDS FOR NEW VENDOR (Only if 'add-new' is selected) */}
                    {formData.isNewVendor && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-sm font-semibold text-blue-800">New Vendor Details</h4>
                            
                            <input
                                type="text"
                                name="vendorName"
                                value={formData.proposedVendor?.vendorName || ''}
                                onChange={handleProposedChange}
                                placeholder="Vendor Name *"
                                className="w-full border border-blue-200 rounded-md p-2 text-sm"
                            />
                            <input
                                type="text"
                                name="website"
                                value={formData.proposedVendor?.website || ''}
                                onChange={handleProposedChange}
                                placeholder="Website (e.g., vendor.com)"
                                className="w-full border border-blue-200 rounded-md p-2 text-sm"
                            />
                             <input
                                type="email"
                                name="contactEmail"
                                value={formData.proposedVendor?.contactEmail || ''}
                                onChange={handleProposedChange}
                                placeholder="Contact Email"
                                className="w-full border border-blue-200 rounded-md p-2 text-sm"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between pt-4 items-center">
                 <button type="button" onClick={handlePrev} className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </button>
                <button type="button" onClick={handleNext} className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );
};

// Step 4: Budget (Screenshot 149)
const Step4 = ({ formData, handleChange, handleNext, handlePrev }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
            <p className="text-gray-500 text-sm mt-1">Provide budget details</p>
        </div>

        {/* Estimated Cost */}
        <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                    type="number"
                    name="cost"
                    id="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-7 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0.00"
                />
            </div>
        </div>

        {/* Cost Per License (Optional) */}
        <div>
            <label htmlFor="costPerLicense" className="block text-sm font-medium text-gray-700 mb-1">Cost Per License (Tentative)</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                    type="number"
                    name="costPerLicense" // Make sure to handle this in state
                    id="costPerLicense"
                    value={formData.costPerLicense || ''} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-7 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0.00"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter the estimated cost per license if applicable</p>
        </div>

        {/* Number of Licenses (Optional) */}
        <div>
            <label htmlFor="numLicenses" className="block text-sm font-medium text-gray-700 mb-1">Number of Licenses</label>
            <input
                type="number"
                name="numLicenses" // Make sure to handle this in state
                id="numLicenses"
                value={formData.numLicenses || ''}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="0"
            />
        </div>

        <div className="flex justify-between pt-4">
             <button
                type="button"
                onClick={handlePrev}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <button
                type="button"
                onClick={() => { if (formData.cost) handleNext(); }}
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={!formData.cost || parseFloat(formData.cost) <= 0}
            >
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </div>
);

// Step 5: Review (Screenshot 150 & 151)
const Step5 = ({ formData, handleSubmit, loading, handlePrev, vendors }) => {
    // 👇 LOGIC TO FIND VENDOR NAME
    let displayVendorName = '—';
    
    if (formData.isNewVendor && formData.proposedVendor?.vendorName) {
        // Case 1: New Suggested Vendor
        displayVendorName = `${formData.proposedVendor.vendorName} (Suggested)`;
    } else if (formData.vendor) {
        // Case 2: Existing Vendor ID -> Find Name
        const selectedVendor = vendors.find(v => v._id === formData.vendor);
        displayVendorName = selectedVendor ? selectedVendor.vendorName : 'Unknown Vendor';
    }

    return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-900">Review</h3>
            <p className="text-gray-500 text-sm mt-1">Review your request before submitting</p>
        </div>

        {/* Review Summary List (Screenshot 150 Style) */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 gap-y-4">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Request Title</p>
                    <p className="text-sm text-gray-900 font-medium mt-1">{formData.title}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.department}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</p>
                    <p className="text-sm text-gray-900 mt-1">{displayVendorName}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Cost</p>
                    <p className="text-sm text-gray-900 mt-1">${parseFloat(formData.cost).toFixed(2)}</p>
                </div>
                
                {/* Optional Fields */}
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Per License</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.costPerLicense ? `$${formData.costPerLicense}` : '—'}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Licenses</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.numLicenses ? formData.numLicenses : '—'}</p>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Justification</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.description}</p>
                </div>
            </div>
        </div>

        {/* Warning Box (Screenshot 151) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Please review all information carefully before submitting. Once submitted, your request will be sent for approval.
        </div>
  
        <div className="flex justify-between pt-4">
             <button
                type="button"
                onClick={handlePrev}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                className={`flex items-center px-6 py-2.5 text-white font-medium rounded-lg transition-colors 
                    ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Submitting...' : 'Submit Request'}
            </button>
        </div>
    </div>
  );
};

// --- Main RequestForm Component ---

const RequestForm = ({ onSave }) => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const location = useLocation(); 

    // 👇 1. VENDORS STATE ADD KAREIN
    const [vendors, setVendors] = useState([]);
    const isEditMode = id && location.state && location.state.requestData; 
    const initialData = isEditMode ? location.state.requestData : { 
       title: '', 
        description: '', 
        cost: '', 
        department: '', 
        
        // Vendor Logic
        vendor: '', 
        isNewVendor: false,
        proposedVendor: { vendorName: '', website: '', contactEmail: '' },
        
        costPerLicense: '',
        numLicenses: ''
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialData);

    // 👇 1. NEW STATE FOR FILES
    const [attachments, setAttachments] = useState([]);

    // 👇 2. FILE HANDLER
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Purane files ke saath naye files jodein
        setAttachments(prev => [...prev, ...files]);
    };

    // 👇 3. REMOVE FILE HANDLER
    const removeFile = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // 👇 2. API SE VENDORS FETCH KAREIN
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/vendors`, {
                    headers: { 'x-auth-token': token }
                });
                setVendors(res.data); // Vendors list set karein
            } catch (err) {
                console.error("Error fetching vendors:", err);
            }
        };
        fetchVendors();
    }, []);

    useEffect(() => {
        if (isEditMode) {
             setFormData(prev => ({ 
                 ...prev, 
                 cost: String(prev.cost),
                 department: departments.includes(prev.department) ? prev.department : ''
             }));
        }
    }, [isEditMode]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Define the 5 Steps
    const steps = [
        { label: 'Basic Info', component: Step1 },
        { label: 'Justification', component: Step2 },
        { label: 'Vendor Recommendations', component: Step3 },
        { label: 'Budget', component: Step4 },
        { label: 'Review', component: Step5 }
    ];

    // 2. Updated handleChange (Handles nested proposedVendor)
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Agar name "proposedVendor.vendorName" jaisa hai
        if (name.includes('proposedVendor.')) {
            const field = name.split('.')[1]; // 'vendorName'
            setFormData(prev => ({
                ...prev,
                proposedVendor: {
                    ...prev.proposedVendor,
                    [field]: value
                }
            }));
        } else {
            // Normal field update
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const handleBackToDashboard = () => {
        navigate('/requests'); 
    };

   const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        const token = localStorage.getItem('token');
        // (URL/Method logic waisa hi rahega)
        const method = isEditMode ? 'put' : 'post';
        const url = isEditMode ? `${API_BASE_URL}/api/requests/${id}` : `${API_BASE_URL}/api/requests`;
        
        if (!token) { /* ... error handling ... */ return; }

        try {
            // 👇 USE FORMDATA FOR FILE UPLOAD
            const data = new FormData();

            // 1. Simple Fields
            data.append('title', formData.title);
            data.append('department', formData.department);
            data.append('description', formData.description);
            data.append('cost', parseFloat(formData.cost));
            data.append('costPerLicense', parseFloat(formData.costPerLicense) || 0);
            data.append('numLicenses', parseInt(formData.numLicenses) || 0);

            // 2. Logic for Vendor (ID vs New)
            if (formData.isNewVendor) {
                data.append('isNewVendor', 'true');
                // Object ko stringify karke bhejein
                data.append('proposedVendor', JSON.stringify(formData.proposedVendor));
            } else {
                data.append('vendor', formData.vendor);
            }

            // 3. Attachments Append Karein
            // Loop lagakar saari files 'attachments' key mein daalein
            attachments.forEach((file) => {
                data.append('attachments', file);
            });

            // 4. Send Request (Browser automatically sets Content-Type to multipart/form-data)
            const res = await axios({
                 method: method,
                 url: url,
                 data: data,
                 headers: { 'x-auth-token': token }
             });
            
             setSuccess(isEditMode ? 'Request updated successfully!' : 'Request submitted successfully!');
             setTimeout(() => {
                navigate('/requests', { state: { requestSubmitted: true } });
             }, 1500); 

        } catch (err) {
            console.error("Request Submission Error:", err);
            setError(err.response?.data?.msg || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };
    
    const CurrentStepComponent = steps[currentStep - 1].component;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">

            {/* Sidebar */}
            <div className="hidden md:flex flex-col flex-shrink-0 bg-sky-800 border-r border-gray-200 h-full w-64">
                <div className="h-16 flex items-center justify-center border-b border-sky-700">
                    <h1 className="text-xl font-bold text-white">ProcureIQ</h1>
                </div>
                <div className="p-4">
                    <button
                        onClick={handleBackToDashboard}
                        className="flex items-center w-full text-white px-4 py-2.5 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-3" /> 
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full py-12 px-6">
                    
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">New Request</h1>
                        <p className="text-gray-500 mt-2">Complete the form below to submit a new procurement request</p>
                    </div>

                    {/* Step Indicator (Screenshot Style) */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between w-full max-w-3xl mx-auto relative">
                            {/* Connecting Lines - Only visual */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                            
                            {steps.map((step, index) => {
                                const isActive = index + 1 === currentStep;
                                const isCompleted = index + 1 < currentStep;
                                
                                return (
                                    <div key={index} className="flex flex-col items-center bg-gray-50 px-2">
                                        <div 
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                                            ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 
                                              isCompleted ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}
                                        >
                                            {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                            <span className="font-bold mr-2">Error:</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                            <Check className="w-4 h-4 mr-2" /> {success}
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="w-full max-w-3xl mx-auto">
                        <CurrentStepComponent 
                            formData={formData} 
                            handleChange={handleChange} 
                            handleNext={handleNext} 
                            handlePrev={handlePrev} 
                            handleSubmit={handleSubmit} 
                            loading={loading}
                            vendors={vendors} // 👈 Yahan vendors prop pass karein
                            setShowAddVendorModal={() => {}} // (Ab iski zaroorat nahi par error na aaye isliye empty function)
                            attachments={attachments}
                            handleFileChange={handleFileChange}
                            removeFile={removeFile}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestForm;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ArrowLeft, ArrowRight, CornerDownLeft, Loader2, Check, LayoutDashboard } from 'lucide-react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import MainLayout from './MainLayout';

// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = import.meta.env.VITE_API_URL;
// const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'];

// // --- Step Components (Placeholders for now) ---

// // Step 1: Basic Info
// const Step1 = ({ formData, handleChange, handleNext }) => (
//     <div className="px-5 py-5 bg-white border rounded-md shadow-lg space-y-6 ">
//         <h3 className="text-xl font-semibold text-gray-800  pb-2">Basic Info</h3>
//         <p className="text-gray-500">Enter the basic information about your request</p>
        
//         {/* Request Title */}
//         <div>
//             <label htmlFor="title" className="block text-sm font-medium text-gray-700">Request Title</label>
//             <input
//                 type="text"
//                 name="title"
//                 id="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full border border-gray-300 bg-sky-50 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
//                 placeholder="e.g., Office Supplies - Q1 2025"
//             />
//         </div>

//         {/* Department */}
//         <div>
//             <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
//             <select
//                 name="department"
//                 id="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full border border-gray-300 bg-sky-50 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
//                 placeholder="Select Ddepartment"
//            >
//                 <option value="" >Select department</option>
//                 {departments.map(dept => (
//                     <option key={dept} value={dept}>{dept}</option>
//                 ))}
//             </select>
//         </div>
        
//         <div className="flex justify-end pt-4">
//             <button
//                 type="button"
//                 onClick={() => { if (formData.title && formData.department) handleNext(); }}
//                 className="flex items-center px-3 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-500 transition-colors disabled:bg-sky-300"
//                 disabled={!formData.title || !formData.department}
//             >
//                 Next <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//         </div>
//     </div>
// );

// // Step 2: Vendor (Placeholder)
// const Step2 = ({ formData, handleChange, handleNext, handlePrev }) => (
//     <div className="space-y-6 bg-white px-6 pt-6 pb-16 border rounded-md shadow-lg">
//         <h3 className="text-xl font-semibold text-gray-800  pb-2">Vendor</h3>
//         <p className="text-gray-600">Select the vendor for this request</p>
        
//         {/* Vendor Name Field (from your old form) */}
//         <div>
//             <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">Vendor</label>
//             <input
//                 type="text"
//                 name="vendorName"
//                 id="vendorName"
//                 value={formData.vendorName}
//                 onChange={handleChange}
//                 className="mt-1 block w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
//                 placeholder="Select vendor"
//             />
//         </div>

//         <div className='flex w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3'>
//            <h5 className='font-semibold  text-gray-700'>Tip:</h5>
//            <p className='font-normal  text-gray-500'>Select an existing vendor from our approved list or add a new vendor for review.</p>
//         </div>

//         <div className="flex justify-between pt-4">
//              <button
//                 type="button"
//                 onClick={handlePrev}
//                 className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//             >
//                 <ArrowLeft className="w-4 h-4 mr-2" /> Previous
//             </button>
//             <button
//                 type="button"
//                 onClick={handleNext} // Assuming vendorName is optional, so we can always proceed
//                 className="flex items-center px-2 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
//             >
//                 Next <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//         </div>
//     </div>
// );

// // Step 3: Budget & Justification (Placeholder)
// const Step3 = ({ formData, handleChange, handleNext, handlePrev }) => (
//     <div className="space-y-6 bg-white p-6 border rounded-md shadow-lg">
//         <h3 className="text-xl font-semibold text-gray-800  pb-2">Budget & Justification</h3>
//         <p className="text-gray-600">Provide budget details and business justification</p>

//          {/* Cost */}
//         <div>
//             <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Estimated Cost</label>
//             <div className="relative mt-1 rounded-md shadow-sm">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm">$</span>
//                 </div>
//                 <input
//                     type="number"
//                     name="cost"
//                     id="cost"
//                     value={formData.cost}
//                     onChange={handleChange}
//                     required
//                     min="1"
//                     step="0.01"
//                     className="block w-full bg-sky-50 rounded-md border border-gray-300 pl-7 pr-12 p-3 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
//                     placeholder="0.00"
//                 />
//             </div>
//         </div>
        
//         {/* Description */}
//         <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700">Business Justification</label>
//             <textarea
//                 name="description"
//                 id="description"
//                 rows="4"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
//                 placeholder="Explain why this purchase is necessary and how it will benefit the organization"
//             ></textarea>
//             <p className='text-sm font-light text-gray-500' >Provide a clear explanation for budget approval</p>
//         </div>


//         <div className="flex justify-between pt-4">
//              <button
//                 type="button"
//                 onClick={handlePrev}
//                 className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//             >
//                 <ArrowLeft className="w-4 h-4 mr-2" /> Previous
//             </button>
//             <button
//                 type="button"
//                 onClick={() => { if (formData.cost && formData.description) handleNext(); }}
//                 className="flex items-center px-2 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400"
//                 disabled={!formData.cost || !formData.description || parseFloat(formData.cost) <= 0}
//             >
//                 Next <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//         </div>
//     </div>
// );

// // Step 4: Review and Submit
// const Step4 = ({ formData, handleSubmit, loading }) => (
//     <div className="space-y-6 bg-white p-6 border rounded-md shadow-lg">
//         <h3 className="text-xl font-semibold text-gray-800  pb-2">Review</h3>
//         <p className="text-gray-600">Please review your request details before submission.</p>

//         {/* Review Summary */}
//         <div className="bg-sky-50 p-4 rounded-lg space-y-2">
//             <p><strong> Request Title:</strong><br /> {formData.title}</p>
//             <p><strong>Department:</strong><br /> {formData.department}</p>
//             <p><strong>Vendor:</strong> <br />{formData.vendorName || 'N/A'}</p>
//             <p><strong>Estimated Cost:</strong> <br />${parseFloat(formData.cost).toFixed(2)}</p>
//             <p><strong>Business Justification:</strong><br /> {formData.description}</p>
//         </div>

//         <div className=' w-full bg-yellow-50 border border-yellow-300 rounded-md shadow-sm p-3'>
//            <p className='font-normal text-sm text-yellow-800'>Please review all information carefully before submitting. Once submitted, your request will be sent for approval.</p>
//         </div>
  
//         <div className="flex justify-end pt-4">
//             <button
//                 type="button"
//                 onClick={handleSubmit}
//                 className={`flex items-center px-2 py-1 text-white font-medium rounded-lg transition-colors 
//                     ${loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
//                 disabled={loading}
//             >
//                 {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CornerDownLeft className="w-4 h-4 mr-2" />}
//                 {loading ? 'Submitting...' : 'Confirm & Submit'}
//             </button>
//         </div>
//     </div>
// );


// // --- Main RequestForm Component ---

// const RequestForm = ({ onSave }) => {
//     // We remove onClose as it's a full-page component now
//     const navigate = useNavigate();
//     // 👇️ NEW: Edit Mode Logic के लिए Hooks का उपयोग करें
//     const { id } = useParams(); // URL से ID प्राप्त करें (जैसे: /requests/edit/:id)
//     const location = useLocation(); // State data प्राप्त करें

//     // चेक करें कि यह Edit Mode है या नहीं
//     const isEditMode = id && location.state && location.state.requestData; 
//     const initialData = isEditMode ? location.state.requestData : { 
//         title: '', 
//         description: '', 
//         cost: '', 
//         department: departments[0] || '', 
//         vendorName: '' 
//     };

//     // 👇️ UPDATED: initialData का उपयोग करें
//     const [currentStep, setCurrentStep] = useState(1);
//     const [formData, setFormData] = useState(initialData);   // <-- initialData से शुरू करें

//     // 👇️ NEW: Edit Mode में, form data को populate करने के लिए useEffect का उपयोग करें
//     useEffect(() => {
//         if (isEditMode) {
//              // यदि Edit Mode में है, तो currentStep को सीधे Review पर सेट करना उपयोगी हो सकता है, 
//              // लेकिन हम इसे 1 पर ही रहने देंगे ताकि user सारे steps review कर सके।

//              // यदि आपके RequestForm.jsx में `department` का default value `departments[0]` है
//              // और API से आया data null या undefined है, तो आप यहां clean-up कर सकते हैं।
             
//              // API से प्राप्त डेटा में `cost` एक number हो सकता है, जिसे हमें string में बदलना पड़ सकता है:
//              setFormData(prev => ({ 
//                  ...prev, 
//                  cost: String(prev.cost), // cost को string में convert करें (input type="number" के लिए)
//                  // यदि API से प्राप्त department, departments array में नहीं है, तो default department[0] सेट करें
//                  department: departments.includes(prev.department) ? prev.department : departments[0] || ''
//              }));
//         }
//     }, [isEditMode]);

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(false);

//     const steps = [
//         { label: 'Basic Info', component: Step1 },
//         { label: 'Vendor', component: Step2 },
//         { label: 'Budget & Justification', component: Step3 },
//         { label: 'Review', component: Step4 }
//     ];

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
//     const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
//     // Use window.history to go back to Dashboard/Requests Page
//     // const handleBack = () => {
//     //     window.history.back(); 
//     // };

//     // Use window.history.back() or navigate to a specific path
//     const handleBackToDashboard = () => {
//         navigate('/requests'); 
//     };

//     const handleSubmit = async () => {
//         setLoading(true);
//         setError(null);
//         setSuccess(false);
        
//         const token = localStorage.getItem('token');
//         const method = isEditMode ? 'put' : 'post'; // PUT या POST
//         const url = isEditMode ? `${API_BASE_URL}/api/requests/${id}` : `${API_BASE_URL}/api/requests`; // URL
        
//         if (!token) {
//             setError("Error: Not authorized. Please log in again.");
//             setLoading(false);
//             return;
//         }

//         const payload = {
//             ...formData,
//             cost: parseFloat(formData.cost) 
//         };

//         try {
//             // const res = await axios.post(`${API_BASE_URL}/api/requests`, payload, {
//             //     headers: { 'x-auth-token': token }
//             // });
//             // 👇️ UPDATED: Conditional POST or PUT call
//             const res = await axios({
//                  method: method,
//                  url: url,
//                  data: payload,
//                  headers: { 'x-auth-token': token }
//              });
            
//              // Success message को Update करें
//              setSuccess(isEditMode ? 'Request updated successfully! Redirecting...' : 'Request submitted successfully! Redirecting...');
//             // setSuccess(true);
//             // onSave(res.data); 
            
//             // Redirect back to request list after success
//             // setTimeout(handleBackToDashboard, 2000);
//             // 👇️ FIX: /dashboard के बजाय /requests पर रीडायरेक्ट करें और State पास करें
//                 setTimeout(() => {
//                     navigate('/requests', { state: { requestSubmitted: true } });
//                 }, 2000); 
            
//         } catch (err) {
//             console.error("Request Submission Error:", err.response || err);
//             setError(err.response?.data?.msg || "Failed to submit request. Check console.");
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     // Get the current step component
//     const CurrentStepComponent = steps[currentStep - 1].component;


//     return (
//         <div className="flex h-screen overflow-hidden">

//             {/* 👇️ Custom Sidebar for RequestForm: Only Back to Dashboard Link */}
//             <div className=" flex flex-col flex-shrink-0 bg-sky-800 border-r border-gray-200 h-full" style={{ width: '256px' }}>
//                 <div className="h-16 flex items-center justify-center border-b border-gray-200">
//                     <h1 className="text-xl font-normal text-white">ProcureIQ</h1>
//                 </div>
//                 <div className="pt-1 pb-1 overflow-y-auto">
//                     <nav className="space-y-1 px-4">
//                         <button
//                             onClick={handleBackToDashboard}
//                             className={`flex items-center w-full text-white px-4 py-2.5 rounded-lg transition-colors hover:bg-sky-900`}
//                         >
//                             {/* 👇️ FIX: MainLayout के बजाय LayoutDashboard का उपयोग करें */}
//                             <LayoutDashboard className="w-5 h-5 mr-3" /> 
//                             Back to Requests 
//                         </button>
//                     </nav>
//                 </div>
//             </div>

//             <div className=" flex-1 flex flex-col overflow-y-auto ">
             

//                 {/* Main Card */}
//                 <div className=" px-32 bg-gray-50 rounded-xl shadow-2xl p-8">
//                     <h1 className="text-xl font-semibold text-gray-800 mb-2">New Request</h1>
//                     <p className="text-gray-500 mb-8">Complete the form below to submit a new procurement request.</p>

//                     {/* Step Indicator */}
//                     <div className="flex justify-between items-center pb-4 mb-6">
//                         {steps.map((step, index) => (
//                             <div key={index} className="flex flex-col items-center flex-1">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold 
//                                     ${index + 1 === currentStep ? 'bg-sky-500  ' : 
//                                     (index + 1 < currentStep ? 'bg-sky-700' : 'bg-gray-400')}`
//                                 }>
//                                     {index + 1 < currentStep ? <Check className="w-5 h-5" /> : index + 1}
//                                 </div>
//                                 <p className={`mt-2 text-sm font-medium ${index + 1 <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
//                                     {step.label}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Error and Success Messages */}
//                     {error && (
//                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
//                             {error}
//                         </div>
//                     )}
//                     {success && (
//                         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm mb-4">
//                             ✅ Request submitted successfully! Redirecting...
//                         </div>
//                     )}

//                     {/* Current Step Content */}
//                     <CurrentStepComponent 
//                         formData={formData} 
//                         handleChange={handleChange} 
//                         handleNext={handleNext} 
//                         handlePrev={handlePrev} 
//                         handleSubmit={handleSubmit} 
//                         loading={loading}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RequestForm;