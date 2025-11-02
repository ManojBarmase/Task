// client/src/components/VendorsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Loader2 } from 'lucide-react';
import AddVendorForm from './AddVendorForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (amount) => {
    // Convert to K or M for display (like $129.4K)
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
};

// Rating Stars Component
const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
        <span className="flex items-center space-x-0.5">
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
            {hasHalfStar && <span className="text-yellow-400">½</span>}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
            <span className="ml-1 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
        </span>
    );
};

// Status Pill Component
const getCompliancePill = (status) => {
    let classes = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
    
    switch (status) {
        case 'Compliant':
            classes += ' bg-green-100 text-green-800';
            break;
        case 'Pending':
            classes += ' bg-yellow-100 text-yellow-800';
            break;
        case 'Non-Compliant':
            classes += ' bg-red-100 text-red-800';
            break;
        default:
            classes += ' bg-gray-100 text-gray-800';
            break;
    }

    return <span className={classes}>{status}</span>;
};


const AllCategories = [
    'All Categories',
    'Productivity',
    'Communication',
    'Project Management',
    'Cloud Services',
    'Hardware',
    'CRM',
    'Development',
    'Design Software',
    'Other'
];

const VendorsPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories'); // 👈️ नया State
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [showAddVendorForm, setShowAddVendorForm] = useState(false);


    const token = localStorage.getItem('token');

    // Fetch Vendors
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/vendors`, {
                    headers: { 'x-auth-token': token }
                });
                setVendors(res.data);
            } catch (err) {
                console.error("Vendors Fetch Error:", err.response || err);
                setError("Failed to load vendor data.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchVendors();
        }
    }, [token]);

    // Calculate Metrics for Cards (MOCK DATA for now, integrate with Request spend later)
    const activeCount = vendors.length;
    const totalSpend = vendors.reduce((sum, v) => sum + (v.annualSpend || 0), 0);
    const compliantCount = vendors.filter(v => v.complianceStatus === 'Compliant').length;
    const avgRating = activeCount > 0 ? (vendors.reduce((sum, v) => sum + v.rating, 0) / activeCount) : 0;
    
    // Filtering Logic (Updated to include Category and Status)
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = 
            vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.productTool.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesCategory = 
            selectedCategory === 'All Categories' || 
            vendor.category === selectedCategory;
            
        const matchesStatus = 
            selectedStatus === 'All Status' || 
            vendor.complianceStatus === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

// Function to handle a new vendor being added
    const handleVendorAdded = (newVendor) => {
        setVendors(prev => [newVendor, ...prev]); // Add new vendor to the list
        setShowAddVendorForm(false); // Close the form
    };

    if (loading) return <div className="p-6 text-center text-lg"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-sky-600" /> Loading Vendor Directory...</div>;
    if (error) return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-6 rounded-lg">{error}</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            
            {/* Header and Add Vendor Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-700">Vendors</h1>
                <button 
                     onClick={() => setShowAddVendorForm(true)}
                    className="flex items-center px-2 py-1 text-sm bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Vendor
                </button>
            </div>
            <p className="text-gray-600 -mt-4 mb-6">Manage your SaaS tools, products and vendor relationships</p>


            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                {/* Active Vendors Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Active Vendors</p>
                    <div className="text-3xl font-normal text-gray-900">{activeCount}</div>
                    <p className="text-xs text-gray-500">{activeCount} total vendors</p>
                </div>
                
                {/* Total Spend Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Total Spend</p>
                    <div className="text-3xl font-normal text-gray-900 ">{formatCurrency(totalSpend)}</div>
                    <p className="text-xs text-gray-500">across all vendors</p>
                </div>
                
                {/* Compliant Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Compliant</p>
                    <div className="text-3xl font-normal text-gray-900">{compliantCount}</div>
                    <p className="text-xs text-gray-500">Meeting requirements</p>
                </div>

                 {/* Avg. Rating Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Avg. Rating</p>
                    <div className="text-3xl font-normal text-gray-900">{avgRating.toFixed(1)}</div>
                    <p className="text-xs text-gray-500">Overall performance</p>
                </div>
            </div>
            
            {/* Search and Filters Bar */}
            <div className="flex space-x-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by vendor, product, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-sky-50 p-3 border border-gray-300  text-gray-600 pl-10 pr-4 py-2 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
                    />
                </div>
                
                {/* 1. Category Dropdown (Updated) */}
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className=" bg-sky-50 border border-gray-300 rounded-lg p-2.5 text-sm w-44" // Added w-44 for better width
                >
                    {AllCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

              <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-sky-50 border border-gray-300 rounded-lg p-2.5 text-sm w-40" // Added w-40
                >
                    <option value="All Status">All Status</option>
                    <option value="Compliant">Compliant</option>
                    <option value="Pending">Pending</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                </select>
            </div>

            {/* Vendor Directory Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-600 mb-4">Vendor Directory</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Tool</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-sky-50">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">
                                        <div className="flex items-center">
                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-sky-800 text-white font-normal text-xs mr-3">
                                                {vendor.vendorName.substring(0,2).toUpperCase()}
                                            </span>
                                            {vendor.vendorName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{vendor.productTool}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{vendor.category}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-600">{vendor.contactEmail}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-normal text-gray-800">{formatCurrency(vendor.annualSpend)}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-xl"><RatingStars rating={vendor.rating} /></td>
                                    <td className="px-6 py-3 whitespace-nowrap">{getCompliancePill(vendor.complianceStatus)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No vendors match your search criteria.</div>
                )}
            </div>
            {/* 👇️ Add Vendor Form (Modal) */}
            {showAddVendorForm && (
                <AddVendorForm 
                    onClose={() => setShowAddVendorForm(false)} 
                    onVendorAdded={handleVendorAdded}
                />
            )}
        </div>
    );
};

export default VendorsPage;