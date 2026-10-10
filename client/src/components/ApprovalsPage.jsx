// client/src/components/ApprovalsPage.jsx 
// ⭐ (CORRECTED VERSION) ⭐

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 👇️ CHANGED: 'HelpCircle' आइकन को import किया गया
import { Check, X, Clock, Loader2, Filter, ChevronDown, HelpCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

const ApprovalsPage = () => {
    const [allRequests, setAllRequests] = useState([]); 
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending'); 
    const [updatingId, setUpdatingId] = useState(null); 
    const [showFilters, setShowFilters] = useState(false);
    
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [costFilter, setCostFilter] = useState(100000000000); // Default to a very high cost

    // 👇️ CHANGED: हर कार्ड के टेक्स्टएरिया (textarea) के लिए एक स्टेट
    const [notes, setNotes] = useState({}); // e.g., { "requestId123": "This note..." }

    const token = localStorage.getItem('token');

    // Fetch all requests
    const fetchAllRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/requests`, {
                headers: { 'x-auth-token': token }
            });
            
            const requestsWithRequester = res.data.map(req => ({
                ...req,
                requesterName: req.requester ? req.requester.name : 'Unknown User'
            }));
            setAllRequests(requestsWithRequester);
            setLoading(false);
        } catch (err) {
            console.error("Approvals Data Fetch Error:", err.response || err);
            setError("Failed to load approvals data. Server or Access Error.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAllRequests();
        } else {
            setError("No authorization token found. Please log in.");
            setLoading(false);
        }
    }, [token]);

    // 👇️ CHANGED: 'Clarification Needed' को फ़िल्टर करने के लिए फ़िल्टर लॉजिक अपडेट किया गया
    useEffect(() => {
        let currentFiltered = allRequests;
        
        // 1. Filter by Status (activeTab)
        if (activeTab === 'Pending') {
            // 'Pending' टैब अब 'Pending' और 'In Review' दोनों दिखाता है (एडमिन के एक्शन का इंतज़ार)
            currentFiltered = currentFiltered.filter(req => req.status === 'Pending' || req.status === 'In Review');
        } else if (activeTab === 'Approved') {
            currentFiltered = currentFiltered.filter(req => req.status === 'Approved');
        } else if (activeTab === 'Rejected') {
            currentFiltered = currentFiltered.filter(req => req.status === 'Rejected');
        }
        // 'Clarification Needed' जानबूझकर किसी भी टैब में नहीं दिखाया गया है, 
        // क्योंकि वह अब कर्मचारी की कतार में है।

        // 2. Filter by Department
        if (departmentFilter !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.department === departmentFilter);
        }

        // 3. Filter by Cost Range
        currentFiltered = currentFiltered.filter(req => Number(req.cost) <= costFilter);

        setFilteredRequests(currentFiltered);
    }, [allRequests, activeTab, departmentFilter, costFilter]);
    // 👆️ END CHANGE


    // ⭐ (handleStatusUpdate में कोई बदलाव नहीं - यह 'Approved'/'Rejected' के लिए सही है)
    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        setError(null);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/requests/${id}/status`, 
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            setAllRequests(prevRequests => prevRequests.map(req => 
                req._id === id ? { ...res.data, requesterName: req.requesterName } : req // requesterName को बनाए रखें
            ));
        } catch (err) {
            console.error("Status Update Error:", err.response || err);
            setError(`Failed to update status: ${err.response?.data?.msg || 'Server error'}`);
        } finally {
            setUpdatingId(null);
        }
    };

    // 👇️ NEW: नोट्स टेक्स्टएरिया को बदलने के लिए हैंडलर
    const handleNoteChange = (id, value) => {
        setNotes(prev => ({ ...prev, [id]: value }));
    };

    // 👇️ NEW: 'Request Clarification' के लिए हैंडलर
    const handleRequestClarification = async (id) => {
        const reviewerNotes = notes[id];
        if (!reviewerNotes || reviewerNotes.trim() === '') {
            setError('Please add notes (in the textarea) before requesting clarification.');
            // 3 सेकंड के बाद एरर हटाएं
            setTimeout(() => setError(null), 3000);
            return;
        }

        setUpdatingId(id);
        setError(null);

        try {
            // नए API एंडपॉइंट '/clarify' को कॉल करें
            const res = await axios.put(`${API_BASE_URL}/api/requests/${id}/clarify`, 
                { reviewerNotes },
                { headers: { 'x-auth-token': token } }
            );
            
            // लोकल स्टेट को अपडेट करें (स्टेटस अब 'Clarification Needed' है)
            setAllRequests(prevRequests => prevRequests.map(req => 
                req._id === id ? { ...res.data, requesterName: req.requesterName } : req
            ));
            // इस रिक्वेस्ट के लिए नोट्स साफ़ करें
            setNotes(prev => ({ ...prev, [id]: '' }));

        } catch (err) {
            console.error("Clarification Error:", err.response || err);
            setError(err.response?.data?.msg || 'Failed to send notes.');
        } finally {
            setUpdatingId(null);
        }
    };
    // 👆️ END NEW HANDLERS

    // 👇️ CHANGED: मीट्रिक काउंट्स को अपडेट किया गया
    const pendingCount = allRequests.filter(req => req.status === 'Pending' || req.status === 'In Review').length;
    const clarificationCount = allRequests.filter(req => req.status === 'Clarification Needed').length;
    const approvedCount = allRequests.filter(req => req.status === 'Approved').length;
    const rejectedCount = allRequests.filter(req => req.status === 'Rejected').length;
    // 👆️ END CHANGE


    if (loading) return <div className="p-8 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Approvals...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-8 rounded-lg">{error}</div>;

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 space-y-6">
                
                {/* Top Header (कोई बदलाव नहीं) */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Approvals</h1>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-2 py-1 text-sm bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                </div>

                <p className="text-gray-600 -mt-4 mb-6">Review and manage procurement requests.</p>
   
                {/* Filter Section (कोई बदलाव नहीं) */}
                {showFilters && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Apply Filters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select 
                                     value={departmentFilter}
                                     onChange={(e) => setDepartmentFilter(e.target.value)}
                                     className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm">
                                    <option value="All">All Departments</option>
                                    {['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'].map(dept => (
                                         <option key={dept} value={dept}>{dept}</option>
                                     ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 👇️ CHANGED: Metric Cards को 4-कॉलम लेआउट में बदला गया */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Pending Approval</p>
                        <div className="text-3xl font-normal text-gray-900">{pendingCount}</div>
                        <p className="text-xs text-gray-500">Requires your action</p>
                    </div>
                
                    {/* 👇️ NEW CARD */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Awaiting Reply</p>
                        <div className="text-3xl font-normal text-gray-900">{clarificationCount}</div>
                        <p className="text-xs text-gray-500">Waiting for employee</p>
                    </div>
                
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Approved</p>
                        <div className="text-3xl font-normal text-gray-900">{approvedCount}</div>
                        <p className="text-xs text-gray-500">This month</p> 
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Rejected</p>
                        <div className="text-3xl font-normal text-gray-900">{rejectedCount}</div>
                        <p className="text-xs text-gray-500">This month</p>
                    </div>
                </div>
                {/* 👆️ END CHANGE */}

                {/* Filter Tabs (कोई बदलाव नहीं) */}
                <div className=" px-9 py-1 flex w-fit space-x-3 rounded-full bg-sky-100 mb-4">
                    {['Pending', 'Approved', 'Rejected'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`py-2 px-3 text-sm font-medium transition-colors ${activeTab === tab ? 'py-0 bg-white rounded-full font-semibold' : 'text-gray-800 hover:text-gray-700'}`}
                        >
                            {tab} ({tab === 'Pending' ? pendingCount : tab === 'Approved' ? approvedCount : rejectedCount})
                        </button>
                    ))}
                </div>

                {/* Request Cards List */}
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
                        <Check className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="mt-4 text-xl font-semibold text-gray-700">No {activeTab} requests found matching current filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div key={request._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">

                                {/* Card Header (कोई बदलाव नहीं) */}
                                <div className='flex items-center mb-4'>
                                   <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs mr-3 flex-shrink-0">
                                            {request.requesterName ? request.requesterName.substring(0,2).toUpperCase() : '??'}
                                   </span>
                                    <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                                            <div className="flex items-center text-gray-500 text-sm space-x-3">
                                                <span className="font-normal">By: {request.requesterName}</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="font-normal">{formatCurrency(request.cost)}</span>
                                                <span className="text-gray-400">|</span>
                                                <span className='font-normal'>Date: {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                        {request.department}
                                    </span>
                                    {request.vendorName && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Vendor: {request.vendorName}
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-semibold text-gray-800 mb-2">Business Justification:</h4>
                                <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                                
                                {/* 👇️ CHANGED: कर्मचारी का जवाब (reply) दिखाने के लिए लॉजिक जोड़ा गया */}
                                {request.status === 'In Review' && request.requesterReply && (
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h5 className="text-sm font-semibold text-blue-800">Employee Reply:</h5>
                                        <p className="text-sm text-gray-700 mt-1">{request.requesterReply}</p>
                                  </div>
                                )}
                                {/* 👆️ END CHANGE */}
                
                                {/* Final Status Display (कोई बदलाव नहीं) */}
                                {['Approved'].includes(request.status) && (
                                    <p className='w-full bg-green-50 rounded-lg p-3 text-sm text-green-700 mb-4'>This request has been approved.</p>
                                )}
                                {['Rejected'].includes(request.status) && (
                                    <p className='w-full bg-red-50 rounded-lg p-3 text-sm text-red-700 mb-4'>This request has been rejected.</p>
                                )}
                
                                {/* 👇️ CHANGED: Action Buttons का पूरा लॉजिक अपडेट किया गया */}
                                {['Pending', 'In Review'].includes(request.status) && (
                                    <>
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <label htmlFor={`notes-${request._id}`} className="font-normal text-gray-900 mb-2 block">Approver Notes (Required for Clarification)</label>
                                            <textarea
                                                id={`notes-${request._id}`}
                                                rows="2"
                                                className="w-full bg-sky-50 rounded-lg p-3 text-sm focus:ring-sky-500 focus:border-sky-500"
                                                placeholder="Add comments before approving, rejecting, or requesting clarification..."
                                                // स्टेट से बाइंड करें
                                              value={notes[request._id] || ''}
                                                onChange={(e) => handleNoteChange(request._id, e.target.value)}
                                                disabled={updatingId === request._id}
                                            ></textarea>
                                        </div>

                                    <div className="flex space-x-3 mt-6">
                                         {/* 👇️ NEW: Request Clarification Button */}
                                        <button
                                            onClick={() => handleRequestClarification(request._id)}
                                            disabled={updatingId === request._id || !notes[request._id]}
                                            className={`flex items-center justify-center w-full py-2 text-base font-medium rounded-lg transition-colors 
                                              ${updatingId === request._id || !notes[request._id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                                        >
                                            {updatingId === request._id ? '...' : <><HelpCircle className="w-5 h-5 mr-2" /> Clarify</>}
                                       </button>

                                       {/* Approve Button */}
                                        <button
                                            onClick={() => handleStatusUpdate(request._id, 'Approved')}
                                            disabled={updatingId === request._id}
                                            className={`flex items-center justify-center w-full py-2 text-base font-medium rounded-lg transition-colors 
                                            ${updatingId === request._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                       >
                                            {updatingId === request._id ? '...' : <><Check className="w-5 h-5 mr-2" /> Approve</>}
                                        </button>

                                        {/* Reject Button */}
                                   <button
                                            onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                                           disabled={updatingId === request._id}
                                            className={`flex items-center justify-center w-full py-2 text-base font-medium rounded-lg transition-colors 
                                                ${updatingId === request._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                        >
                                            {updatingId === request._id ? '...' : <><X className="w-5 h-5 mr-2" /> Reject</>}
                                  </button>

                                       
                                    </div>
                                    </>
                                )}
                                {/* 👆️ END CHANGE */}
                             </div>
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ApprovalsPage;


