import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // 👈 Naye imports
import { Loader2, ArrowLeft, Mail, Phone, Globe, MapPin, Building, Briefcase, FileText, Download } from 'lucide-react'; // 👈 Icons

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VendorDetailsPage = () => {
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams(); // 👈 URL se vendor ID nikalega
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchVendorDetails = async () => {
            if (!id || !token) {
                setError("Missing ID or token.");
                setLoading(false);
                return;
            }
            try {
                // Step 1 wala naya API route call karein
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
    }, [id, token]); // Jab bhi ID ya token badle, dobara fetch karein

    if (loading) return <div className="p-6 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Vendor Details...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-6 rounded-lg">{error}</div>;
    if (!vendor) return <div className="p-8 text-center text-gray-500">No vendor data found.</div>;

    // Screenshot (105) ke hisab se JSX
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            {/* 1. Header & Back Button */}
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

            {/* 2. Vendor Header Card (Screenshot 105) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-sky-100 p-4 rounded-lg">
                        <Building className="w-8 h-8 text-sky-700" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h2>
                        <p className="text-gray-600">{vendor.category}</p>
                        <p className="text-xs text-gray-500 mt-1">Partner since 2019</p>
                    </div>
                </div>
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-sm bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                </a>
            </div>

            {/* 3. Info Cards (Screenshot 106) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Information */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
                    <div className="space-y-4">
                        <InfoItem icon={<Mail />} label="Email" value={vendor.contactEmail} />
                        <InfoItem icon={<Phone />} label="Phone" value={vendor.phone || "+1 (650) 253-0000"} />
                        <InfoItem icon={<Globe />} label="Website" value={vendor.website || "www.google.com"} />
                        <InfoItem icon={<MapPin />} label="Address" value={vendor.address || "1600 Amphitheatre Parkway, Mountain View, CA 94043"} />
                    </div>
                </div>

                {/* Primary Contact */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Contact</h3>
                    <div className="space-y-4">
                        <InfoItem icon={<Briefcase />} label="Name" value={vendor.contactName || "Account Manager"} />
                        <InfoItem icon={<Mail />} label="Email" value={vendor.contactEmail} />
                        <InfoItem icon={<Phone />} label="Phone" value={vendor.contactPhone || "+1 (650) 253-0001"} />
                    </div>
                </div>
            </div>

            {/* 4. Active Contracts (Screenshot 106) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Contracts</h3>
                {/* Yahaan aap vendor.contracts par map kar sakte hain (agar data hai) */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">Google Workspace Enterprise</span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Annual Subscription</p>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="text-gray-800 font-medium">Jan 1, 2024</p>
                        </div>
                        <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="text-gray-800 font-medium">Dec 31, 2024</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Contract Value</p>
                            <p className="text-gray-800 font-medium">$145,000</p>
                        </div>
                    </div>
                    {/* Attachments */}
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Attachments (2)</h4>
                    <div className="space-y-2">
                        <AttachmentItem name="Google_Workspace_Contract.pdf" size="2.1 MB" />
                        <AttachmentItem name="Service_Agreement.pdf" size="1.3 MB" />
                    </div>
                </div>
            </div>

        </div>
    );
};

// Helper components (isi file mein neeche rakhein)
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 text-gray-400 mt-1">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
        <div className="ml-3">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

const AttachmentItem = ({ name, size }) => (
    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center">
            <FileText className="w-5 h-5 text-sky-600" />
            <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{size}</p>
            </div>
        </div>
        <button className="text-gray-500 hover:text-sky-600">
            <Download className="w-5 h-5" />
        </button>
    </div>
);

export default VendorDetailsPage;