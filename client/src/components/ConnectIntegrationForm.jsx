// client/src/components/ConnectIntegrationForm.jsx

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const SYNC_FREQUENCIES = ['Real-time', 'Hourly', 'Daily', 'Weekly'];
const DATA_SCOPES = ['All contracts', 'Contracts > $50K', 'Only Vendors'];

const ConnectIntegrationForm = ({ integration, onClose, onIntegrationConnected }) => {
    // Initial state for new connection
    const [formData, setFormData] = useState({
        apiKey: '',
        apiEndpoint: 'https://api.example.com', // Default or pre-filled endpoint
        syncFrequency: 'Daily',
        dataScope: 'All contracts',
        syncContractDetails: true,
        syncVendorInformation: true,
        syncPaymentSchedules: false,
        syncInvoiceData: false,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setError(null);
    //     setSuccess(false);

    //     // --- Mock Connection API Call ---
    //     // In a real application, this would validate credentials (apiKey) with the backend.
        
    //     setTimeout(() => {
    //         setLoading(false);
            
    //         if (!formData.apiKey || formData.apiKey === 'fail') {
    //             setError("Connection failed. Check your API Key and try again.");
    //             return;
    //         }
            
    //         setSuccess(true);
            
    //         // 💡 Parent component को सूचित करें कि यह इंटीग्रेशन अब Connected है
    //         onIntegrationConnected(integration.id, {
    //             status: 'Connected',
    //             syncDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    //             syncFrequency: formData.syncFrequency
    //         });
            
    //         // Close the modal after a short delay
    //         setTimeout(onClose, 1500); 
    //     }, 1500);
    // };

     const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Parent ko data bhejein
    onIntegrationConnected(integration._id, { // _id use karein (MongoDB ID)
        status: 'Connected',
        syncFrequency: formData.syncFrequency,
        clientId: formData.clientId,
        apiKey: formData.apiKey
    });
    
    // (API call ab IntegrationsPage mein ho raha hai, isliye yahan bas close karein)
    // Lekin agar aap chahein toh loading/error handling yahan bhi rakh sakte hain
    
    setTimeout(() => { // Thoda delay UI effect ke liye
        setLoading(false);
        onClose();
    }, 1000);
};

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Connect {integration.name}</h3>
                        <p className="text-sm text-gray-500">Set up your integration to sync contract data automatically.</p>
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
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">Connection successful! Syncing data now...</div>
                    )}

                    <div className="space-y-4">
                        {/* 1. API Key (Required) */}
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                                API Key *
                            </label>
                            <input
                                type="text"
                                id="apiKey"
                                name="apiKey"
                                value={formData.apiKey}
                                onChange={handleChange}
                                placeholder="Enter your API Key"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        
                        {/* 2. API Endpoint (Optional/Default) */}
                        <div>
                            <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                                API Endpoint
                            </label>
                            <input
                                type="url"
                                id="apiEndpoint"
                                name="apiEndpoint"
                                value={formData.apiEndpoint}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                    </div>
                    
                    {/* 3. Sync Settings Grid */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-4 border-t border-gray-200">
                        {/* Sync Frequency */}
                        <div>
                            <label htmlFor="syncFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                                Sync Frequency *
                            </label>
                            <select
                                id="syncFrequency"
                                name="syncFrequency"
                                value={formData.syncFrequency}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                {SYNC_FREQUENCIES.map(freq => (
                                    <option key={freq} value={freq}>{freq}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Data Scope */}
                        <div>
                            <label htmlFor="dataScope" className="block text-sm font-medium text-gray-700 mb-1">
                                Data Scope *
                            </label>
                            <select
                                id="dataScope"
                                name="dataScope"
                                value={formData.dataScope}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                {DATA_SCOPES.map(scope => (
                                    <option key={scope} value={scope}>{scope}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* 4. Sync Options Checkboxes */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <p className="block text-sm font-bold text-gray-800">Sync Options</p>
                        
                        {/* Checkbox 1 */}
                        <div className="flex items-center">
                            <input
                                id="syncContractDetails"
                                name="syncContractDetails"
                                type="checkbox"
                                checked={formData.syncContractDetails}
                                onChange={handleChange}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="syncContractDetails" className="ml-3 block text-sm text-gray-700">
                                Sync contract details
                            </label>
                        </div>

                        {/* ... (Other checkboxes - unchanged) ... */}
                        <div className="flex items-center">
                            <input
                                id="syncVendorInformation"
                                name="syncVendorInformation"
                                type="checkbox"
                                checked={formData.syncVendorInformation}
                                onChange={handleChange}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="syncVendorInformation" className="ml-3 block text-sm text-gray-700">
                                Sync vendor information
                            </label>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                id="syncPaymentSchedules"
                                name="syncPaymentSchedules"
                                type="checkbox"
                                checked={formData.syncPaymentSchedules}
                                onChange={handleChange}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="syncPaymentSchedules" className="ml-3 block text-sm text-gray-700">
                                Sync payment schedules
                            </label>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                id="syncInvoiceData"
                                name="syncInvoiceData"
                                type="checkbox"
                                checked={formData.syncInvoiceData}
                                onChange={handleChange}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <label htmlFor="syncInvoiceData" className="ml-3 block text-sm text-gray-700">
                                Sync invoice data
                            </label>
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
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting...</> : 'Connect'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConnectIntegrationForm;