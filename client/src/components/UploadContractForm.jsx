// client/src/components/UploadContractForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Upload } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const UploadContractForm = ({ onClose, onContractAdded }) => {
    const [formData, setFormData] = useState({
        vendorId: '',
        contractTitle: '', // Maps to Product/Service Name for simplicity
        start_date: '',
        end_date: '',
        contractValue: 0,
        renewalStatus: 'Pending',
        paymentFrequency: 'Monthly', // UI field, not in model
        contactPerson: '',           // UI field, not in model
        uploadedFileName: ''         // UI field, for file name display
    });
    const [vendors, setVendors] = useState([]); // To store the list of vendors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem('token');

    // Fetch Vendors for the dropdown
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/vendors`, {
                    headers: { 'x-auth-token': token }
                });
                setVendors(res.data);
            } catch (err) {
                console.error("Vendors Fetch Error:", err.response || err);
            }
        };

        if (token) {
            fetchVendors();
        }
    }, [token]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // If they select a vendor, use its productTool as contractTitle default
        if (name === 'vendorId') {
            const vendor = vendors.find(v => v._id === value);
            if (vendor) {
                setFormData(prev => ({ ...prev, contractTitle: vendor.productTool || '' }));
            }
        }
    };
    
    // Handle File Input Change (for UI display only)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ 
            ...prev, 
            uploadedFileName: file ? file.name : ''
            // In a real app, you'd handle file upload here (e.g., using FormData)
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Frontend UI field mapping to Backend Model fields:
            const payload = {
                vendorId: formData.vendorId, // Backend uses 'vendor' (ID)
                contractTitle: formData.contractTitle, 
                start_date: formData.start_date,
                end_date: formData.end_date,
                contractValue: parseFloat(formData.contractValue) || 0,
                renewalStatus: formData.renewalStatus, // Default is Pending
            };

            const res = await axios.post(`${API_BASE_URL}/api/contracts`, payload, {
                headers: { 'x-auth-token': token }
            });

            setSuccess(true);
            onContractAdded(res.data); // Notify parent component
            
        } catch (err) {
            console.error("Upload Contract Error:", err.response || err);
            setError(err.response?.data?.msg || 'Failed to upload contract. Please ensure all required fields are correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Upload New Contract</h3>
                        <p className="text-sm text-gray-500">Add a new vendor contract to the system.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">Contract uploaded successfully!</div>
                    )}

                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        {/* Vendor Dropdown (Instead of text input) */}
                        <div>
                            <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Name *
                            </label>
                            <select
                                id="vendorId"
                                name="vendorId"
                                value={formData.vendorId}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={!vendors.length}
                            >
                                <option value="" disabled>Select a Vendor</option>
                                {!vendors.length && <option value="" disabled>Loading vendors...</option>}
                                {vendors.map(vendor => (
                                    <option key={vendor._id} value={vendor._id}>
                                        {vendor.vendorName} ({vendor.productTool})
                                    </option>
                                ))}
                            </select>
                            {vendors.length === 0 && <p className="text-xs text-red-500 mt-1">No vendors found. Please add vendors first.</p>}
                        </div>

                        {/* Product/Service Name (Maps to contractTitle) */}
                        <div>
                            <label htmlFor="contractTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                Product/Service *
                            </label>
                            <input
                                type="text"
                                id="contractTitle"
                                name="contractTitle"
                                value={formData.contractTitle}
                                onChange={handleChange}
                                placeholder="e.g., Google Workspace"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date *
                            </label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Contract Value */}
                        <div>
                            <label htmlFor="contractValue" className="block text-sm font-medium text-gray-700 mb-1">
                                Contract Value *
                            </label>
                            <input
                                type="number"
                                id="contractValue"
                                name="contractValue"
                                value={formData.contractValue}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Payment Frequency (UI Only) */}
                        <div>
                            <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Frequency
                            </label>
                            <select
                                id="paymentFrequency"
                                name="paymentFrequency"
                                value={formData.paymentFrequency}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option>Monthly</option>
                                <option>Quarterly</option>
                                <option>Annually</option>
                                <option>One-Time</option>
                            </select>
                        </div>
                        
                        {/* Contact Person (UI Only) */}
                        <div className="col-span-2">
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

                        {/* Upload  Document */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Document
                            </label>
                            <div className="flex items-center space-x-3">
                                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                    <input 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange}
                                        // In a real app, you'd integrate file handling library here
                                    />
                                </label>
                                <span className="text-sm text-gray-500">
                                    {formData.uploadedFileName || 'No file chosen'}
                                </span>
                            </div>
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
                            disabled={loading || !formData.vendorId} // Disable if no vendor is selected
                        >
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</> : 'Upload Contract'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadContractForm;