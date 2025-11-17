// client/src/components/RequestDetailPage.jsx
// (यह एक नई फ़ाइल है)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, User, Building, Calendar, DollarSign, Tag, Paperclip, Download, MessageSquare, Clock, Check, X, HelpCircle, Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Helper: Currency Formatter ---
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// --- Helper: Status Pill (आपके स्क्रीनशॉट के आधार पर) ---
const getStatusPill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
    
    // 👇️ CHANGED: variable 'icon' का नाम बदलकर 'Icon' (बड़ा I) कर दिया गया है
    let Icon = Clock; 
    
    switch (status) {
        case 'Approved':
            classes += ' bg-green-200 text-green-800';
            Icon = Check; // 👈️ बदला गया
            break;
        case 'Rejected':
            classes += ' bg-red-200 text-red-800';
            Icon = X; // 👈️ बदला गया
            break;
        case 'Clarification Needed':
            classes += ' bg-orange-200 text-orange-800';
            Icon = HelpCircle; // 👈️ बदला गया
            break;
        case 'In Review':
            classes += ' bg-blue-200 text-blue-800';
            Icon = Eye; // 👈️ बदला गया
            break;
        case 'Pending':
        default:
            classes += ' bg-yellow-200 text-yellow-800';
            Icon = Clock; // 👈️ बदला गया
            break;
    }

    return (
        <span className={classes}>
            {/* 👇️ CHANGED: अब यह 'Icon' variable को सही से रेंडर करेगा */}
            <Icon className="w-4 h-4 mr-1.5" />
            {status}
        </span>
    );
};


const RequestDetailPage = () => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams(); // URL से :id को पकड़ें
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (!token) {
                setError("Authorization token not found.");
                setLoading(false);
                return;
            }
            try {
                // हमारे नए API एंडपॉइंट को कॉल करें
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 m-6">{error}</div>;
    }

    if (!request) {
        return <div className="p-8 text-center text-gray-500 m-6">Request not found.</div>;
    }

    // (स्क्रीनशॉट 89 से मॉक अटैचमेंट डेटा - अभी के लिए)
    // भविष्य में, आप इसे `request.attachments` ऐरे से लोड कर सकते हैं
    const attachments = [
        { name: 'Adobe_Quote_2025.pdf', size: '245 KB', user: 'Emily Taylor', date: 'Jan 15, 2025' },
        { name: 'Team_License_Requirements.xlsx', size: '18 KB', user: 'Emily Taylor', date: 'Jan 15, 2025' }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            {/* 1. Back Button */}
            <button 
                onClick={() => navigate('/requests')} 
                className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to My Requests
            </button>

            <h1 className="text-2xl font-semibold text-gray-800">Request Details</h1>
            <p className="text-gray-500 mb-6">View and track your procurement request</p>

            <div className="grid grid-cols-3 gap-6">
                
                {/* Main Content (Left Column) */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    
                    {/* Request Details Card (Screenshot 88) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mr-4">
                                <Paperclip className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{request.title}</h2>
                                {getStatusPill(request.status)}
                            </div>
                        </div>

                        <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 mb-6">{request.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2 text-sky-500" />
                                <strong>Vendor:</strong><span className="ml-2">{request.vendorName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Tag className="w-4 h-4 mr-2 text-sky-500" />
                                <strong>Category:</strong><span className="ml-2">{request.department || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-sky-500" />
                                <strong>Amount:</strong><span className="ml-2">{formatCurrency(request.cost)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-sky-500" />
                                <strong>Submitted:</strong><span className="ml-2">{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Comments Card (Screenshot 88) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-sky-500" />
                            Notes & Comments
                        </h3>
                        <div className="space-y-4">
                            {/* एडमिन के नोट्स दिखाएं */}
                            {request.reviewerNotes ? (
                                <div className="border border-orange-200 bg-orange-50 p-3 rounded-lg">
                                    <p className="text-sm font-semibold text-orange-800">Approver Notes:</p>
                                    <p className="text-sm text-gray-700 mt-1">{request.reviewerNotes}</p>
                                </div>
                            ) : null}
                            
                            {/* कर्मचारी का जवाब दिखाएं */}
                            {request.requesterReply ? (
                                <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-800">Your Reply:</p>
                                    <p className="text-sm text-gray-700 mt-1">{request.requesterReply}</p>
                                </div>
                            ) : null}

                            {/* यदि कोई नोट्स नहीं हैं */}
                            {!request.reviewerNotes && !request.requesterReply && (
                                <p className="text-sm text-gray-500 text-center py-4">No notes or comments yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Attachments Card (Screenshot 89) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Paperclip className="w-5 h-5 mr-2 text-sky-500" />
                            Attachments ({attachments.length})
                        </h3>
                        <div className="space-y-3">
                            {attachments.length > 0 ? attachments.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                    <div>
                                        <p className="text-sm font-medium text-sky-700">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {file.size} • Uploaded by {file.user} on {file.date}
                                        </p>
                                    </div>
                                    <button className="text-gray-500 hover:text-sky-600">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No attachments uploaded.</p>
                        )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="col-span-3 lg:col-span-1 space-y-6">
                    
                    {/* Requestor Information Card (Screenshot 88) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Requestor Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm">
                                <User className="w-4 h-4 mr-3 text-sky-500" />
                                <div>
                                    <p className="text-gray-500">Name</p>
                                <p className="font-medium text-gray-800">{request.requester?.name || 'N/A'}</p>
                                </div>
                            </div>
                         <div className="flex items-center text-sm">
                                <Building className="w-4 h-4 mr-3 text-sky-500" />
                                <div>
                                    <p className="text-gray-500">Department</p>
                                <p className="font-medium text-gray-800">{request.requester?.department || request.department}</p>
                                </div>
                            </div>
                       </div>
                    </div>

                    {/* Request Timeline Card (Screenshot 88) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Timeline</h3>
                        <ul className="space-y-4">
                            {/* यह अभी मॉक डेटा है; इसे भविष्य में `request.history` ऐरे से पॉप्युलेट किया जा सकता है */}
                            <li className="flex items-center">
                                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full mr-3"></span>
                                <span className="text-sm text-gray-700">Request Submitted</span>
                                <span className="text-sm text-gray-500 ml-auto">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                           </li>
                            {request.status === 'Approved' && (
                                <li className="flex items-center">
                                    <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-3"></span>
                                    <span className="text-sm text-gray-700">Request Approved</span>
                                    <span className="text-sm text-gray-500 ml-auto">{new Date(request.approvalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                             </li>
                            )}
                        </ul>
                    </div>

                    {/* Actions Card (Screenshot 88) */}
                       <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center text-sm font-medium text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors">
                                Withdraw Request
                        </button>
                            <button className="w-full flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors">
                            nbsp;   <Download className="w-4 h-4 mr-2" />
                            Download All Files
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RequestDetailPage;