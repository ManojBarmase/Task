import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, Calendar, DollarSign, RefreshCw } from 'lucide-react';

// API URL Setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper: Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// Helper: Calculate Days Left
const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const UpcomingRenewalsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/contracts`, {
                    headers: { 'x-auth-token': token }
                });
                // Filter only active/pending contracts
                const active = res.data.filter(c => c.renewalStatus !== 'Cancelled');
                setContracts(active);
            } catch (err) {
                console.error("Error fetching contracts", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchContracts();
    }, [token]);

    // --- Filtering Logic ---
    // Critical: 0-30 days
    const criticalRenewals = contracts.filter(c => {
        const days = getDaysLeft(c.end_date);
        return days >= 0 && days <= 30;
    });

    // Soon: 31-60 days
    const soonRenewals = contracts.filter(c => {
        const days = getDaysLeft(c.end_date);
        return days > 30 && days <= 60;
    });

    // Upcoming: 61-90 days
    const upcomingRenewals = contracts.filter(c => {
        const days = getDaysLeft(c.end_date);
        return days > 60 && days <= 90;
    });

    // Metrics
    const totalRenewals90Days = criticalRenewals.length + soonRenewals.length + upcomingRenewals.length;
    const totalValue90Days = [...criticalRenewals, ...soonRenewals, ...upcomingRenewals]
        .reduce((sum, c) => sum + (c.contractValue || 0), 0);

    if (loading) return <div className="p-8 text-center">Loading renewals...</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <button onClick={() => navigate('/contracts')} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contracts
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Upcoming Renewals</h1>
                    <p className="text-gray-500">All contracts expiring within the next 90 days</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4 mr-2" /> Renew Contract
                </button>
            </div>

            {/* Metric Cards (Screenshot 125 Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Total Renewals" value={totalRenewals90Days} subtitle="Next 90 days" icon={<Clock className="text-blue-500" />} />
                <MetricCard title="Critical (≤30 days)" value={criticalRenewals.length} subtitle="Immediate attention" icon={<AlertCircle className="text-red-500" />} isCritical />
                <MetricCard title="Soon (31-60 days)" value={soonRenewals.length} subtitle="Plan ahead" icon={<Calendar className="text-orange-500" />} />
                <MetricCard title="Total Value" value={formatCurrency(totalValue90Days)} subtitle="Renewal value" icon={<DollarSign className="text-green-500" />} />
            </div>

            {/* 1. Critical Renewals Section (Red) */}
            <RenewalSection 
                title="Critical Renewals - Action Required" 
                contracts={criticalRenewals} 
                color="red" 
                icon={<AlertCircle className="w-5 h-5 text-red-600" />}
            />

            {/* 2. Renewals Due 31-60 Days (Orange/Yellow) */}
            <RenewalSection 
                title="Renewals Due in 31-60 Days" 
                contracts={soonRenewals} 
                color="yellow" 
                icon={<Calendar className="w-5 h-5 text-yellow-600" />}
            />

            {/* 3. Renewals Due 61-90 Days (Blue) */}
            <RenewalSection 
                title="Renewals Due in 61-90 Days" 
                contracts={upcomingRenewals} 
                color="blue" 
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
            />

        </div>
    );
};

// --- Sub-Components ---

const MetricCard = ({ title, value, subtitle, icon, isCritical }) => (
    <div className={`bg-white p-5 rounded-xl border ${isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200'} shadow-sm`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="flex items-center space-x-2">
                    {icon}
                    <h3 className={`text-2xl font-bold ${isCritical ? 'text-red-700' : 'text-gray-900'}`}>{value}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </div>
        </div>
    </div>
);

const RenewalSection = ({ title, contracts, color, icon }) => {
    const colors = {
        red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
        blue: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700' }
    };

    const theme = colors[color];

    if (contracts.length === 0) return null; // Don't show empty sections

    return (
        <div className={`rounded-xl border ${theme.border} bg-white shadow-sm overflow-hidden`}>
            <div className={`p-4 ${theme.bg} border-b ${theme.border} flex items-center`}>
                {icon}
                <h3 className={`ml-2 font-semibold ${theme.text}`}>{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-medium">Vendor / Product</th>
                            <th className="p-4 font-medium">End Date</th>
                            <th className="p-4 font-medium">Days Left</th>
                            <th className="p-4 font-medium">Contract Value</th>
                            <th className="p-4 font-medium">Renewal Status</th>
                            <th className="p-4 font-medium">Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {contracts.map(c => {
                            const days = getDaysLeft(c.end_date);
                            return (
                                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{c.vendor?.vendorName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{c.contractTitle}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(c.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.badge}`}>
                                            <Clock className="w-3 h-3 mr-1" /> {days} days
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-900 font-medium">
                                        {formatCurrency(c.contractValue)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${c.renewalStatus === 'Auto-Renew' ? 'bg-green-100 text-green-800' : 
                                              c.renewalStatus === 'Manual Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {c.renewalStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {c.contactPerson || c.vendor?.contactPerson?.name || 'N/A'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpcomingRenewalsPage;