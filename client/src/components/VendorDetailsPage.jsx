// // client/src/components/VendorDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail, Phone, Globe, MapPin, Building, Briefcase, FileText, Download, CreditCard, Calendar } from 'lucide-react';

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

// Helper: Format Address
const formatAddress = (addressObj) => {
    if (!addressObj || !addressObj.address) return 'N/A';
    const parts = [
        addressObj.address,
        addressObj.city,
        addressObj.state,
        addressObj.zip,
        addressObj.country
    ];
    return parts.filter(part => part).join(', ');
};

// --- UPDATED Contract Item Component (Screenshot 155 Style) ---
const ContractItem = ({ contract }) => {
    const isExpired = new Date(contract.end_date) < new Date();
    const isCancelled = contract.renewalStatus === 'Cancelled';
    
    let statusColor = 'bg-green-100 text-green-800';
    let statusText = 'Active';

    if (isCancelled) {
        statusColor = 'bg-red-100 text-red-800';
        statusText = 'Cancelled';
    } else if (isExpired) {
        statusColor = 'bg-gray-100 text-gray-800';
        statusText = 'Expired';
    }

    // File name extract karna
    const fileName = contract.documentPath 
        ? (contract.documentPath.split('/').pop().split('-').slice(2).join('-') || 'contract_document.pdf')
        : 'document.pdf';

    return (
        <div className="border border-gray-200 rounded-xl p-6 mb-4 bg-white shadow-sm">
            
            {/* Header Row */}
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {contract.contractTitle || "Contract Agreement"}
                    </h4>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-sm text-gray-500 mb-6 font-medium">
                {contract.paymentFrequency || 'Annual'} Subscription
            </p>
            
            {/* Data Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <div className="flex items-center text-gray-900 font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(contract.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <div className="flex items-center text-gray-900 font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(contract.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                    <div className="text-gray-900 font-medium text-lg">
                        {formatCurrency(contract.contractValue)}
                    </div>
                </div>
            </div>

            {/* Attachments Section */}
            {contract.documentPath && (
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-3">Attachments (1)</p>
                    <div className="flex flex-wrap gap-4">
                        {/* File Card */}
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3 w-full md:w-auto md:min-w-[300px]">
                            <div className="flex items-center overflow-hidden">
                                <div className="bg-white p-2 rounded-md mr-3 border border-blue-100">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{fileName}</p>
                                    <p className="text-xs text-gray-500">PDF • Contract</p>
                                </div>
                            </div>
                            <a 
                                href={getDocumentUrl(contract.documentPath)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600 transition-colors ml-4 p-1"
                                title="Download"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const VendorDetailsPage = () => {
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVendorDetails = async () => {
            if (!id || !token) {
                setError("Missing ID or token.");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/vendors/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setVendor(res.data);
            } catch (err) {
                console.error("Vendor Detail Fetch Error:", err.response || err);
                setError("Failed to load vendor details.");
            } finally {
                setLoading(false);
            }
        };

        fetchVendorDetails();
    }, [id, token]);

    if (loading) return <div className="p-6 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!vendor) return <div className="p-8 text-center text-gray-500">No vendor data found.</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            {/* Header & Back Button */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Link to="/vendors" className="flex items-center text-sm text-sky-600 hover:underline mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Vendors
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-800">Vendor Profile</h1>
                    <p className="text-gray-500 text-sm">View vendor information and contracts</p>
                </div>
            </div>

            {/* Vendor Header Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-blue-50 p-4 rounded-xl">
                        <Building className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h2>
                        <div className="flex items-center mt-1 space-x-2">
                             <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                {vendor.category}
                             </span>
                        </div>
                        {vendor.dateAdded && (
                            <p className="text-xs text-gray-500 mt-2">
                                Partner since {new Date(vendor.dateAdded).getFullYear()}
                            </p>
                        )}
                    </div>
                </div>
                {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                    </a>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <h3 className="text-base font-semibold text-gray-800 mb-6 border-b pb-2">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <InfoItem icon={<Mail />} label="Contact Email" value={vendor.contactEmail || 'N/A'} />
                        <InfoItem icon={<Phone />} label="Phone" value={vendor.phoneNumber || 'N/A'} />
                        <InfoItem icon={<Globe />} label="Website" value={vendor.website || 'N/A'} />
                        <InfoItem icon={<Briefcase />} label="Product / Tool" value={vendor.productTool || 'N/A'} />
                        <InfoItem icon={<CreditCard />} label="Annual Spend" value={formatCurrency(vendor.annualSpend)} />
                        <InfoItem icon={<FileText />} label="Registered ID" value={vendor.registeredId || 'N/A'} />
                        <InfoItem icon={<MapPin />} label="Company Address" value={formatAddress(vendor.companyAddress)} />
                        <InfoItem icon={<MapPin />} label="Billing Address" value={formatAddress(vendor.billingAddress)} />
                    </div>
                </div>

                {/* Primary Contact */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-base font-semibold text-gray-800 mb-6 border-b pb-2">Primary Contact</h3>
                    <div className="space-y-6">
                        <InfoItem icon={<Briefcase />} label="Name" value={vendor.primaryContact?.name || vendor.contactPerson || 'N/A'} />
                        <InfoItem icon={<Mail />} label="Email" value={vendor.primaryContact?.email || vendor.contactEmail || 'N/A'} />
                        <InfoItem icon={<Phone />} label="Phone" value={vendor.primaryContact?.phone || vendor.phoneNumber || 'N/A'} />
                    </div>
                </div>
            </div>

            {/* Active Contracts (This matches Screenshot 155) */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Active Contracts</h3>
                {vendor.contracts && vendor.contracts.length > 0 ? (
                    <div className="space-y-4">
                        {vendor.contracts.map(contract => (
                            <ContractItem key={contract._id} contract={contract} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No active contracts found.</p>
                        <p className="text-sm text-gray-400 mt-1">Contracts will appear here once uploaded.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

// --- Helper Components ---
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 text-gray-400 mt-0.5">{React.cloneElement(icon, { className: "w-4 h-4" })}</div>
        <div className="ml-3 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
        </div>
    </div>
);

export default VendorDetailsPage;

// import React, {useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Loader2, ArrowLeft, Mail, Phone, Globe, MapPin, Building, Briefcase, FileText, Download, CreditCard } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// // API_BASE_URL ke baad add karein
// const getDocumentUrl = (path) => {
//     if (!path) return null;
//     // Path clean karein (Backslash to Forward Slash)
//     const cleanPath = path.replace(/\\/g, '/');
//     return `${API_BASE_URL}/${cleanPath}`;
// };

// // Helper function (ContractsPage se)
// const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0
//     }).format(amount);
// };

// // NAYA HELPER: Address object ko ek line mein format karne ke liye
// // NAYA HELPER: Address object ko ek line mein format karne ke liye
// const formatAddress = (addressObj) => {
//     if (!addressObj || !addressObj.address) return 'N/A';
    
//     // Naya format: Address Line, City, State, Zip, Country
//     const parts = [
//         addressObj.address,
//         addressObj.city,
//         addressObj.state,
//         addressObj.zip,
//         addressObj.country
//     ];
    
//     // Khali (empty) parts ko hata kar join karein
//     return parts.filter(part => part).join(', ');
// };


// const VendorDetailsPage = () => {
//     const [vendor, setVendor] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const { id } = useParams();
//     const token = localStorage.getItem('token');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchVendorDetails = async () => {
//             if (!id || !token) {
//                 setError("Missing ID or token.");
//                 setLoading(false);
//                 return;
//             }
//             try {
//                 // Backend route (GET /api/vendors/:id) waisa hi rahega
//                 const res = await axios.get(`${API_BASE_URL}/api/vendors/${id}`, {
//                     headers: { 'x-auth-token': token }
//                 });
//                 setVendor(res.data); // 'res.data' mein ab vendor + contracts hain
//             } catch (err) {
//                 console.error("Vendor Detail Fetch Error:", err.response || err);
//                 setError("Failed to load vendor details.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchVendorDetails();
//     }, [id, token]);

//     if (loading) return <div className="p-6 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /></div>;
//     if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
//     if (!vendor) return <div className="p-8 text-center text-gray-500">No vendor data found.</div>;

//     return (
//         <div className="p-6 space-y-6 bg-gray-50 min-h-full">
//             {/* 1. Header & Back Button */}
//             <div className="flex justify-between items-center mb-4">
//                 <div>
//                     <Link to="/vendors" className="flex items-center text-sm text-sky-600 hover:underline mb-2">
//                         <ArrowLeft className="w-4 h-4 mr-1" />
//                         Back to Vendors
//                     </Link>
//                     <h1 className="text-xl font-semibold text-gray-800">Vendor Profile</h1>
//                     <p className="text-gray-500 text-sm">View vendor information and contracts</p>
//                 </div>
//             </div>

//             {/* 2. Vendor Header Card (Full Dynamic) */}
//             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex justify-between items-start">
//                 <div className="flex items-center space-x-4">
//                     <div className="flex-shrink-0 bg-sky-100 p-4 rounded-lg">
//                         <Building className="w-8 h-8 text-sky-700" />
//                     </div>
//                     <div>
//                         <h2 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h2>
//                         <p className="text-gray-600">{vendor.category}</p>
//                         {/* 'partnerSince' ki jagah 'dateAdded' ka istemaal */}
//                         {vendor.dateAdded && (
//                             <p className="text-xs text-gray-500 mt-1">
//                                 Partner since {new Date(vendor.dateAdded).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                             </p>
//                         )}
//                     </div>
//                 </div>
//                 {vendor.website && (
//                     <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
//                         <Globe className="w-4 h-4 mr-2" />
//                         Visit Website
//                     </a>
//                 )}
//             </div>

//             {/* 3. Info Cards (Full Dynamic) */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Company Information */}
//                 <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
//                     <div className="space-y-4">
//                         {/* Purane Fields */}
//                         <InfoItem icon={<Mail />} label="Contact Email" value={vendor.contactEmail|| 'N/A'} />
//                         <InfoItem icon={<Phone />} label="Phone" value={vendor.phoneNumber || 'N/A'} />
//                         <InfoItem icon={<Globe />} label="Website" value={vendor.website || 'N/A'} />

//                         {/* 👇 NAYE FIELDS YAHAN ADD HUWE HAIN 👇 */}
//                         <InfoItem icon={<Briefcase />} label="Product / Tool" value={vendor.productTool || 'N/A'} />
//                         <InfoItem icon={<CreditCard />} label="Annual Spend" value={formatCurrency(vendor.annualSpend)} />
//                         <InfoItem icon={<FileText />} label="Company Registered ID" value={vendor.registeredId || 'N/A'} />
                        
//                         {/* Address fields ab naye helper se format honge */}
//                         <InfoItem icon={<MapPin />} label="Company Address" value={formatAddress(vendor.companyAddress)} />
//                         <InfoItem icon={<MapPin />} label="Billing Address" value={formatAddress(vendor.billingAddress)} />
//                     </div>
//                 </div>

//                 {/* Primary Contact */}
//                 <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Contact</h3>
//                     <div className="space-y-4">
//                         {/* 👇 Nested object check karein (vendor.primaryContact?.) */}
//                         <InfoItem 
//                             icon={<Briefcase />} 
//                             label="Name" 
//                             value={vendor.primaryContact?.name || vendor.contactPerson || 'N/A'} 
//                         />
//                         <InfoItem 
//                             icon={<Mail />} 
//                             label="Email" 
//                             value={vendor.primaryContact?.email || vendor.contactEmail || 'N/A'} 
//                         />
//                         <InfoItem 
//                             icon={<Phone />} 
//                             label="Phone" 
//                             value={vendor.primaryContact?.phone || vendor.phoneNumber || 'N/A'} 
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* 4. Active Contracts (Yeh logic waisa hi rahega) */}
//             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Contracts</h3>
//                 {vendor.contracts && vendor.contracts.length > 0 ? (
//                     <div className="space-y-4">
//                         {vendor.contracts.map(contract => (
//                             <ContractItem key={contract._id} contract={contract} onClick={() => navigate(`/contracts/${contract._id}`)} />
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-4 text-gray-500">
//                         No active contracts found for this vendor.
//                     </div>
//                 )}
//             </div>

//         </div>
//     );
// };

// // --- Helper Components (Isi file mein neeche) ---

// const InfoItem = ({ icon, label, value }) => (
//     <div className="flex items-start">
//         <div className="flex-shrink-0 text-gray-400 mt-1">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
//         <div className="ml-3 min-w-0"> {/* min-w-0 text wrap ke liye zaroori hai */}
//             <p className="text-sm text-gray-500">{label}</p>
//             <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
//         </div>
//     </div>
// );

// // Contract Item Component
// // Contract Item Component (Updated)
// // Contract Item Component (Updated with Document Link)
// const ContractItem = ({ contract, onClick }) => {
//     const isExpired = new Date(contract.end_date) < new Date();
//     const isCancelled = contract.renewalStatus === 'Cancelled';
    
//     let statusColor = 'bg-green-100 text-green-800';
//     let statusText = 'Active';

//     if (isCancelled) {
//         statusColor = 'bg-red-100 text-red-800';
//         statusText = 'Cancelled';
//     } else if (isExpired) {
//         statusColor = 'bg-gray-100 text-gray-800';
//         statusText = 'Expired';
//     }

//     return (
//         <div className="border border-gray-200 rounded-lg p-4 hover:bg-sky-50 transition-colors flex flex-col">
//             {/* Header Row */}
//             <div className="flex justify-between items-start mb-2">
//                 <div onClick={onClick} className="cursor-pointer flex-1">
//                     <span className="font-semibold text-gray-700 text-base block hover:text-sky-600">
//                         {contract.contractTitle || "Contract"}
//                     </span>
//                     <p className="text-sm text-gray-500 font-medium mt-1">
//                         {contract.paymentFrequency || 'Annual'} Subscription
//                     </p>
//                 </div>
                
//                 <div className="flex flex-col items-end space-y-2">
//                     <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
//                         {statusText}
//                     </span>
                    
//                     {/* 👇 NEW: Document Download Button */}
//                     {contract.documentPath && (
//                         <a 
//                             href={getDocumentUrl(contract.documentPath)} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="text-sky-600 hover:text-sky-800"
//                             title="View Document"
//                             onClick={(e) => e.stopPropagation()} // Prevent navigating to details page
//                         >
//                             <Download className="w-5 h-5" />
//                         </a>
//                     )}
//                 </div>
//             </div>
            
//             {/* Grid Data (Clickable Area) */}
//             <div className="grid grid-cols-3 gap-4 text-sm mb-1 cursor-pointer" onClick={onClick}>
//                 <div>
//                     <p className="text-xs text-gray-400 uppercase font-semibold">Start Date</p>
//                     <p className="text-gray-700 font-medium mt-1">
//                         {new Date(contract.start_date).toLocaleDateString()}
//                     </p>
//                 </div>
//                 <div>
//                     <p className="text-xs text-gray-400 uppercase font-semibold">End Date</p>
//                     <p className="text-gray-700 font-medium mt-1">
//                         {new Date(contract.end_date).toLocaleDateString()}
//                     </p>
//                 </div>
//                 <div>
//                     <p className="text-xs text-gray-400 uppercase font-semibold">Value</p>
//                     <p className="text-gray-700 font-medium mt-1">
//                         {formatCurrency(contract.contractValue)}
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };


// export default VendorDetailsPage;
