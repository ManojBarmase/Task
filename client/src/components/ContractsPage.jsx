// client/src/components/ContractsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, Upload, CornerUpRight } from 'lucide-react';
import UploadContractForm from './UploadContractForm';
import RenewContractForm from './RenewContractForm';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (amount) => {
    // Format to $X,XXX or $X.XK for display
    if (amount >= 100000) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 0
        }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// Utility function to calculate days left
const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Status Pill Component for Renewal Status
const getRenewalPill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full';
    
    switch (status) {
        case 'Auto-Renew':
            classes += ' bg-green-100 text-green-800';
            break;
        case 'Manual Review':
            classes += ' bg-yellow-100 text-yellow-800';
            break;
        case 'Cancelled':
            classes += ' bg-red-100 text-red-800';
            break;
        case 'Pending':
        default:
            classes += ' bg-blue-100 text-blue-800';
            break;
    }

    return <span className={classes}>{status}</span>;
};

// Days Expiry Pill
const getExpiryPill = (daysLeft) => {
    let classes = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full';
    let text;
    
    if (daysLeft < 0) {
        classes += ' bg-red-500 text-white';
        text = 'Expired';
    } else if (daysLeft <= 30) {
        classes += ' bg-red-100 text-red-800 border border-red-300';
        text = `${daysLeft} days`;
    } else if (daysLeft <= 90) {
        classes += ' bg-orange-100 text-orange-800';
        text = `${daysLeft} days`;
    } else {
        classes += ' bg-gray-100 text-gray-700';
        text = `${daysLeft} days`;
    }

    return <span className={classes}>{text}</span>;
};


const ContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showRenewForm, setShowRenewForm] = useState(false);
    const token = localStorage.getItem('token');

   

    // Fetch Contracts
   // 1. Fetch Contracts लॉजिक को useCallback के साथ अलग करें
    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/contracts`, {
                headers: { 'x-auth-token': token }
            });
            setContracts(res.data);
        } catch (err) {
            console.error("Contracts Fetch Error:", err.response || err);
            setError("Failed to load contract data.");
        } finally {
            setLoading(false);
        }
    }, [token]); // token बदलने पर ही फंक्शन री-क्रिएट होगा

    // 2. useEffect अब सिर्फ़ fetchContracts को कॉल करता है
    useEffect(() => {
        if (token) {
            fetchContracts();
        }
    }, [token, fetchContracts]); // fetchContracts को dependency array में जोड़ें
    
    
    // 3. Contract Added Handler (जो अब data re-fetch करेगा)
    const handleContractAdded = () => {
        setShowUploadForm(false); // फ़ॉर्म बंद करें
        fetchContracts(); // 👈️ Backend से नई लिस्ट तुरंत फ़ेच करें
    };

    // Function to handle a contract being renewed
    const handleContractRenewed = () => {
        setShowRenewForm(false); // फ़ॉर्म बंद करें
        fetchContracts(); // Re-fetch the list
    };

    // Calculate Metrics (based on Screenshot 20/21/23)
    const activeContracts = contracts.filter(c => getDaysLeft(c.end_date) >= 0 && c.renewalStatus !== 'Cancelled').length;
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
    const expiringSoon = contracts.filter(c => {
        const days = getDaysLeft(c.end_date);
        return days > 0 && days <= 90 && c.renewalStatus !== 'Cancelled';
    }).length;
    const autoRenewCount = contracts.filter(c => c.renewalStatus === 'Auto-Renew').length;

    // Side Panel Data
    const manualReviewRequired = contracts.filter(c => c.renewalStatus === 'Manual Review' && getDaysLeft(c.end_date) > 0);
    const expiringIn30Days = contracts.filter(c => {
        const days = getDaysLeft(c.end_date);
        return days > 0 && days <= 30 && c.renewalStatus !== 'Cancelled';
    });
    
    // Summary Mock Data (since we don't have enough data to calculate these complex metrics)
    const avgContractValue = totalContractValue / (activeContracts || 1);
    const cancelledContracts = contracts.filter(c => c.renewalStatus === 'Cancelled').length;
    const autoRenewRate = activeContracts > 0 ? (autoRenewCount / activeContracts) * 100 : 0;


    if (loading) return <div className="p-6 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Contract Directory...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-6 rounded-lg">{error}</div>;


    return (
        <div className="flex bg-gray-50 min-h-full">
            
            {/* Left Content Column */}
            <div className="flex-1 p-6 space-y-6">
                
                {/* Header and Buttons */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800">Contracts & Renewals</h1>
                    <div className="flex space-x-3">
                         <button
                            onClick={() => setShowRenewForm(true)}
                            className="flex items-center px-2 py-1 text-sm bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
                            <CornerUpRight className="w-5 h-5 mr-2" />
                            Renew Contract
                        </button>
                        <button
                        onClick={() => setShowUploadForm(true)}
                        className="flex items-center px-2 py-1 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                            <Upload className="w-5 h-5 mr-2" />
                            Upload New Contract
                        </button>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Active Contracts</p>
                        <div className="text-3xl font-normal text-gray-900">{activeContracts}</div>
                        <p className="text-xs text-gray-500">{activeContracts} total contracts</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Total Value</p>
                        <div className="text-3xl font-normal text-gray-900 ">{formatCurrency(totalContractValue)}</div>
                        <p className="text-xs text-gray-500">Annual contract value</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Expiring Soon</p>
                        <div className="text-3xl font-normal text-gray-900">{expiringSoon}</div>
                        <p className="text-xs text-gray-500">Within 90 days</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Auto-Renew</p>
                        <div className="text-3xl font-normal text-gray-900">{autoRenewCount}</div>
                        <p className="text-xs text-gray-500">Set for auto-renew</p>
                    </div>
                </div>

                {/* Contract Directory */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Contract Directory</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Expiry</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contracts.map((contract) => (
                                    <tr key={contract._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{contract.vendor?.vendorName || 'N/A'}</span>
                                                <span className="text-xs text-gray-500">{contract.vendor?.productTool || contract.contractTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{new Date(contract.start_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{new Date(contract.end_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(contract.contractValue)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">{getRenewalPill(contract.renewalStatus)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">{getExpiryPill(getDaysLeft(contract.end_date))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {contracts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No contracts found.</div>
                    )}
                </div>

            </div>

            {/* Right Sidebar Column */}
            <div className="w-60 p-6 bg-white border-l border-gray-200 rounded-md flex-shrink-0 space-y-6">
                
                {/* Upcoming Renewals (MOCK Data based on Screenshot 20) */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-600">Upcoming Renewals</h3>
                    {contracts.slice(0, 5).map((c) => ( // Show top 5 soonest expiring
                         <div key={c._id + 'upcoming'} className=" p-3 bg-red-50 border border-gray-200 rounded-lg">
                            <p className="text-sm font-normal text-gray-900">{c.vendor?.vendorName || c.contractTitle}</p>
                            <div className='flex justify-between'>
                               <p className="text-xs text-gray-500">{new Date(c.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                               {getExpiryPill(getDaysLeft(c.end_date))}
                            </div> 
                        </div>
                    ))}
                    {contracts.length === 0 && <p className="text-sm text-gray-500">No renewals pending.</p>}
                </div>


                {/* Renewal Alerts (MOCK Data based on Screenshot 21) */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-base font-semibold text-gray-600">Renewal Alerts</h3>
                    
                    {/* Manual Review Required */}
                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg space-y-1">
                        <p className="text-base font-normal text-yellow-800">Manual Review Required</p>
                        <p className="text-sm text-yellow-700">{manualReviewRequired.length} contracts need review</p>
                    </div>

                    {/* Expiring Soon */}
                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg space-y-1">
                        <p className="text-base font-normal text-orange-800">Expiring Soon</p>
                        <p className="text-sm text-orange-700">{expiringIn30Days.length} contracts expire within 30 days</p>
                    </div>
                    
                    {/* Pending Actions (Placeholder) */}
                    <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg space-y-1">
                        <p className="text-base font-normal text-blue-800">Pending Actions</p>
                        <p className="text-sm text-blue-700">1 contracts pending approval</p>
                    </div>
                </div>


                {/* Contract Summary (MOCK Data based on Screenshot 23) */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-base font-normal text-gray-800">Contract Summary</h3>
                    
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Auto-Review Rate</span>
                            <span className="font-semibold text-sky-600">{autoRenewRate.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Avg Contract Value</span>
                            <span className="font-semibold">{formatCurrency(avgContractValue)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Cancelled Contracts</span>
                            <span className="font-semibold">{cancelledContracts}</span>
                        </div>
                    </div>
                </div>

                
                {/* Integrations Placeholder (from Screenshot 23) */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-base font-normal text-gray-800 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-sky-600" />
                        Integrations
                    </h3>
                    <p className="text-sm text-gray-600">Connect your ERP and CRM systems to sync contract data automatically</p>
                    <button className="text-sm text-sky-600 hover:text-sky-800 font-medium">Manage Integrations</button>
                </div>

            </div>

            {/* 👇️ Upload Contract Form (Modal) */}
            {showUploadForm && (
                <UploadContractForm 
                    onClose={() => setShowUploadForm(false)} 
                    onContractAdded={handleContractAdded}
                />
            )}


            {/* 👇️ Renew Contract Form (Modal) */}
            {showRenewForm && (
                <RenewContractForm 
                    onClose={() => setShowRenewForm(false)} 
                    onContractRenewed={handleContractRenewed}
                />
            )}
        </div>
    );
};

export default ContractsPage;