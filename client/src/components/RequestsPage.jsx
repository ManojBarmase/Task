 // client/src/components/RequestsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Filter, Plus, Clock, Eye, Check, X } from 'lucide-react';
import RequestForm from './RequestForm'; // RequestForm का उपयोग करें
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// Status Pill Component (जैसा Dashboard में उपयोग किया गया)
const getStatusPill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
    let icon = Clock;
    
    switch (status) {
        case 'Approved':
            classes += ' bg-green-100 text-green-800';
            icon = Check;
            break;
        case 'Rejected':
            classes += ' bg-red-100 text-red-800';
            icon = X;
            break;
        case 'In Review':
            classes += ' bg-blue-100 text-blue-800';
            icon = Eye;
            break;
        case 'Pending':
        default:
            classes += ' bg-yellow-100 text-yellow-800';
            icon = Clock;
            break;
    }

    return (
        <span className={classes}>
            {/* <icon className="w-3 h-3 mr-1.5" /> */}
            {status}
        </span>
    );
};


const RequestsPage = () => {
    const [allRequests, setAllRequests] = useState([]); // All requests by this user
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'In Review', 'Approved'
    // const [showForm, setShowForm] = useState(false); 
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    // const [costFilter, setCostFilter] = useState(50000); 
    const navigate = useNavigate();
    const location = useLocation();
    const [costFilter, setCostFilter] = useState(10000000); // 10 Million
    const token = localStorage.getItem('token');

    // 👇️ ADDED: Get user role from local storage
    const userRole = localStorage.getItem('userRole'); 
    
    // 👇️ ADDED: Define isEmployee for conditional rendering
    const isEmployee = userRole === 'employee';

    // Fetch ONLY the requests created by the current user
    const fetchUserRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE: /requests API is set to return only user-specific requests if role is 'employee'
            // Assuming your backend supports this or you will implement it soon! 
            // For now, this fetches all, but ideally backend filters by req.user.id
            const res = await axios.get(`${API_BASE_URL}/requests`, {
                headers: { 'x-auth-token': token }
            });
            
            // For true Employee View, you must filter by requester ID if backend doesn't do it:
            // const userId = JSON.parse(atob(token.split('.')[1])).user.id;
            // const userRequests = res.data.filter(req => req.requester._id === userId);
            
            setAllRequests(res.data);
        } catch (err) {
            console.error("User Requests Fetch Error:", err.response || err);
            setError("Failed to load your request history.");
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (token) {
    //         fetchUserRequests();
    //     }
    // }, [token]);

    useEffect(() => {
        if (token) {
            // यह Fetch Logic हमेशा कॉम्पोनेंट के पहली बार माउंट होने पर चलता है
            fetchUserRequests();
        }
        
        // 👇️ FIX: सबमिशन के बाद एक बार फिर से Fetch करने के लिए लॉजिक जोड़ें
        // यह सुनिश्चित करता है कि नया सबमिट किया गया डेटा तुरंत लोड हो।
        if (location.state && location.state.requestSubmitted) {
             // Fetch को दोबारा चलाएं
            fetchUserRequests(); 
            // URL स्टेट साफ़ करें ताकि अगली बार जब कोई सीधे इस पेज पर आए तो यह दोबारा Fetch न हो
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [token, location.state]);

    // Handle New Request Save (Re-fetch data)
    // const handleNewRequestSave = () => {
    //     fetchUserRequests(); 
    //     setShowForm(false);
    // };


    // Filter requests based on activeTab whenever allRequests or activeTab changes
    // useEffect(() => {
    //     let currentFiltered = [];
    //     if (activeTab === 'All') {
    //         currentFiltered = allRequests;
    //     } else if (activeTab === 'Pending') {
    //         currentFiltered = allRequests.filter(req => req.status === 'Pending');
    //     } else if (activeTab === 'In Review') {
    //         currentFiltered = allRequests.filter(req => req.status === 'In Review');
    //     } else if (activeTab === 'Approved') {
    //         currentFiltered = allRequests.filter(req => req.status === 'Approved');
    //     }
    //     setFilteredRequests(currentFiltered);
    // }, [allRequests, activeTab]);

    useEffect(() => {
        let currentFiltered = allRequests;
        
        // 1. Filter by Status (activeTab)
        if (activeTab !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.status === activeTab);
        }

        // 👇️ 2. NEW: Filter by Department
        if (departmentFilter !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.department === departmentFilter);
        }

        // 👇️ 3. NEW: Filter by Cost Range (Max Cost)
        currentFiltered = currentFiltered.filter(req => Number(req.cost) <= costFilter);
        
        setFilteredRequests(currentFiltered);
    // 👇️ UPDATED: Add new dependencies
    }, [allRequests, activeTab, departmentFilter, costFilter]);

    // Calculate metrics for cards
    const pendingCount = allRequests.filter(req => req.status === 'Pending').length;
    const inReviewCount = allRequests.filter(req => req.status === 'In Review').length;
    const approvedCount = allRequests.filter(req => req.status === 'Approved').length;
    const totalCount = allRequests.length;


    if (loading) return <div className="p-6 bg-gray-50 min-h-screen"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Request History...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-6 rounded-lg">{error}</div>;

    return (
        <div className="p-6 pb-52 space-y-6 bg-gray-50 min-h-full"> 
            
            {/* Header and Filter Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-700">Requests</h1>
                <div className="flex space-x-3">

                    <button 
                        // 👇️ UPDATED: Toggle the visibility state
                        onClick={() => setShowFilterOptions(!showFilterOptions)}
                        className={`flex items-center px-2 py-1 text-sm text-gray-700 font-semibold rounded-lg border transition-colors 
                            ${showFilterOptions ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>

                    {/* 👇️ UPDATED: Conditional rendering based on isEmployee */}
                    {isEmployee && (
                        <button 
                            onClick={() => navigate('/requests/new')} 
                            className="flex items-center px-2 py-1 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Request
                        </button>
                    )}
                    {/* 👆️ END of Conditional Rendering */}
                </div>
            </div>

            <p className="text-gray-600 -mt-4 mb-6">Manage all procurement requests.</p>

             {/* 👇️ NEW: Filter Card (Matching Approvals Page Style) */}
            {showFilterOptions && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department Filter Placeholder */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                // 👇️ BINDING AND HANDLER
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="All">All Departments</option>
                                {/* Department values from RequestSchema */}
                                {['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'].map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cost Range Filter Placeholder */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cost Range: $0 - {formatCurrency(costFilter)}</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="10000000" 
                                step="1000" 
                                // 👇️ BINDING AND HANDLER
                                value={costFilter} 
                                onChange={(e) => setCostFilter(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                            />
                        </div>
                    </div>
                    
                    {/* Filter Action Buttons (Optional but helpful) */}
                    {/* <div className="flex justify-end pt-2 space-x-3 border-t">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Reset</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Apply Filters</button>
                    </div> */}
                </div>
            )}
            {/* 👆️ END of Filter Card */}

            {/* Metric Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Pending Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Pending</p>
                    <div className="text-3xl font-normal text-gray-900">{pendingCount}</div>
                    <p className="text-xs text-gray-500">Awaiting review</p>
                </div>
                
                {/* In Review Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">In Review</p>
                    <div className="text-3xl font-normal text-gray-900">{inReviewCount}</div>
                    <p className="text-xs text-gray-500">Being evaluated</p>
                </div>
                
                {/* Approved Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Approved</p>
                    <div className="text-3xl font-normal text-gray-900">{approvedCount}</div>
                    <p className="text-xs text-gray-500">Ready to proceed</p>
                </div>

                 {/* All Requests Card (Design Addition)
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                    <div className="text-4xl font-extrabold text-gray-900">{totalCount}</div>
                    <p className="text-xs text-gray-500">Lifetime total</p>
                </div> */}
            </div>

            {/* All Requests Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">All Requests</h2>
                
                {/* Filter Tabs */}
                <div className=" px-9 py-1 flex w-fit space-x-3 rounded-full bg-sky-100 mb-4">
                    {['All', 'Pending', 'In Review', 'Approved', 'Rejected'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`py-2 px-3 text-sm  font-medium transition-colors ${activeTab === tab ? ' py-0 bg-white rounded-full  font-semibold' : 'text-gray-800 hover:text-gray-700'}`}
                        >
                            {tab} 
                            {/* ({allRequests.filter(req => tab === 'All' ? true : req.status === tab).length}) */}
                            ({tab === 'All' ? allRequests.length : allRequests.filter(req => req.status === tab).length})
                        </button>
                    ))}
                </div>


                {/* Requests Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Request Title</th>
                                <th className="px-8 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Department</th>
                                <th className="px-8 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cost</th>
                                <th className="px-8 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Status</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.title}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.department}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{new Date(request.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(request.cost)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{getStatusPill(request.status)}</td>
                                    {/* <td className="px-8 py-2 whitespace-nowrap text-sm font-medium">
                                        <button className="text-sky-600 hover:text-sky-900 flex items-center">
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No {activeTab.toLowerCase()} requests found.</div>
                )}
            </div>
            
            {/* Request Form Modal */}
            {/* {showForm && <RequestForm 
                onClose={() => setShowForm(false)} 
                onSave={handleNewRequestSave}
            />} */}
        </div>
    );
};

export default RequestsPage;