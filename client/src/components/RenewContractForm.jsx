// client/src/components/RenewContractForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, RefreshCw } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RENEWAL_STATUSES = ['Auto-Renew', 'Manual Review', 'Pending', 'Cancelled'];

const RenewContractForm = ({ onClose, onContractRenewed }) => {
    // Contract data from the database
    const [contracts, setContracts] = useState([]); 
    
    // Form state (stores selected and updated values)
    const [formData, setFormData] = useState({
        selectedContractId: '',
        newStartDate: '',
        newEndDate: '',
        contractValue: 0,
        renewalStatus: 'Auto-Renew',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [dataLoading, setDataLoading] = useState(true); // For initial contract data load
    const token = localStorage.getItem('token');

    // Fetch Contracts (to populate the dropdown)
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                // Fetch only contracts that are not cancelled or expired (for renewal)
                const res = await axios.get(`/api/contracts`, {
                    headers: { 'x-auth-token': token }
                });
                setContracts(res.data.filter(c => c.renewalStatus !== 'Cancelled' && new Date(c.end_date) >= new Date()));
            } catch (err) {
                console.error("Contracts Fetch Error:", err.response || err);
                setError("Failed to load existing contracts.");
            } finally {
                setDataLoading(false);
            }
        };

        if (token) {
            fetchContracts();
        }
    }, [token]);
    
    // When a contract is selected, pre-populate values (optional but helpful)
    const handleContractSelect = (e) => {
        const contractId = e.target.value;
        const selectedContract = contracts.find(c => c._id === contractId);
        
        // Reset form data and use current values as defaults
        if (selectedContract) {
            setFormData({
                selectedContractId: contractId,
                newStartDate: selectedContract.end_date ? new Date(selectedContract.end_date).toISOString().split('T')[0] : '', // Day after end date
                newEndDate: '', // Let user fill the new end date
                contractValue: selectedContract.contractValue || 0,
                renewalStatus: selectedContract.renewalStatus || 'Auto-Renew',
            });
        } else {
            setFormData(prev => ({ ...prev, selectedContractId: contractId }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        const { selectedContractId, newStartDate, newEndDate, contractValue, renewalStatus } = formData;

        if (!selectedContractId) {
            setError("Please select a contract to renew.");
            setLoading(false);
            return;
        }

        try {
            // Prepare payload for the update route (PUT/PATCH)
            const payload = {
                start_date: newStartDate, // We treat this as the new lastRenewed date
                end_date: newEndDate,
                contractValue: parseFloat(contractValue) || 0,
                renewalStatus: renewalStatus,
                lastRenewed: new Date().toISOString() // Set last renewed to now
            };
            
            // Send the update request
            const res = await axios.put(`/api/contracts/${selectedContractId}`, payload, {
                headers: { 'x-auth-token': token }
            });

            setSuccess(true);
            // Inform parent component to re-fetch/update the list
            onContractRenewed(res.data); 
            
        } catch (err) {
            console.error("Renew Contract Error:", err.response || err);
            setError(err.response?.data?.msg || 'Failed to renew contract. Please check date format and required fields.');
        } finally {
            setLoading(false);
        }
    };

    const selectedContract = contracts.find(c => c._id === formData.selectedContractId);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Renew Contract</h3>
                        <p className="text-sm text-gray-500">Select a contract to renew and update the renewal terms.</p>
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
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">Contract renewed successfully!</div>
                    )}

                    <div className="grid grid-cols-1 gap-y-4">
                        {/* 1. Select Contract */}
                        <div>
                            <label htmlFor="selectedContractId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Contract *
                            </label>
                            <select
                                id="selectedContractId"
                                name="selectedContractId"
                                value={formData.selectedContractId}
                                onChange={handleContractSelect} // Use specific handler for selection
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={dataLoading}
                            >
                                <option value="" disabled>Choose a contract</option>
                                {dataLoading && <option value="" disabled>Loading contracts...</option>}
                                {contracts.map(contract => (
                                    <option key={contract._id} value={contract._id}>
                                        {contract.vendor?.vendorName || contract.contractTitle} ({new Date(contract.end_date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            {selectedContract && (
                                <p className="text-xs text-gray-500 mt-1">Current End Date: {new Date(selectedContract.end_date).toLocaleDateString()}</p>
                            )}
                        </div>
                        
                        {/* 2. New Start Date (Maps to the new Last Renewed Date) */}
                        <div>
                            <label htmlFor="newStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                                New Start Date *
                            </label>
                            <input
                                type="date"
                                id="newStartDate"
                                name="newStartDate"
                                value={formData.newStartDate}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={!formData.selectedContractId}
                            />
                        </div>

                        {/* 3. New End Date */}
                        <div>
                            <label htmlFor="newEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                                New End Date *
                            </label>
                            <input
                                type="date"
                                id="newEndDate"
                                name="newEndDate"
                                value={formData.newEndDate}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={!formData.selectedContractId}
                            />
                        </div>

                        {/* 4. Contract Value */}
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
                                placeholder="Enter contract value"
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={!formData.selectedContractId}
                            />
                        </div>
                        
                        {/* 5. Renewal Status */}
                        <div>
                            <label htmlFor="renewalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                Renewal Status
                            </label>
                            <select
                                id="renewalStatus"
                                name="renewalStatus"
                                value={formData.renewalStatus}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                disabled={!formData.selectedContractId}
                            >
                                {RENEWAL_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
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
                            disabled={loading || !formData.selectedContractId} 
                        >
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Renewing...</> : 'Renew Contract'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenewContractForm;