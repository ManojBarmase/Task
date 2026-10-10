// client/src/components/RequestsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 👇️ CHANGED: 'HelpCircle' (Clarification Needed के लिए) और 'MailOpen' (Reply देखने के लिए) आइकन जोड़े गए
import { Mail, MessageSquare, CornerDownRight, AlertTriangle, Loader2, Edit, Trash, Filter, Plus, Clock, Eye, Check, X, CornerDownLeft, HelpCircle, MailOpen,Send, CircleX, Archive} from 'lucide-react';
import RequestForm from './RequestForm'; // RequestForm का उपयोग करें
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// 👇️ CHANGED: Status Pill को 'Clarification Needed' के लिए अपडेट किया गया
const getStatusPill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
    let icon = Clock;
    
    switch (status) {
        case 'Approved':
            classes += ' bg-green-200 text-green-800';
            icon = Check;
            break;
        case 'Rejected':
            classes += ' bg-red-200 text-red-800';
            icon = X;
            break;
        // 👇️ NEW CASE
        case 'Clarification Needed':
            classes += ' bg-orange-200 text-orange-800'; // नारंगी रंग
            icon = HelpCircle;
            break;
        case 'In Review':
            classes += ' bg-blue-200 text-blue-800';
            icon = Eye;
            break;
        case 'Withdrawn':
            classes += ' bg-gray-200 text-gray-600'; // Grey Color
            icon = Archive;
            break;

        case 'Pending':
        default:
            classes += ' bg-yellow-200 text-yellow-800';
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
// 👆️ END CHANGE


const RequestsPage = () => {
    const [allRequests, setAllRequests] = useState([]); // All requests by this user
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'In Review', 'Approved'
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const navigate = useNavigate();
    const location = useLocation();
//     const [costFilter, setCostFilter] = useState(100000000000); 
    const [titleFilter, setTitleFilter] = useState(''); // 👈️ 1. यह नई लाइन जोड़ें
    const [costRange, setCostRange] = useState('All Costs'); // 👈️ 2. यह लाइन बदलें (पहले costFilter थी)
    const token = localStorage.getItem('token');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const isEmployee = userRole === 'employee';
    const isAdminOrApprover = userRole === 'admin' || userRole === 'approver';

    // 👇️ CHANGED: Modal States का नाम बदला गया (ज़्यादा स्पष्टता के लिए)
    const [showClarificationModal, setShowClarificationModal] = useState(false); // पहले showReviewModal था
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewerNotes, setReviewerNotes] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    // 👆️ END CHANGE

     // 👇️ यह नया फ़ंक्शन जोड़ें
    const handleRowClick = (id) => {
        navigate(`/requests/${id}`);
    };

    // 👇️ CHANGED: Employee Reply का लॉजिक अपडेट किया गया
    const submitReply = async () => {
        if (!selectedRequest || !isEmployee || !replyText.trim()) {
            setError("Reply text cannot be empty.");
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/requests/${selectedRequest._id}/reply`, 
                { requesterReply: replyText }, 
                { headers: { 'x-auth-token': token } }
            );
            
            // UI को अपडेट करें (res.data अब 'In Review' स्टेटस के साथ आएगा)
            setAllRequests(prev => prev.map(req => 
                req._id === res.data._id ? res.data : req
            ));
            
            setShowReplyModal(false);
            setSelectedRequest(null);
            setReplyText('');
            
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to submit reply.");
        } finally {
            setLoading(false);
        }
    };
    // 👆️ END CHANGE
    
    const handleReplyClick = (request) => {
        setSelectedRequest(request);
        setReplyText(request.requesterReply || '');
        setShowReplyModal(true);
    };


    // 👇️ CHANGED: Admin के 'Review' एक्शन का नाम और लॉजिक बदला गया
    const handleClarificationClick = (request) => { // पहले handleReviewClick था
        setSelectedRequest(request);
        setReviewerNotes(request.reviewerNotes || '');
        setShowClarificationModal(true); // पहले showReviewModal था
    };

    const submitClarification = async () => { // पहले submitReview था
        if (!selectedRequest || !isAdminOrApprover || !reviewerNotes.trim()) {
            setError("Notes are required to request clarification.");
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.put(
                // API राउट को '/review' से '/clarify' में बदला गया
                `${API_BASE_URL}/api/requests/${selectedRequest._id}/clarify`, 
                { reviewerNotes }, 
                { headers: { 'x-auth-token': token } }
            );
            
            // UI को अपडेट करें (res.data अब 'Clarification Needed' स्टेटस के साथ आएगा)
            setAllRequests(prev => prev.map(req => 
                req._id === res.data._id ? res.data : req
            ));
            
            setShowClarificationModal(false); // पहले showReviewModal था
            setSelectedRequest(null);
            setReviewerNotes('');
            
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to submit notes.");
        } finally {
            setLoading(false);
        }
    };
    // 👆️ END CHANGE

    const handleEdit = (request) => {
        navigate(`/requests/edit/${request._id}`, { state: { requestData: request } });
    };

    // ⭐ (fetchUserRequests, useEffects, और filter लॉजिक में कोई बदलाव नहीं)
    const fetchUserRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/requests`, {
                headers: { 'x-auth-token': token }
            });
            setAllRequests(res.data);
        } catch (err) {
            console.error("User Requests Fetch Error:", err.response || err);
            setError("Failed to load your request history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserRequests();
        }
        if (location.state && location.state.requestSubmitted) {
            fetchUserRequests(); 
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [token, location.state]);


useEffect(() => {
        let currentFiltered = allRequests;
        
        // 1. Filter by Status (activeTab)
        if (activeTab !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.status === activeTab);
        }

        // 2. Filter by Department
        if (departmentFilter !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.department === departmentFilter);
        }
        
        // 👇️ CHANGED: 'titleFilter' के लिए लॉजिक जोड़ा गया
        if (titleFilter) {
            currentFiltered = currentFiltered.filter(req =>
                req.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }
        
        // 👇️ CHANGED: 'costRange' (dropdown) के लिए लॉजिक अपडेट किया गया
        if (costRange !== 'All Costs') {
            if (costRange === '10000+') {
                currentFiltered = currentFiltered.filter(req => req.cost >= 10000);
            } else {
                const [min, max] = costRange.split('-').map(Number);
                currentFiltered = currentFiltered.filter(req => req.cost >= min && req.cost <= max);
            }
        }
        
        setFilteredRequests(currentFiltered);
        
    // 👇️ CHANGED: नई dependencies जोड़ी गईं
    }, [allRequests, activeTab, departmentFilter, titleFilter, costRange]);

    // 👇️ CHANGED: Metric cards के लिए 'clarificationCount' जोड़ा गया
    const pendingCount = allRequests.filter(req => req.status === 'Pending').length;
    const clarificationCount = allRequests.filter(req => req.status === 'Clarification Needed').length;
    const inReviewCount = allRequests.filter(req => req.status === 'In Review').length;
    const approvedCount = allRequests.filter(req => req.status === 'Approved').length;
    // 👆️ END CHANGE
    
    if (loading) return <div className="p-6 bg-gray-50 min-h-screen"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Request History...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-6 rounded-lg">{error}</div>;

    return (
        <div className="p-6 pb-52 space-y-6 bg-gray-50 min-h-full"> 
            
            {/* Header and Filter Button (कोई बदलाव नहीं) */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Requests</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setShowFilterOptions(!showFilterOptions)}
                        className={`flex items-center px-2 py-1 text-sm text-gray-700 font-semibold rounded-lg border transition-colors 
                            ${showFilterOptions ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                    {isEmployee && (
                        <button 
                            onClick={() => navigate('/requests/new')} 
                            className="flex items-center px-2 py-1 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Request
                        </button>
                    )}
                </div>
            </div>
            <p className="text-gray-600 -mt-4 mb-6">Manage all procurement requests.</p>
            
        
{/* 👇️ CHANGED: यह पूरा फ़िल्टर पैनल आपके स्क्रीनशॉट (100) जैसा अपडेट किया गया है */}
            {showFilterOptions && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Filter Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        
                        {/* 1. Request Title Search */}
                        <div>
                            <label htmlFor="titleFilter" className="block text-sm font-medium text-gray-700">Request Title</label>
                            <input
                                type="text"
                                name="titleFilter"
                                id="titleFilter"
                                value={titleFilter}
                                onChange={(e) => setTitleFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 text-sm"
                                placeholder="Search by title..."
                            />
                        </div>

                        {/* 2. Department Filter */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                            <select
                                name="department"
                                id="department"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 text-sm"
                            >
                                <option value="All">All Departments</option>
                                {['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'].map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Cost Range Filter */}
                        <div>
                            <label htmlFor="costRange" className="block text-sm font-medium text-gray-700">Cost Range</label>
                            <select
                                name="costRange"
                                id="costRange"
                                value={costRange}
                                onChange={(e) => setCostRange(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 text-sm"
                            >
                                <option value="All Costs">All Costs</option>
                                <option value="0-1000">$0 - $1,000</option>
                                <option value="1001-5000">$1,001 - $5,000</option>
                                <option value="5001-10000">$5,001 - $10,000</option>
                                <option value="10000+">$10,000+</option>
                            </select>
                        </div>
                        
                        {/* 4. Status Filter (यह activeTab state को कंट्रोल करेगा) */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                id="status"
                                value={activeTab} // 👈️ यह 'activeTab' का उपयोग करता है
                                onChange={(e) => setActiveTab(e.target.value)} // 👈️ यह 'setActiveTab' का उपयोग करता है
                                className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 text-sm"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Clarification Needed">Clarification Needed</option>
                                <option value="In Review">In Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                 <option value="Withdrawn">Withdrawn</option>
                            </select>
                        </div>
                    
                    </div>
                </div>
            )}
            {/* 👆️ END NEW Filter Panel */}
            
            {/* 👇️ CHANGED: Metric Cards को 'Clarification Needed' शामिल करने के लिए अपडेट किया गया */}
            <div className="grid grid-cols-4 gap-6 mb-6"> {/* 4-कॉलम ग्रिड */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Pending</p>
                    <div className="text-3xl font-normal text-gray-900">{pendingCount}</div>
                    <p className="text-xs text-gray-500">Awaiting review</p>
                </div>
                
                {/* 👇️ NEW CARD */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Clarification Needed</p>
                    <div className="text-3xl font-normal text-gray-900">{clarificationCount}</div>
                    <p className="text-xs text-gray-500">Awaiting your reply</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">In Review</p>
                    <div className="text-3xl font-normal text-gray-900">{inReviewCount}</div>
                    <p className="text-xs text-gray-500">Being evaluated</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Approved</p>
                    <div className="text-3xl font-normal text-gray-900">{approvedCount}</div>
                    <p className="text-xs text-gray-500">Ready to proceed</p>
                </div>
            </div>
            {/* 👆️ END CHANGE */}

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">All Requests</h2>
                
                {/* 👇️ CHANGED: Filter Tabs को 'Clarification Needed' शामिल करने के लिए अपडेट किया गया */}
                <div className=" px-9 py-1 flex w-fit space-x-3 rounded-full bg-sky-100 mb-4">
                    {['All', 'Pending', 'Clarification Needed', 'In Review', 'Approved', 'Rejected'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`py-2 px-3 text-sm  font-medium transition-colors ${activeTab === tab ? ' py-0 bg-white rounded-full  font-semibold ' : 'text-gray-800 hover:text-gray-700'}`}
                        >
                            {tab} 
                            ({tab === 'All' ? allRequests.length : allRequests.filter(req => req.status === tab).length})
                        </button>
                    ))}
                </div>
                {/* 👆️ END CHANGE */}

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
                                <th className="px-8 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Notes/Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((request) => (
                                <tr 
                                    key={request._id} 
                                    className="hover:bg-gray-100 cursor-pointer" // स्टाइल जोड़ें
                                    onClick={() => handleRowClick(request._id)} // onClick हैंडलर जोड़ें
                                >
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.title}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{request.department}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{new Date(request.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(request.cost)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{getStatusPill(request.status)}</td>
                                    
                                    {/* 👇️ CHANGED: Actions Cell का पूरा लॉजिक अपडेट किया गया */}
                                    {/* 👇️ CHANGED: Actions Cell का पूरा लॉजिक अपडेट किया गया */}
                                    <td className="px-8 py-2 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                        {/* 1. Status: Pending */}
                                        {request.status === 'Pending' && (
                                            <>
                                                {isAdminOrApprover && (
                                                    <button 
                                                        onClick={() => handleClarificationClick(request)}
                                                        className="relative group text-yellow-800 hover: p-2 rounded-full transition-colors "
                                                    >
                                                        <Send className="w-5 h-5" /> 
                                                        {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                            Clarification Requested
                                                        </span>
                                                    </button>
                                                )}
                                                {isEmployee && (
                                                    <button 
                                                        onClick={() => handleEdit(request)}
                                                        className="relative group text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                        {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                            Edit Request
                                                        </span>
                                                    </button>
                                                )}
                                        </>
                                        )}

                                        {/* 2. Status: Clarification Needed */}
                                        {request.status === 'Clarification Needed' && (
                                            <>
                                                {isEmployee && (
                                                    <button 
                                                        onClick={() => handleReplyClick(request)}
                                                        className="relative group text-orange-800 hover: p-2 rounded-full hover:bg-orange-200 transition-colors"
                                                    >
                                                        <MailOpen className="w-5 h-5" />
                                                        {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                             Action required
                                                        </span>
                                                    </button>
                                                )}
                                                {isAdminOrApprover && (
                                                    <span 
                                                        onClick={() => handleReplyClick(request)}
                                                        className="relative group text-orange-800 p-2 rounded-full cursor-pointer"
                                                    >
                                                        <MailOpen className="w-5 h-5" />
                                                       {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                             Read
                                                        </span>
                                                    </span>
                                                )}
                                        </>
                                        )}

                                        {/* 3. Status: In Review */}
                                        {request.status === 'In Review' && (
                                            <>
                                                {isAdminOrApprover && (
                                                    <button 
                                                        onClick={() => handleClarificationClick(request)} 
                                                        className="relative group text-blue-800 hover: p-2 rounded-full hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Mail className="w-5 h-5" />
                                                        {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                            Clarification Received
                                                        </span>
                                                    </button>
                                                )}
                                                {isEmployee && (
                                                    <span 
                                                        onClick={() => handleReplyClick(request)}
                                                        className="relative group text-blue-800 p-2 rounded-full cursor-pointer"
                                                 >
                                                        <Mail className="w-5 h-5" />
                                                        {/* Custom Tooltip */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1 bg-sky-700 text-white text-sm font-medium rounded-md shadow-lg transition-opacity whitespace-nowrap z-10">
                                                            View Notes (Waiting for Admin)
                                                        </span>
                                                    </span>
                                                )}
                                      </>
                                        )}

                                      
                                         {/* 4. Status: Approved/Rejected */}
                                          {(request.status === 'Approved' || request.status === 'Rejected') && (
                                              <span 
                                                  onClick={() => handleReplyClick(request)} 
                                                  className={`relative group p-2 rounded-full cursor-pointer transition-colors ${
                                                      (request.reviewerNotes || request.requesterReply) 
                                                      ? 'hover:bg-gray-100' 
                                                      : ''
                                                  }`}
                                              >
                                                  {/* Icon Logic */}
                                                  {request.status === 'Approved' ? (
                                                      <Check className="w-5 h-5 text-green-600" />
                                                  ) : (
                                                      <CircleX className="w-5 h-5 text-red-600" />
                                                  )}

                                                  {/* Custom Tooltip */}
                                                  <span className={`
                                                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                                      invisible opacity-0 group-hover:visible group-hover:opacity-100 
                                                      px-3 py-1 text-white text-sm font-medium rounded-md shadow-lg 
                                                      transition-opacity whitespace-nowrap z-10
                                                      ${request.status === 'Approved' ? 'bg-green-700' : 'bg-red-700'} 
                                                  `}>
                                                      {/* Tooltip Text Logic */}
                                                      {request.status === 'Approved' ? "Approved" : "Declined"}
                                                  </span>
                                              </span>
                                          )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* ... (rest of the file) ... */}

                {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No {activeTab.toLowerCase()} requests found.</div>
                )}
            </div>
            
            {/* 👇️ CHANGED: Clarification Modal (पहले Review Modal था) */}
            {showClarificationModal && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4 p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900">Request Clarification: {selectedRequest.title}</h3>
                            
                            {/* Requester Details (कोई बदलाव नहीं) */}
                            <div className="border p-3 rounded-md bg-gray-50 text-sm">
                                <p className="font-semibold text-gray-700">Requester Details:</p>
                                <p>Name: <strong>{selectedRequest.requester.name}</strong></p>
                                <p>Email: {selectedRequest.requester.email}</p>
                                <p>Cost: {formatCurrency(selectedRequest.cost)}</p>

                                {/* 👇️ CHANGED: Employee के जवाब को दिखाना (अगर 'In Review' से खोला गया है) */}
                                {selectedRequest.status === 'In Review' && selectedRequest.requesterReply && (
                                    <div className="mt-2 border-t pt-2">
                                        <p className="font-semibold text-blue-700">Employee Reply:</p>
                                        <p className="text-gray-600">{selectedRequest.requesterReply}</p>
                                    </div>
                                )}
                                {/* 👆️ END CHANGE */}
                            </div>
                            
                            {/* Notes Input */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Add Reviewer Notes (Required)</label>
                                <textarea
                                    id="notes"
                                    rows="4"
                                    value={reviewerNotes}
                                    onChange={(e) => setReviewerNotes(e.target.value)}
                                    placeholder="Enter questions or comments for the employee..."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowClarificationModal(false)} // पहले setShowReviewModal(false) था
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                {/* 👇️ CHANGED: Button text और onClick handler */}
                                <button
                                    onClick={submitClarification} // पहले submitReview था
                                    disabled={loading || !reviewerNotes.trim()}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${loading || !reviewerNotes.trim() ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                   {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <HelpCircle className="w-4 h-4 mr-2" />}
                                    Send to Employee (Set **Clarification Needed**)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 👆️ END CHANGE */}

            {/* 👇️ CHANGED: Employee Reply Modal का लॉजिक अपडेट किया गया */}
            {showReplyModal && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4 p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900">Reply to Review: {selectedRequest.title}</h3>
                            
                            <div className="border border-orange-300 p-3 rounded-md bg-orange-50 text-sm">
                                <p className="font-semibold text-orange-800 mb-1">Approver Notes:</p>
                                <p className="text-gray-800">{selectedRequest.reviewerNotes || 'No notes provided.'}</p>
                            </div>

                            {/* 👇️ CHANGED: "Approved/Rejected" होने पर इनपुट को डिसेबल करें */}
                            {selectedRequest.status === 'Clarification Needed' ? (
                                <div>
                                    <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">Your Reply (Required)</label>
                                    <textarea
                                        id="reply"
                                        rows="4"
                                         value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Enter your response to the reviewer's notes..."
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sky-500 focus:border-sky-500"
                                    ></textarea>
                                </div>
                            ) : (
                                // यदि स्टेटस Approved/Rejected है, तो पिछला जवाब दिखाएं (यदि है)
                                selectedRequest.requesterReply && (
                                    <div className="border border-blue-300 p-3 rounded-md bg-blue-50 text-sm">
                                     <p className="font-semibold text-blue-800 mb-1">Your Reply:</p>
                                        <p className="text-gray-800">{selectedRequest.requesterReply}</p>
                                    </div>
                                )
                            )}
                           
                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowReplyModal(false)}

                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    {selectedRequest.status === 'Clarification Needed' ? 'Cancel' : 'Close'}
                          </button>
                                
                                {/* 👇️ CHANGED: केवल 'Clarification Needed' होने पर ही "Send" बटन दिखाएं */}
                                {selectedRequest.status === 'Clarification Needed' && (
                                    <button
                                        onClick={submitReply}
                               disabled={loading || !replyText.trim()}
                                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${loading || !replyText.trim() ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CornerDownLeft className="w-4 h-4 mr-2" />}
                                Send Reply (Set **In Review**)
                                    </button>
                                )}
                         </div>
                        </div>
                    </div>
                </div>
         )}
            {/* 👆️ END CHANGE */}

        </div>
    );
};

export default RequestsPage;
