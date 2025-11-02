// client/src/components/ConfigureIntegrationForm.jsx

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

// Sync Frequencies and Data Scopes for dropdowns
const SYNC_FREQUENCIES = ['Real-time', 'Hourly', 'Daily', 'Weekly'];
const DATA_SCOPES = ['All contracts', 'Contracts > $50K', 'Only Vendors'];

const ConfigureIntegrationForm = ({ integration, onClose }) => {
    // Initial state based on the current integration status (mocked defaults)
    const [formData, setFormData] = useState({
        apiKey: '',
        apiEndpoint: 'https://api.example.com',
        syncFrequency: integration.syncFrequency || 'Daily',
        dataScope: 'All contracts',
        syncContractDetails: true,
        syncVendorInformation: true,
        syncPaymentSchedules: false,
        syncInvoiceData: false,
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        // --- Mock API Call ---
        // In a real application, you would send formData to the backend:
        // axios.post(`/api/integrations/configure/${integration.id}`, formData, ...)
        
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            
            // In a real app, you might update the parent component's state or re-fetch data
            console.log(`Configuration saved for ${integration.name}:`, formData);
            
            // Optionally close the modal after a short delay
            setTimeout(onClose, 1500); 
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Configure {integration.name}</h3>
                        <p className="text-sm text-gray-500">Update your integration settings and sync preferences.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">Settings saved successfully!</div>
                    )}

                    <div className="space-y-4">
                        {/* 1. API Key */}
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
                        
                        {/* 2. API Endpoint */}
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

                        {/* Checkbox 2 */}
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
                        
                        {/* Checkbox 3 */}
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
                        
                        {/* Checkbox 4 */}
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
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigureIntegrationForm;