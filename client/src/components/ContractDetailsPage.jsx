//  client/src/components/ContractDetailsPage.jsx


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Edit, Download, Calendar, Repeat, CreditCard, FileText, User, Mail, Phone, RefreshCw, MessageSquare, DownloadCloud } from 'lucide-react';
import RenewContractForm from './RenewContractForm'; // Import Renew Form (agar aap chahte hain ki modal yahi khule)
import UploadContractForm from './UploadContractForm'; // Reusing Upload form for Editing


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper: Currency Formatter
const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// Helper: Document URL Builder
const getDocumentUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, '/');
    return `${API_BASE_URL}/${cleanPath}`;
};

const ContractDetailsPage = () => {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // State for Renew Modal (Optional)
    const [showRenewModal, setShowRenewModal] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchContractDetails = async () => {
            if (!id || !token) {
                setError("Missing ID or token.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/contracts/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setContract(res.data);
            } catch (err) {
                console.error("Contract Detail Fetch Error:", err.response || err);
                setError("Failed to load contract details.");
            } finally {
                setLoading(false);
            }
        };

        fetchContractDetails();
    }, [id, token]);

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin inline-block text-sky-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!contract) return <div className="p-8 text-center text-gray-500">No contract data found.</div>;

    // --- DYNAMIC CALCULATIONS ---
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const startDate = new Date(contract.start_date);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // Determine Status Color
    let statusColor = 'text-gray-800';
    if (daysLeft < 0) statusColor = 'text-red-600'; // Expired
    else if (daysLeft <= 90) statusColor = 'text-orange-600'; // Expiring Soon
    else statusColor = 'text-green-600'; // Active

    // --- HANDLERS ---
    const handleRenewClick = () => {
        // Option A: Open Renew Form on separate page (if you have one)
        // navigate(`/contracts/renew/${id}`);
        
        // Option B: Show Modal (Agar RenewContractForm component available hai)
        setShowRenewModal(true);
    };

    const handleEditClick = () => {
       setShowEditModal(true);
    };

   // Handle Update Success
    const handleContractUpdated = (updatedContract) => {
        setContract(updatedContract); // Page data refresh karein
        setShowEditModal(false);
    };

    const handleDownloadClick = () => {
        if (contract.documentPath) {
            window.open(getDocumentUrl(contract.documentPath), '_blank');
        } else {
            alert("No document attached to this contract.");
        }
    };

    // Function to check extension and render
    const renderDocumentPreview = (path) => {
        const url = getDocumentUrl(path);
        const extension = path.split('.').pop().toLowerCase();

        if (extension === 'pdf') {
            return <iframe src={url} title="Contract Document" className="w-full h-full border-none" />;
        } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
            return <img src={url} alt="Contract" className="w-full h-full object-contain" />;
        } else {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Preview not available.</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-medium">Download to view</a>
                </div>
            );
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full relative">
            
            {/* Header & Back Button */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Link to="/contracts" className="flex items-center text-sm text-sky-600 hover:underline mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contracts
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{contract.contractTitle}</h1>
                    <p className="text-gray-600">{contract.vendor?.vendorName || 'Unknown Vendor'}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleEditClick} className="flex items-center px-3 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
                        <Edit className="w-4 h-4 mr-2" /> Edit Contract
                    </button>
                    {contract.documentPath && (
                        <button onClick={handleDownloadClick} className="flex items-center px-3 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column */}
                <div className="flex-1 space-y-6">

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoCard icon={<CreditCard />} title="Contract Value" value={formatCurrency(contract.contractValue)} subtitle="Annual" />
                        <InfoCard icon={<Calendar />} title="Renewal Date" value={endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} subtitle={`${daysLeft} days left`} statusColor={statusColor} />
                        <InfoCard icon={<Repeat />} title="Renewal Status" value={contract.renewalStatus} isPill={true} />
                        <InfoCard icon={<CreditCard />} title="Payment Frequency" value={contract.paymentFrequency || 'Annual'} subtitle="" />
                    </div>

                    {/* Contract Details */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                            <DetailItem label="Vendor" value={contract.vendor?.vendorName || 'N/A'} />
                            <DetailItem label="Product/Service" value={contract.contractTitle} />
                            <DetailItem label="Start Date" value={startDate.toLocaleDateString()} />
                            <DetailItem label="End Date" value={endDate.toLocaleDateString()} />
                            <DetailItem label="Contract Value" value={`${formatCurrency(contract.contractValue)} (${contract.paymentFrequency})`} />
                            <DetailItem label="Contact Person" value={contract.contactPerson || contract.vendor?.contactName || 'Account Manager'} />
                        </div>
                    </div>

                    {/* Document Viewer */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Contract Document</h3>
                            {contract.documentPath && (
                                <button onClick={handleDownloadClick} className="flex items-center text-sm text-sky-600 hover:underline">
                                    <Download className="w-4 h-4 mr-1" /> Download
                                </button>
                            )}
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[500px]">
                             {contract.documentPath ? renderDocumentPreview(contract.documentPath) : (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                     <FileText className="w-12 h-12 mb-2 text-gray-400" />
                                     <p>No document uploaded.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
                    
                    {/* Quick Actions (Dynamic Handlers) */}
                    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <ActionButton label="Renew Contract" icon={<RefreshCw />} onClick={handleRenewClick} />
                            <ActionButton label="Edit Details" icon={<Edit />} onClick={handleEditClick} />
                            {/* <ActionButton label="Contact Vendor" icon={<MessageSquare />} onClick={() => window.location.href = `mailto:${contract.vendor?.contactEmail}`} /> */}
                            <ActionButton label="Download Contract" icon={<DownloadCloud />} onClick={handleDownloadClick} disabled={!contract.documentPath} />
                        </div>
                    </div>

                    {/* Vendor Contact (Dynamic) */}
                    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Vendor Contact</h3>
                        <div className="space-y-3">
                            <ContactItem icon={<User />} label="Contact Person" value={contract.contactPerson || contract.vendor?.contactName || 'N/A'} />
                            <ContactItem icon={<Mail />} label="Email" value={contract.vendor?.contactEmail || 'N/A'} />
                            <ContactItem icon={<Phone />} label="Phone" value={contract.vendor?.phone || 'N/A'} />
                        </div>
                    </div>

                    {/* Renewal Timeline (Dynamic) */}
                    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Renewal Timeline</h3>
                        <ul className="space-y-3">
                            <TimelineItem label="Contract Started" date={startDate.toLocaleDateString()} color="green" />
                            <TimelineItem label="Current Period" date="Active subscription" color="blue" />
                            <TimelineItem label="Renewal Date" date={`${endDate.toLocaleDateString()} (${daysLeft} days left)`} color={daysLeft < 30 ? "orange" : "blue"} />
                        </ul>
                    </div>

                </div>
            </div>

            {/* Renew Modal (Agar component import kiya hai to) */}
            {showRenewModal && (
                <RenewContractForm 
                    onClose={() => setShowRenewModal(false)} 
                    onContractRenewed={() => {
                        setShowRenewModal(false);
                        // Reload page or fetch data again
                        window.location.reload();
                    }}
                    // Pass initial data if needed
                    contractId={id} 
                />
            )}

                  {/* Edit Contract Modal */}
                {showEditModal && (
                    <UploadContractForm 
                        contractToEdit={contract} // Pass current data
                        onClose={() => setShowEditModal(false)} 
                        onContractAdded={handleContractUpdated} // Reusing the success handler name
                    />
                )}
        </div>
    );
};

// --- Updated Helper Components ---

const InfoCard = ({ icon, title, value, subtitle, isPill = false, statusColor = 'text-gray-500' }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 space-y-1">
        <div className="flex items-center text-gray-500">
            {React.cloneElement(icon, { className: "w-4 h-4 mr-2" })}
            <span className="text-sm font-normal">{title}</span>
        </div>
        {isPill ? (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full 
                ${value === 'Active' || value === 'Auto-Renew' ? 'bg-green-100 text-green-800' : 
                  value === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {value}
            </span>
        ) : (
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
        )}
        <p className={`text-xs ${statusColor}`}>{subtitle}</p>
    </div>
);

const ActionButton = ({ label, icon, onClick, disabled }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors
        ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
    >
        {React.cloneElement(icon, { className: "w-4 h-4 mr-3" })}
        {label}
    </button>
);

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
);

const ContactItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 text-gray-400 mt-1">{React.cloneElement(icon, { className: "w-4 h-4" })}</div>
        <div className="ml-3 break-all"> {/* break-all added for long emails */}
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

const TimelineItem = ({ label, date, color }) => {
    const colors = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
    };
    return (
        <li className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full ${colors[color] || 'bg-gray-500'} mr-2`}></span>
            <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{date}</p>
            </div>
        </li>
    );
};

export default ContractDetailsPage;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams, Link } from 'react-router-dom';
// import { Loader2, ArrowLeft, Edit, Download, Calendar, Repeat, CreditCard, FileText, User, Mail, Phone, RefreshCw, MessageSquare, DownloadCloud } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// // Helper function (ContractsPage se copy kar lein)
// const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0
//     }).format(amount);
// };

// // Helper to build full URL
// const getDocumentUrl = (path) => {
//     if (!path) return null;
    
//     // Windows style path (\) ko Web style (/) mein badlein
//     const cleanPath = path.replace(/\\/g, '/');
    
//     // Agar path pehle se 'http' se shuru hota hai toh waisa hi return karein
//     if (cleanPath.startsWith('http')) return cleanPath;

//     return `${API_BASE_URL}/${cleanPath}`;
// };


// const ContractDetailsPage = () => {
//     const [contract, setContract] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const { id } = useParams(); // URL se contract ID nikalega
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchContractDetails = async () => {
//             if (!id || !token) {
//                 setError("Missing ID or token.");
//                 setLoading(false);
//                 return;
//             }
//             try {
//                 // Step 1 wala naya API route call karein
//                 const res = await axios.get(`${API_BASE_URL}/api/contracts/${id}`, {
//                     headers: { 'x-auth-token': token }
//                 });
//                 setContract(res.data);
//             } catch (err) {
//                 console.error("Contract Detail Fetch Error:", err.response || err);
//                 setError("Failed to load contract details.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchContractDetails();
//     }, [id, token]);

//     if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin inline-block text-sky-600" /></div>;
//     if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
//     if (!contract) return <div className="p-8 text-center text-gray-500">No contract data found.</div>;

//     const daysLeft = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));

//     // Function to check extension and render
//     const renderDocumentPreview = (path) => {
//         const url = getDocumentUrl(path);
//         const extension = path.split('.').pop().toLowerCase();

//         if (extension === 'pdf') {
//             // PDF ke liye iframe use karein (Screenshot jaisa view)
//             return (
//                 <iframe 
//                     src={url} 
//                     title="Contract Document"
//                     className="w-full h-full border-none"
//                 />
//             );
//         } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
//             // Image ke liye img tag
//             return (
//                 <img 
//                     src={url} 
//                     alt="Contract" 
//                     className="w-full h-full object-contain" 
//                 />
//             );
//         } else {
//             // Word/Excel files browser mein direct embed nahi hoti, unke liye fallback
//             return (
//                 <div className="flex flex-col items-center justify-center h-full">
//                     <FileText className="w-16 h-16 text-gray-400 mb-4" />
//                     <p className="text-gray-600 mb-2">Preview not available for this file type.</p>
//                     <a 
//                         href={url} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="text-sky-600 hover:underline font-medium"
//                     >
//                         Click here to view/download
//                     </a>
//                 </div>
//             );
//         }
//     };

//     // Screenshot (108, 109, 110) ke hisab se JSX
//     return (
//         <div className="p-6 bg-gray-50 min-h-full">
//             {/* 1. Header & Back Button */}
//             <div className="flex justify-between items-center mb-4">
//                 <div>
//                     <Link to="/contracts" className="flex items-center text-sm text-sky-600 hover:underline mb-2">
//                         <ArrowLeft className="w-4 h-4 mr-1" />
//                         Back to Contracts
//                     </Link>
//                     <h1 className="text-2xl font-bold text-gray-900">{contract.vendor?.productTool || contract.contractTitle}</h1>
//                     <p className="text-gray-600">{contract.vendor?.vendorName || 'N/A'}</p>
//                 </div>
//                 <div className="flex space-x-2">
//                     <button className="flex items-center px-3 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
//                         <Edit className="w-4 h-4 mr-2" />
//                         Edit Contract
//                     </button>
//                     <button className="flex items-center px-3 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
//                         <Download className="w-4 h-4 mr-2" />
//                         Download
//                     </button>
//                 </div>
//             </div>

//             {/* Main content grid (2 columns) */}
//             <div className="flex flex-col lg:flex-row gap-6">

//                 {/* Left/Main Column (flex-1) */}
//                 <div className="flex-1 space-y-6">

//                     {/* Metric Cards (Screenshot 108) */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <InfoCard icon={<CreditCard />} title="Contract Value" value={formatCurrency(contract.contractValue)} subtitle="Annual" />
//                         <InfoCard icon={<Calendar />} title="Renewal Date" value={new Date(contract.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} subtitle={`${daysLeft} days`} />
//                         <InfoCard icon={<Repeat />} title="Renewal Status" value={contract.renewalStatus} isPill={true} />
//                         <InfoCard icon={<CreditCard />} title="Payment Frequency" value={contract.paymentFrequency || 'Annual'} subtitle="" />
//                     </div>

//                     {/* Contract Details (Screenshot 108) */}
//                     <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
//                             <DetailItem label="Vendor" value={contract.vendor?.vendorName || 'N/A'} />
//                             <DetailItem label="Product/Service" value={contract.vendor?.productTool || contract.contractTitle} />
//                             <DetailItem label="Start Date" value={new Date(contract.start_date).toLocaleDateString()} />
//                             <DetailItem label="End Date" value={new Date(contract.end_date).toLocaleDateString()} />
//                             <DetailItem label="Contract Value" value={`${formatCurrency(contract.contractValue)} (${contract.paymentFrequency || 'Annual'})`} />
//                             <DetailItem label="Contact Person" value={contract.vendor?.contactName || 'Account Manager'} />
//                         </div>
//                     </div>

//                     {/* Contract Document (Screenshot 109, 110) */}
//                     {/* Contract Document (Screenshot 115 Style) */}
//                     <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="text-lg font-semibold text-gray-800">Contract Document</h3>
                            
//                             {contract.documentPath && (
//                                 <a 
//                                     href={getDocumentUrl(contract.documentPath)} 
//                                     download // Download attribute force karega download ko
//                                     target="_blank" 
//                                     rel="noopener noreferrer"
//                                     className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors"
//                                 >
//                                     <Download className="w-4 h-4 mr-2" />
//                                     Download
//                                 </a>
//                             )}
//                         </div>
                        
//                         {/* Document Viewer Container */}
//                         <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-[600px]"> {/* h-[600px] se height badi hogi */}
//                              {contract.documentPath ? (
//                                 renderDocumentPreview(contract.documentPath)
//                              ) : (
//                                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                                      <FileText className="w-12 h-12 mb-2 text-gray-400" />
//                                      <p>No document uploaded for this contract.</p>
//                                  </div>
//                              )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Sidebar (w-80) */}
//                 <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
                    
//                     {/* Quick Actions (Screenshot 108) */}
//                     <ActionCard title="Quick Actions" actions={[
//                         { label: "Renew Contract", icon: <RefreshCw /> },
//                         { label: "Edit Details", icon: <Edit /> },
//                         { label: "Contact Vendor", icon: <MessageSquare /> },
//                         { label: "Download Contract", icon: <DownloadCloud /> },
//                     ]} />

//                     {/* Vendor Contact (Screenshot 109) */}
//                     <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
//                         <h3 className="text-base font-semibold text-gray-800 mb-4">Vendor Contact</h3>
//                         <div className="space-y-3">
//                             <ContactItem icon={<User />} label="Contact Person" value={contract.contactPerson || contract.vendor?.contactPerson?.name || contract.vendor?.contactPerson || 'Account Manager'} />
//                             <ContactItem icon={<Mail />} label="Email" value={contract.vendor?.contactEmail || 'N/A'} />
//                             <ContactItem icon={<Phone />} label="Phone" value={contract.vendor?.phone || 'N/A'} />
//                         </div>
//                     </div>

//                     {/* Renewal Timeline (Screenshot 109) */}
//                     <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
//                         <h3 className="text-base font-semibold text-gray-800 mb-4">Renewal Timeline</h3>
//                         <ul className="space-y-3">
//                             <TimelineItem label="Contract Started" date={new Date(contract.start_date).toLocaleDateString()} color="green" />
//                             <TimelineItem label="Current Period" date="Active subscription" color="blue" />
//                             <TimelineItem label="Renewal Date" date={`${new Date(contract.end_date).toLocaleDateString()} (${daysLeft} days)`} color="orange" />
//                         </ul>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- Helper Components (Isi file mein neeche rakhein) ---

// // Metric Card (Screenshot 108)
// const InfoCard = ({ icon, title, value, subtitle, isPill = false }) => (
//     <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 space-y-1">
//         <div className="flex items-center text-gray-500">
//             {React.cloneElement(icon, { className: "w-4 h-4 mr-2" })}
//             <span className="text-sm font-normal">{title}</span>
//         </div>
//         {isPill ? (
//             <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">{value}</span>
//         ) : (
//             <div className="text-2xl font-semibold text-gray-900">{value}</div>
//         )}
//         <p className="text-xs text-gray-500">{subtitle}</p>
//     </div>
// );

// // Contract Detail Item (Screenshot 108)
// const DetailItem = ({ label, value }) => (
//     <div>
//         <p className="text-sm text-gray-500">{label}</p>
//         <p className="text-sm font-medium text-gray-800">{value}</p>
//     </div>
// );

// // Quick Action Card (Screenshot 108)
// const ActionCard = ({ title, actions }) => (
//     <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
//         <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
//         <div className="space-y-2">
//             {actions.map((action, index) => (
//                 <button key={index} className="w-full flex items-center px-3 py-2 text-sm text-gray-700 font-medium rounded-md border border-gray-200 hover:bg-gray-100">
//                     {React.cloneElement(action.icon, { className: "w-4 h-4 mr-3" })}
//                     {action.label}
//                 </button>
//             ))}
//         </div>
//     </div>
// );

// // Contact Item (Screenshot 109)
// const ContactItem = ({ icon, label, value }) => (
//     <div className="flex items-start">
//         <div className="flex-shrink-0 text-gray-400 mt-1">{React.cloneElement(icon, { className: "w-4 h-4" })}</div>
//         <div className="ml-3">
//             <p className="text-xs text-gray-500">{label}</p>
//             <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
//         </div>
//     </div>
// );

// // Timeline Item (Screenshot 109)
// const TimelineItem = ({ label, date, color }) => {
//     const colors = {
//         green: 'bg-green-500',
//         blue: 'bg-blue-500',
//         orange: 'bg-orange-500',
//     };
//     return (
//         <li className="flex items-center">
//             <span className={`h-2.5 w-2.5 rounded-full ${colors[color] || 'bg-gray-500'} mr-2`}></span>
//             <div>
//                 <p className="text-sm font-medium text-gray-800">{label}</p>
//                 <p className="text-xs text-gray-500">{date}</p>
//             </div>
//         </li>
//     );
// };

// export default ContractDetailsPage;