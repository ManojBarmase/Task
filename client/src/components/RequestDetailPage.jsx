// // client/src/components/RequestDetailPage.jsx
// // (यह एक नई फ़ाइल है)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, User, Building, Calendar, DollarSign, Tag, Paperclip, Download, MessageSquare, Clock, Check, X, HelpCircle, Eye, Globe, Mail, Phone, FileText, Archive } from 'lucide-react';

// API URL Helper (Server vs Root uploads handle karne ke liye)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDocumentUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, '/');
    return `${API_BASE_URL}/${cleanPath}`;
};

// --- Helper: Currency Formatter ---
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// --- Helper: Status Pill ---
const getStatusPill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
    let Icon = Clock; 
    
    switch (status) {
        case 'Approved':
            classes += ' bg-green-100 text-green-800';
            Icon = Check;
            break;
        case 'Rejected':
            classes += ' bg-red-100 text-red-800';
            Icon = X;
            break;
        case 'Clarification Needed':
            classes += ' bg-orange-100 text-orange-800';
            Icon = HelpCircle;
            break;
        case 'In Review':
            classes += ' bg-blue-100 text-blue-800';
            Icon = Eye;
            break;
        case 'Withdrawn':
            classes += ' bg-gray-200 text-gray-600';
            Icon = Archive;
            break;
        default:
            classes += ' bg-yellow-100 text-yellow-800';
    }

    return (
        <span className={classes}>
            <Icon className="w-4 h-4 mr-1.5" />
            {status}
        </span>
    );
};

const RequestDetailPage = () => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');


    // 👇 Current User ka Data nikalein
    const currentUserRole = localStorage.getItem('userRole');
    const currentUserId = localStorage.getItem('userId');


    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (!token) {
                setError("Authorization token not found.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/requests/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setRequest(res.data);
            } catch (err) {
                console.error("Fetch Request Details Error:", err.response || err);
                setError(err.response?.data?.msg || "Failed to load request details.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequestDetails();
    }, [id, token]);


    // 👇 Withdrawal Handler
    const handleWithdraw = async () => {
        // 1. Confirmation
        if (!window.confirm("Are you sure you want to withdraw this request?")) return;

        try {
            setLoading(true);
            // 2. API Call
            await axios.put(`${API_BASE_URL}/api/requests/${id}/withdraw`, {}, {
                headers: { 'x-auth-token': token }
            });
            
            // 3. Refresh Data (Taaki status turant update ho jaye)
            // Aap chahein to navigate('/requests') bhi kar sakte hain
            alert("Request withdrawn successfully.");
            window.location.reload(); 

        } catch (err) {
            console.error("Withdrawal Error:", err);
            alert(err.response?.data?.msg || "Failed to withdraw request.");
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 text-sky-500 animate-spin" /></div>;
    if (error) return <div className="p-8 text-center text-red-600 m-6">{error}</div>;
    if (!request) return <div className="p-8 text-center text-gray-500 m-6">Request not found.</div>;

    // 👇 Vendor Display Logic (Existing vs Proposed)
    const vendorName = request.vendor?.vendorName || request.proposedVendor?.vendorName || 'N/A';
    const vendorWebsite = request.vendor?.website || request.proposedVendor?.website || null;
    const vendorEmail = request.vendor?.contactEmail || request.proposedVendor?.contactEmail || null;
    const isNewVendor = request.isNewVendor;


    // 👇 DEBUG LOGS ADD KAREIN
    console.log("---- Debugging Withdraw Button ----");
    console.log("Current User Role:", currentUserRole);
    console.log("Current User ID (Local):", currentUserId);
    console.log("Request Owner ID (API):", request.requester?._id);
    console.log("Request Status:", request.status);
    console.log("Match Found?:", request.requester?._id === currentUserId);
    console.log("-----------------------------------");

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            {/* Back Button */}
            <button onClick={() => navigate('/requests')} className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Requests
            </button>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Request Details</h1>
                    <p className="text-gray-500">ID: #{request._id.slice(-6).toUpperCase()}</p>
                </div>
                {getStatusPill(request.status)}
            </div>

            <div className="grid grid-cols-3 gap-6">
                
                {/* Left Column (Details) */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    
                    {/* 1. Basic Info Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mr-3">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{request.title}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                                <div className="flex items-center text-gray-800 font-medium">
                                    <Building className="w-4 h-4 mr-2 text-sky-500" />
                                    {request.department}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Submitted Date</p>
                                <div className="flex items-center text-gray-800 font-medium">
                                    <Calendar className="w-4 h-4 mr-2 text-sky-500" />
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Business Justification</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {request.description}
                            </p>
                        </div>
                    </div>

                    {/* 2. Vendor & Budget Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor & Budget</h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* Vendor Section */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-blue-800 uppercase">Vendor Details</p>
                                    {isNewVendor && <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">New Suggestion</span>}
                                </div>
                                <p className="text-lg font-bold text-gray-900 mb-1">{vendorName}</p>
                                {vendorWebsite && (
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <Globe className="w-3 h-3 mr-2" /> {vendorWebsite}
                                    </div>
                                )}
                                {vendorEmail && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-3 h-3 mr-2" /> {vendorEmail}
                                    </div>
                                )}
                            </div>

                            {/* Budget Section */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-xs font-bold text-green-800 uppercase mb-2">Budget Breakdown</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Estimated Cost:</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(request.cost)}</span>
                                    </div>
                                    {request.costPerLicense > 0 && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Cost Per License:</span>
                                            <span>{formatCurrency(request.costPerLicense)}</span>
                                        </div>
                                    )}
                                    {request.numLicenses > 0 && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>No. of Licenses:</span>
                                            <span>{request.numLicenses}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Attachments Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Paperclip className="w-5 h-5 mr-2 text-sky-500" />
                            Attachments ({request.attachments?.length || 0})
                        </h3>
                        
                        <div className="space-y-3">
                            {request.attachments && request.attachments.length > 0 ? (
                                request.attachments.map((path, index) => {
                                    const fileName = path.split('/').pop().split('-').slice(2).join('-') || path.split('/').pop(); // Clean filename
                                    return (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">
                                                <FileText className="w-4 h-4 mr-3 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{fileName}</span>
                                            </div>
                                            <a 
                                                href={getDocumentUrl(path)} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center"
                                            >
                                                <Download className="w-4 h-4 mr-1" /> Download
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4 italic">No attachments uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar Info) */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    
                    {/* Requestor Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Requestor</h3>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold mr-3">
                                {request.requester?.firstName?.[0]}{request.requester?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{request.requester?.firstName} {request.requester?.lastName}</p>
                                <p className="text-xs text-gray-500">{request.requester?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Approval Notes */}
                    {(request.reviewerNotes || request.requesterReply) && (
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Activity Log</h3>
                             <div className="space-y-4">
                                {request.reviewerNotes && (
                                    <div className="border-l-4 border-orange-400 bg-orange-50 p-3 rounded-r-lg">
                                        <p className="text-xs font-bold text-orange-800 mb-1">Approver Note:</p>
                                        <p className="text-sm text-gray-700">{request.reviewerNotes}</p>
                                    </div>
                                )}
                                {request.requesterReply && (
                                    <div className="border-l-4 border-blue-400 bg-blue-50 p-3 rounded-r-lg">
                                        <p className="text-xs font-bold text-blue-800 mb-1">Your Reply:</p>
                                        <p className="text-sm text-gray-700">{request.requesterReply}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                        <div className="space-y-3">
                            
                            {/* 👇 WITHDRAW BUTTON LOGIC */}
                            {/* Sirf tab dikhega jab status 'Pending' ho */}
                            {/* 👇 Logic: Status Pending HO + User Employee HO + User hi Requester HO */}
                            {/* 👇 ROBUST CONDITION START */}
                            {(() => {
                                // 1. Safe ID Conversion
                                const requesterId = request.requester?._id 
                                    ? request.requester._id.toString() 
                                    : (request.requester ? request.requester.toString() : '');
                                
                                // 2. Checks
                                const isOwner = requesterId === currentUserId;
                                const isPending = request.status === 'Pending';
                                const isEmployee = currentUserRole === 'employee';

                                // 3. Render Button if checks pass
                                if (isPending && isEmployee && isOwner) {
                                    return (
                                        <button 
                                            onClick={handleWithdraw}
                                            className="w-full flex items-center justify-center text-sm font-medium text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors"
                                        >
                                            Withdraw Request
                                        </button>
                                    );
                                }
                                return null;
                            })()}
                            {/* 👆 ROBUST CONDITION END */}

                            {/* Download Button (Waisa hi rahega) */}
                            {/* <button className="...">
                                <Download className="w-4 h-4 mr-2" />
                                Download All Files
                            </button> */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RequestDetailPage;

