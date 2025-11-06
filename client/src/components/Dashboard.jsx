 // client/src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Search, Clock, TrendingUp, DollarSign, Users, CheckSquare, Plus } from 'lucide-react';
import RequestForm from './RequestForm';
import { useNavigate } from 'react-router-dom';


// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Helper function for formatting currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

const Dashboard = () => {
    const [metrics, setMetrics] = useState({});
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    // const { hasRole } = useAuth();

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Check if user is an Approver or Admin
    const isApprover = userRole === 'approver' || userRole === 'admin';
   // 👇️ NEW: Check if user is an Employee
    const isEmployee = userRole === 'employee';

const navLinks = [
    { name: 'Dashboard', icon: CheckSquare, href: '/dashboard', current: true , show: true},
    { name: 'Requests', icon: Clock, href: '/requests', current: false , show: true},
    { name: 'Approvals', icon: CheckSquare, href: '/approvals', current: false , show: isApprover},
    { name: 'Vendors', icon: Users, href: '/vendors', current: false, show: true },
    { name: 'Contracts', icon: DollarSign, href: '/contracts', current: false, show: true },
    { name: 'Integrations', icon: TrendingUp, href: '/integrations', current: false, show: true },
    { name: 'Analytics', icon: Clock, href: '/analytics', current: false, show: true },
];

    useEffect(() => {
        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Metrics (Cards Data)
                const metricsRes = await axios.get(`/api/dashboard/metrics`, {
                    headers: { 'x-auth-token': token }
                });
                setMetrics(metricsRes.data);

                // 2. Fetch Recent Requests (Table Data)
                const requestsRes = await axios.get(`/api/requests`, {
                    headers: { 'x-auth-token': token }
                });
                // Mock data population (requester name is stored in req.data.requester.name)
                const processedRequests = requestsRes.data.map(req => ({
                    ...req,
                    requesterName: req.requester.name || 'N/A' 
                }));
                setRequests(processedRequests.slice(0, 6)); // Only show top 6 recent requests

            } catch (err) {
                console.error("Dashboard Data Fetch Error:", err.response || err);
                setError("Failed to load dashboard data. Access Denied or Server Error.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);


// Function to handle saving new request
const handleNewRequestSave = (newRequest) => {
    // New request को requests list के शीर्ष पर जोड़ें (UI अपडेट)
    setRequests(prevRequests => [newRequest, ...prevRequests.slice(0, 5)]); 
    // Metrics को भी अपडेट करें (Pending count बढ़ाएँ)
    setMetrics(prevMetrics => ({
        ...prevMetrics,
        pendingRequests: prevMetrics.pendingRequests + 1
    }));
};


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '/'; // Redirect to login page
    };

    // Helper to get status pill style
    const getStatusPill = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
            case 'Rejected':
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
            case 'In Review':
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Review</span>;
            case 'Pending':
            default:
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
        }
    };
    
    if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 p-10">{error}</div>;


    return (
        <>
           
     <div className="p-8 pb-52 bg-gray-50 space-y-6">
                     <div className="flex justify-between items-center">
                       <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                       
                        {/* 👇️ UPDATED: Conditional Rendering based on isEmployee */}
                        {isEmployee && (
                        <button 
                            onClick={() => navigate('/requests/new')}
                            className="flex items-center px-2 py-1 bg-sky-600 text-white text-sm font-semibold rounded-md shadow-lg hover:bg-sky-500 transition-all transform "
                        >
                        <Plus className="w-4 h-4 mr-2" />
                            New Request
                        </button>
                        )}
                        {/* 👆️ END of Conditional Rendering */}
                     </div>

           
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-4 gap-6">
                        {/* Card 1: Pending Requests */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Pending Requests</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.pendingRequests || 0}</div>
                            <p className="text-xs text-gray-500">-3 from last week</p>
                        </div>
                        
                        {/* Card 2: Upcoming Renewals */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Upcoming Renewals</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.upcomingRenewals || 0}</div>
                            <p className="text-xs text-gray-500">Next 30 days</p>
                        </div>
                        
                        {/* Card 3: Total Spend */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Total Spend</p>
                            <div className="text-3xl font-normal text-gray-900">{formatCurrency(metrics.totalSpend || 0)}</div>
                            <p className="text-xs text-gray-500">-12% from last month</p>
                        </div>
                        
                        {/* Card 4: Vendors in Review */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Vendors in Review</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.vendorsInReview || 0}</div>
                            <p className="text-xs text-gray-500">Awaiting approval</p>
                        </div>
                    </div>

                    {/* Recent Requests Table */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Purchase Requests</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Request Title</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request._id}>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.title}</td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requesterName}</td> */}
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.department}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(request.cost)}</td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                {getStatusPill(request.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {requests.length === 0 && <p className="text-center py-4 text-gray-500">No recent requests found.</p>}
                    </div>

                
     
              {/* 👇️👇️ RequestForm को यहाँ, मुख्य <div> के बाद जोड़ें: 👇️👇️  */}
                {showForm && <RequestForm 
                 onClose={() => setShowForm(false)} 
                 onSave={handleNewRequestSave}
             />}
              {/* 👆️👆️ यह सुनिश्चित करता है कि यह Dashboard कंपोनेंट के स्कोप में है  */}
     </div>         
</>
    );


};

export default Dashboard;
