// client/src/components/AddVendorForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 , Upload} from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const countryList = [
    'United States', 
    'Canada', 
    'India', 
    'United Kingdom',
    'Germany',
    'Australia',
    'Brazil',
    'Japan',
    'Other'
];

const AddVendorForm = ({ onClose, onVendorAdded }) => {
    const [formData, setFormData] = useState({
        vendorName: '',
        productTool: '',
        category: 'Other', // Default category
        contactPerson: '', // Not in model yet, but in UI, will ignore for backend
        contactEmail: '',
        phoneNumber: '',   // Not in model yet, but in UI, will ignore for backend
        initialSpend: 0,   // Maps to annualSpend
        website: '',       // Not in model yet, but in UI, will ignore for backend
        notes: ''          // Not in model yet, but in UI, will ignore for backend
        ,
        // 👇️ NEW FIELDS ADDED HERE
        registeredId: '', // Company Registered ID
        billingCountry: 'India',
        billingAddress: '',
        billingCity: '',
        billingZip: '',
        companyCountry: 'India',
        companyAddress: '',
        companyCity: '',
        companyZip: '',
    });
      // 👇️ NEW STATE for file upload
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const AllCategories = [
        'Other', 'Productivity', 'Communication', 'Project Management', 
        'Cloud Services', 'Hardware', 'CRM', 'Development', 'Design Software'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     // 👇️ FILE CHANGE HANDLER
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authorization token not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            // Backend Model fields: vendorName, productTool, category, contactEmail, annualSpend, addedBy
            // We will only send these fields to backend, others are UI-only for now.
            // const payload = {
            //     vendorName: formData.vendorName,
            //     productTool: formData.productTool,
            //     category: formData.category,
            //     contactPerson: formData.contactPerson, // 👈️ नया फ़ील्ड
            //     contactEmail: formData.contactEmail,
            //     phoneNumber: formData.phoneNumber,     // 👈️ नया फ़ील्ड
            //     annualSpend: parseFloat(formData.initialSpend) || 0, // renamed initialSpend to annualSpend
            //     registeredId: formData.registeredId, 
            //     billingCountry: formData.billingCountry,
            //     billingAddress: formData.billingAddress,
            //     billingCity: formData.billingCity,
            //     billingZip: formData.billingZip,
            //     companyCountry: formData.companyCountry,
            //     companyAddress: formData.companyAddress,
            //     companyCity: formData.companyCity,
            //     companyZip: formData.companyZip,  website: formData.website,             // 👈️ नया फ़ील्ड
            //     notes: formData.notes                  // 👈️ नया फ़ීल्ड
            // };

             const data = new FormData();
            
            // 1. Append Text Data
            for (const key in formData) {
                // Ensure number values (like initialSpend) are converted correctly
                if (key === 'initialSpend') {
                    data.append('annualSpend', parseFloat(formData.initialSpend) || 0);
                } else {
                    data.append(key, formData[key]);
                }
            }
            
            // 2. Append File Data (backend-এ এটি 'document' হিসাবে পরিচিত হবে)
            if (uploadedFile) {
                data.append('document', uploadedFile);
            }

            const res = await axios.post(`${API_BASE_URL}/api/vendors`, data, {
                headers: { 'x-auth-token': token }
            });

            setSuccess(true);
            setFormData({ // Clear form fields
                vendorName: '', productTool: '', category: 'Other', 
                contactPerson: '', contactEmail: '', phoneNumber: '', 
                initialSpend: 0, website: '', notes: '',
                 registeredId: '', billingCountry: '', billingAddress: '', 
                billingCity: '', billingZip: '', companyCountry: '', 
                companyAddress: '', companyCity: '', companyZip: '',
            });
             setUploadedFile(null);
            onVendorAdded(res.data); // Notify parent component of new vendor
            // onClose(); // Optionally close form after success
            
        } catch (err) {
            console.error("Add Vendor Error:", err.response || err);
            setError(err.response?.data?.msg || 'Failed to add vendor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Create New Vendor</h3>
                        <p className="text-sm text-gray-500">Enter the details of the new vendor to add them to your vendor management system.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Success!</strong>
                            <span className="block sm:inline ml-2">Vendor added successfully.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        {/* Vendor Name */}
                        <div>
                            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Registered Name *
                            </label>
                            <input
                                type="text"
                                id="vendorName"
                                name="vendorName"
                                value={formData.vendorName}
                                onChange={handleChange}
                                placeholder="e.g., Google LLC, Microsoft Corp"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Product/Tool Name */}
                        <div>
                            <label htmlFor="productTool" className="block text-sm font-medium text-gray-700 mb-1">
                                Product/Tool Name 
                            </label>
                            <input
                                type="text"
                                id="productTool"
                                name="productTool"
                                value={formData.productTool}
                                onChange={handleChange}
                                placeholder="e.g., Google Workspace, Slack"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Category */}
                        <div className="col-span-2"> {/* Takes full width */}
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                {AllCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Contact Person (UI only for now) */}
                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="Enter contact name"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Email *
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="contact@vendor.com"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Phone Number (UI only for now) */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Initial Spend */}
                        <div>
                            <label htmlFor="initialSpend" className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Spend
                            </label>
                            <input
                                type="number"
                                id="initialSpend"
                                name="initialSpend"
                                value={formData.initialSpend}
                                onChange={handleChange}
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 👇️ NEW: Company Registered ID */}
                        <div className="col-span-2">
                            <label htmlFor="registeredId" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Registered ID
                            </label>
                            <input
                                type="text"
                                id="registeredId"
                                name="registeredId"
                                value={formData.registeredId}
                                onChange={handleChange}
                                placeholder="e.g., CIN or Tax ID"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        {/* ------------------------------------------------------------- */}
 
                          {/* ------------------------------------------------------------- */}
                        {/* Upload Document Field (NEW) */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Document (Contract, Invoice, etc.)
                            </label>
                            <div className="flex items-center space-x-3">
                                <label className="cursor-pointer bg-white py-2 px-4 border border-sky-600 rounded-lg shadow-sm text-sm font-medium text-sky-600 hover:bg-sky-50 flex items-center transition-colors">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                    <input 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" // Accepted file types
                                    />
                                </label>
                                <span className="text-sm text-gray-500 truncate max-w-xs sm:max-w-md">
                                    {uploadedFile ? uploadedFile.name : 'No file chosen'}
                                </span>
                                {uploadedFile && (
                                    <button 
                                        type="button" 
                                        onClick={() => setUploadedFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}

                        {/* 👇️ NEW SECTION: Billing Address */}
                        <div className="col-span-2 pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Billing Address</h4>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                
                                {/* Billing Country */}
                               {/* Billing Country (SELECT DROPDOWN) */}
                                <div>
                                    <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">Country (देश)</label>
                                    <select
                                        id="billingCountry"
                                        name="billingCountry"
                                        value={formData.billingCountry}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        {countryList.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Billing Address Line */}
                                <div className="col-span-2">
                                    <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                                    <input
                                        type="text"
                                        id="billingAddress"
                                        name="billingAddress"
                                        value={formData.billingAddress}
                                        onChange={handleChange}
                                        placeholder="Street address, P.O. Box, etc."
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                
                                {/* Billing City */}
                                <div>
                                    <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        id="billingCity"
                                        name="billingCity"
                                        value={formData.billingCity}
                                        onChange={handleChange}
                                        placeholder="e.g., Mumbai"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                {/* Billing Zip/Postal Code */}
                                <div>
                                    <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                    <input
                                        type="text"
                                        id="billingZip"
                                        name="billingZip"
                                        value={formData.billingZip}
                                        onChange={handleChange}
                                        placeholder="e.g., 400001"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}


                        {/* 👇️ NEW SECTION: Company Address */}
                        <div className="col-span-2 pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Company Address</h4>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                
                                {/* Company Country */}
                               <div>
                                    <label htmlFor="companyCountry" className="block text-sm font-medium text-gray-700 mb-1">Country (देश)</label>
                                    <select
                                        id="companyCountry"
                                        name="companyCountry"
                                        value={formData.companyCountry}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        {countryList.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Company Address Line */}
                                <div className="col-span-2">
                                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                                    <input
                                        type="text"
                                        id="companyAddress"
                                        name="companyAddress"
                                        value={formData.companyAddress}
                                        onChange={handleChange}
                                        placeholder="Street address, P.O. Box, etc."
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                
                                {/* Company City */}
                                <div>
                                    <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        id="companyCity"
                                        name="companyCity"
                                        value={formData.companyCity}
                                        onChange={handleChange}
                                        placeholder="e.g., Mumbai"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                {/* Company Zip/Postal Code */}
                                <div>
                                    <label htmlFor="companyZip" className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                    <input
                                        type="text"
                                        id="companyZip"
                                        name="companyZip"
                                        value={formData.companyZip}
                                        onChange={handleChange}
                                        placeholder="e.g., 400001"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}

                        {/* Website (UI only for now) */}
                        <div className="col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://vendor.com"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Notes (UI only for now) */}
                        <div className="col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Additional information about the vendor or product/service..."
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            ></textarea>
                        </div>
                    </div>

                    {/* Modal Footer - Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                                loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                            }`}
                            disabled={loading}
                        >
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding...</> : 'Add Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVendorForm;