// client/src/components/AddVendorForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    });
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
            const payload = {
                vendorName: formData.vendorName,
                productTool: formData.productTool,
                category: formData.category,
                contactPerson: formData.contactPerson, // 👈️ नया फ़ील्ड
                contactEmail: formData.contactEmail,
                phoneNumber: formData.phoneNumber,     // 👈️ नया फ़ील्ड
                annualSpend: parseFloat(formData.initialSpend) || 0, // renamed initialSpend to annualSpend
                website: formData.website,             // 👈️ नया फ़ील्ड
                notes: formData.notes                  // 👈️ नया फ़ීल्ड
            };

            const res = await axios.post(`/api/vendors`, payload, {
                headers: { 'x-auth-token': token }
            });

            setSuccess(true);
            setFormData({ // Clear form fields
                vendorName: '', productTool: '', category: 'Other', 
                contactPerson: '', contactEmail: '', phoneNumber: '', 
                initialSpend: 0, website: '', notes: ''
            });
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
                        <h3 className="text-xl font-bold text-gray-900">Add New Vendor</h3>
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
                                Vendor Name *
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
                                Product/Tool Name *
                            </label>
                            <input
                                type="text"
                                id="productTool"
                                name="productTool"
                                value={formData.productTool}
                                onChange={handleChange}
                                placeholder="e.g., Google Workspace, Slack"
                                required
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