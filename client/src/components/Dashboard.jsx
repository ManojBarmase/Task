// client/src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Search, Clock, TrendingUp, DollarSign, Users, CheckSquare, Plus , SlidersHorizontal, X, Loader2} from 'lucide-react';
import RequestForm from './RequestForm';
import { useNavigate } from 'react-router-dom';


const API_BASE_URL = import.meta.env.VITE_API_URL;


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
    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    // ✅ NEW:
    const [mainLoading, setMainLoading] = useState(true); // केवल पहली बार पेज लोड के लिए
    const [tableLoading, setTableLoading] = useState(false); // फ़िल्टरिंग के दौरान टेबल के लिए
    const navigate = useNavigate();
    // const { hasRole } = useAuth();

     // 👈️ नया स्टेट: फ़िल्टर मूल्यों को ट्रैक करने के लिए
    const [filters, setFilters] = useState({
        department: 'All Departments',
        costRange: 'All Ranges', // या कोई डिफ़ॉल्ट रेंज
        status: 'All Statuses'
    });
    // 👈️ नया स्टेट: फ़िल्टर पैनल को टॉगल करने के लिए
    const [isFilterOpen, setIsFilterOpen] = useState(false); 

    // ⭐ NEW: Employee specific metrics
    const [employeeMetrics, setEmployeeMetrics] = useState({
        pendingCount: 0,
        inReviewCount: 0,
        approvedCount: 0,
    });

    // फ़िल्टर इनपुट बदलने पर हैंडलर
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        // NOTE: वास्तविक एप्लिकेशन में, आपको यहां एक API कॉल ट्रिगर करना होगा
    }; 

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Check if user is an Approver or Admin
    const isApprover = userRole === 'approver' || userRole === 'admin';
   // 👇️ NEW: Check if user is an Employee
    const isEmployee = userRole === 'employee';

    // ⭐ NEW: This boolean controls which set of cards to display
    const showAdminMetrics = isApprover;

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
            // 💡 यदि यह पहली बार लोड हो रहा है, तो mainLoading शुरू करें
            if (mainLoading) { 
                setMainLoading(true);
            } else {
                // 💡 यदि फ़िल्टर बदल गया है, तो tableLoading शुरू करें
                setTableLoading(true); 
            }
            //  setLoading(true); 
            setError(null);

            // 👈️ नया लॉजिक: फ़िल्टर को URL Query String में बदलें
            const { department, costRange, status } = filters;
            
            // कॉस्ट रेंज को Min/Max में पार्स करें (उदा. '$1K - $10K' -> 1000, 10000)
            let minCost = 0;
            let maxCost = 9999999; // एक बड़ी संख्या
            
            if (costRange !== 'All Ranges') {
                 const range = costRange.replace(/[$,K\+]/g, '').split(' - ');
                 minCost = parseInt(range[0] * (range[0].length <= 3 ? 1000 : 1)); // K को संभालना
                 
                 if (costRange.includes('+')) {
                     maxCost = 9999999; 
                 } else if (range.length > 1) {
                     maxCost = parseInt(range[1] * (range[1].length <= 3 ? 1000 : 1));
                 }
            }
            
            const queryParams = new URLSearchParams({
                department: department === 'All Departments' ? '' : department,
                status: status === 'All Statuses' ? '' : status,
                minCost: minCost,
                maxCost: maxCost,
                // ⭐ NEW: Add a parameter to filter by user ID if Employee is logged in
                // (मान लें कि आपका बैकएंड /api/requests?isEmployee=true पर यूज़र के रिक्वेस्ट फ़िल्टर करता है)
                isEmployee: isEmployee ? true : ''
            }).toString();

            try {
                // 1. Fetch Metrics (Cards Data)
                const metricsRes = await axios.get(`${API_BASE_URL}/api/dashboard/metrics`, {
                    headers: { 'x-auth-token': token }
                });
                setMetrics(metricsRes.data);

                // 2. Fetch Recent Requests (Table Data)
                // const requestsRes = await axios.get(`${API_BASE_URL}/api/requests`, {
                //     headers: { 'x-auth-token': token }
                // });
               // 👈️ Query Parameters को URL में जोड़ें
                const requestsRes = await axios.get(`${API_BASE_URL}/api/requests?${queryParams}`, {
                    headers: { 'x-auth-token': token }
                });

                // Mock data population (requester name is stored in req.data.requester.name)
                const processedRequests = requestsRes.data.map(req => ({
                    ...req,
                    requesterName: req.requester.name || 'N/A' 
                }));
                setRequests(processedRequests.slice(0, 6)); // Only show top 6 recent requests
               
                // ⭐ NEW: Calculate Employee Metrics from fetched requests (if Employee)
                if (isEmployee) {
                    const counts = processedRequests.reduce((acc, req) => {
                        if (req.status === 'Pending') acc.pendingCount += 1;
                        if (req.status === 'In Review') acc.inReviewCount += 1;
                        if (req.status === 'Approved') acc.approvedCount += 1;
                        return acc;
                    }, { pendingCount: 0, inReviewCount: 0, approvedCount: 0 });
                    setEmployeeMetrics(counts);
                }
            } catch (err) {
                console.error("Dashboard Data Fetch Error:", err.response || err);
                setError("Failed to load dashboard data. Access Denied or Server Error.");
            } finally {
                // setLoading(false);
                // दोनों लोडिंग स्टेट को बंद करें
                setMainLoading(false);
                setTableLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, filters, isEmployee, showAdminMetrics]);


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
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">Approved</span>;
            case 'Rejected':
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-200 text-red-800 rounded-full">Rejected</span>;
            case 'In Review':
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded-full">In Review</span>;
            case 'Pending':
            default:
                return <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">Pending</span>;
        }
    };
    
   
    // if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading Dashboard...</div>;
    if (mainLoading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading Dashboard...</div>;
// 💡 केवल पहली बार पेज लोड होने पर ही यह पूरे पेज को ब्लॉक करेगा।
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 p-10">{error}</div>;
    
     // फ़िल्टर पैनल को टॉगल करने के लिए फंक्शन
    const toggleFilterPanel = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    // ⭐ NEW: Employee Metric Cards (Destructure for clean access)
    const { pendingCount, inReviewCount, approvedCount } = employeeMetrics;

    return (
        <>
           
     <div className="p-8 pb-52 bg-gray-50 space-y-6">
            <div className="flex justify-between items-center relative"> {/* 👈️ 'relative' जोड़ा गया FilterPanel की स्थिति के लिए */}
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                
                <div className="flex items-center space-x-4">
                    {/* New Request Button (Keep existing conditional rendering) */}
                    {isEmployee && (
                         <button 
                             onClick={() => navigate('/requests/new')}
                             className="flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-md shadow-lg hover:bg-sky-500 transition-all transform "
                         >
                            <Plus className="w-4 h-4 mr-2" />
                            New Request
                         </button>
                    )}
                    
                    {/* 👈️ FILTER BUTTON */}
                    <button 
                        onClick={toggleFilterPanel}
                        type="button"
                        className={`flex items-center px-4 py-2 border rounded-md text-sm font-semibold transition-colors ${isFilterOpen ? 'bg-sky-100 border-sky-600 text-sky-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" /> {/* SlidersHorizontal को lucide-react से आयात करें */}
                        Filters
                    </button>
                </div>
            </div>

          
          {/* 2. 💡 नया फ़िल्टर पैनल (केवल जब isFilterOpen true हो) */}
            {isFilterOpen && (
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Filter Dashboard Data</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        
                        {/* 1. Department Filter */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <select
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="All Departments">All Departments</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                <option value="R&D">R&D</option>
                            </select>
                        </div>

                        {/* 2. Status Filter (जोड़ने के लिए कहा गया था) */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="All Statuses">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Review">In Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        
                        {/* 3. Cost Range Filter */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Cost Range</label>
                            <select
                                name="costRange"
                                value={filters.costRange}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="All Ranges">All Ranges</option>
                                <option value="$0 - $1K">$0 - $1K</option>
                                <option value="$1K - $10K">$1K - $10K</option>
                                <option value="$10K+">$10K+</option>
                            </select>
                        </div>
                        
                        {/* 4. Action Button (Reset/Apply) */}
                        <div className="pt-7 flex space-x-2">
                             <button 
                                onClick={() => { /* Add reset logic here */ }}
                                type="button"
                                className="w-1/2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Reset
                            </button>
                             <button 
                                onClick={toggleFilterPanel}
                                type="button"
                                className="w-1/2 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
           
                    {/* 🎯 Metric Cards - Conditional Rendering based on Role */}
            {showAdminMetrics ? (
                    
                    <div className="grid grid-cols-4 gap-6">

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Pending Requests</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.pendingRequests || 0}</div>
                            <p className="text-xs text-gray-500">-3 from last week</p>
                        </div>
                       
                        
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Upcoming Renewals</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.upcomingRenewals || 0}</div>
                            <p className="text-xs text-gray-500">Next 30 days</p>
                        </div>
                        
                   
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Total Spend</p>
                            <div className="text-3xl font-normal text-gray-900">{formatCurrency(metrics.totalSpend || 0)}</div>
                            <p className="text-xs text-gray-500">-12% from last month</p>
                        </div>
                        
                       
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">Vendors in Review</p>
                            <div className="text-3xl font-normal text-gray-900">{metrics.vendorsInReview || 0}</div>
                            <p className="text-xs text-gray-500">Awaiting approval</p>
                        </div>
                    </div>
            ) : (
                   
                    <div className="grid grid-cols-3 gap-6 mb-6">
                       
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">My Pending Requests</p>
                            <div className="text-3xl font-normal text-gray-900">{pendingCount}</div>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                        </div>
                        
                      
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">My Requests In Review</p>
                            <div className="text-3xl font-normal text-gray-900">{inReviewCount}</div>
                            <p className="text-xs text-gray-500">Being evaluated</p>
                        </div>
                        
                        
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                            <p className="text-sm font-normal text-gray-500">My Approved Requests</p>
                            <div className="text-3xl font-normal text-gray-900">{approvedCount}</div>
                            <p className="text-xs text-gray-500">Ready to proceed</p>
                        </div>

                    </div>
            )}
                   

                    {/* Recent Requests Table */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Purchase Requests</h2>
                        
                        {tableLoading ? (
                        // 💡 Table Loading Indicator (Spinner)
                        <div className="flex justify-center items-center h-48">
                           
                            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                            <p className="ml-2 text-sky-600">Updating requests...</p>
                        </div>
                       ) : (

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Request Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-blod text-gray-800 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request._id}>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.title}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.department}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(request.cost)}</td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                {getStatusPill(request.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {requests.length === 0 && <p className="text-center py-4 text-gray-500">No recent requests found.</p>}
                        </div>
                    //    div ke pahle ki line yhaa kar sakte
                       )}
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
