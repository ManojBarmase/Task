// client/src/components/ApprovalsPage.jsx 

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Clock, Loader2, Filter, ChevronDown } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    
    // 👇️ NEW: Filter States
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [costFilter, setCostFilter] = useState(10000000); // Default to a very high cost

    const token = localStorage.getItem('token');

    // Fetch all requests
    const fetchAllRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // Backend must ensure only requests needing this approver's attention are returned,
            // or all requests if user is a Global Approver/Admin.
            const res = await axios.get(`/api/requests`, {
                headers: { 'x-auth-token': token }
            });
            
            // Map to get requester name for display
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

    // 👇️ UPDATED: Filter requests based on all filters
    useEffect(() => {
        let currentFiltered = allRequests;
        
        // 1. Filter by Status (activeTab)
        if (activeTab === 'Pending') {
            currentFiltered = currentFiltered.filter(req => req.status === 'Pending' || req.status === 'In Review');
        } else if (activeTab === 'Approved') {
            currentFiltered = currentFiltered.filter(req => req.status === 'Approved');
        } else if (activeTab === 'Rejected') {
            currentFiltered = currentFiltered.filter(req => req.status === 'Rejected');
        }
        // Note: There is no 'All' tab, so we don't need to check for it.

        // 2. Filter by Department
        if (departmentFilter !== 'All') {
            currentFiltered = currentFiltered.filter(req => req.department === departmentFilter);
        }

        // 3. Filter by Cost Range
        currentFiltered = currentFiltered.filter(req => Number(req.cost) <= costFilter);

        setFilteredRequests(currentFiltered);
    }, [allRequests, activeTab, departmentFilter, costFilter]);


    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        setError(null);

        try {
            const res = await axios.put(`/api/requests/${id}/status`, 
                { status: newStatus },
                {
                    headers: { 'x-auth-token': token }
                }
            );
            
            // Update the status in the allRequests state locally
            setAllRequests(prevRequests => prevRequests.map(req => 
                req._id === id ? { 
                    ...req, 
                    status: newStatus, 
                    approvalDate: newStatus === 'Approved' ? new Date().toISOString() : req.approvalDate 
                } : req
            ));
            
        } catch (err) {
            console.error("Status Update Error:", err.response || err);
            setError(`Failed to update status: ${err.response?.data?.msg || 'Server error'}`);
        } finally {
            setUpdatingId(null);
        }
    };

    // Calculate metrics for cards
    const pendingCount = allRequests.filter(req => req.status === 'Pending' || req.status === 'In Review').length;
    const approvedCount = allRequests.filter(req => req.status === 'Approved').length;
    const rejectedCount = allRequests.filter(req => req.status === 'Rejected').length;


    if (loading) return <div className="p-8 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Approvals...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-8 rounded-lg">{error}</div>;

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 space-y-6">
                
                {/* Top Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold text-gray-700">Approvals</h1>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-2 py-1 text-sm bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                </div>

                <p className="text-gray-600 -mt-4 mb-6">Review and manage procurement requests.</p>
   
                 {/* Filter Section */}
                {showFilters && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Apply Filters</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* Department Filter */}
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

                            {/* Cost Range Filter */}
                            <div>
                                <label className=" text-sm font-medium text-gray-700 mb-2 flex justify-between">
                                    <span>Max Cost: {formatCurrency(costFilter)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000000" // Corresponds to the default state
                                     step="1000"
                                     value={costFilter}
                                     onChange={(e) => setCostFilter(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}


                {/* Metric Cards */}
                {/* ... (Metric cards JSX remains the same) ... */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                        <p className="text-sm font-normal text-gray-500">Pending Approval</p>
                        <div className="text-3xl font-normal text-gray-900">{pendingCount}</div>
                        <p className="text-xs text-gray-500">Requires your action</p>
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

                {/* Filter Tabs */}
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
                                
                                {['Approved'].includes(request.status) && (
                                    <>
                                    <p className='w-full bg-sky-50 rounded-lg p-3 text-sm focus:ring-sky-500 focus:border-sky-500 text-gray-600 mb-4'>This request has been approved</p>
                                    </>
                                )}

                                 {['Rejected'].includes(request.status) && (
                                    <>
                                    <p className='w-full bg-sky-50 rounded-lg p-3 text-sm focus:ring-sky-500 focus:border-sky-500 text-gray-600 mb-4'>This request has been rejected</p>
                                    </>
                                )}
                                
                                {/* Action Buttons: Only show for Pending or In Review requests */}
                                {['Pending', 'In Review'].includes(request.status) && (
                                    <>
                                        {/* Approver Notes Section - Can be used for rejection reason */}
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <h4 className="font-normal text-gray-900 mb-2">Approver Notes</h4>
                                            <textarea
                                                rows="2"
                                                className="w-full bg-sky-50 rounded-lg p-3 text-sm focus:ring-sky-500 focus:border-sky-500"
                                                placeholder="Add your comments or feedback..."
                                            ></textarea>
                                        </div>

                                    <div className="flex space-x-3 mt-6">
                                        <button
                                            onClick={() => handleStatusUpdate(request._id, 'Approved')}
                                            disabled={updatingId === request._id}
                                            className={`flex items-center justify-center w-1/2 py-2 text-base font-medium rounded-lg transition-colors 
                                                ${updatingId === request._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`
                                            }
                                        >
                                            {updatingId === request._id ? 'Approving...' : <><Check className="w-5 h-5 mr-2" /> Approve</>}
                                        </button>

                                        <button
                                            onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                                            disabled={updatingId === request._id}
                                            className={`flex items-center justify-center w-1/2 py-2 text-base font-medium rounded-lg transition-colors 
                                                ${updatingId === request._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`
                                            }
                                        >
                                            {updatingId === request._id ? 'Rejecting...' : <><X className="w-5 h-5 mr-2" /> Reject</>}
                                        </button>
                                    </div>
                                    </>
                                )}
                                </div>
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ApprovalsPage;