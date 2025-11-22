import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Loader2, User } from 'lucide-react';

// API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Dropdown Options
const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering'];
const locations = ['HQ - San Francisco, CA', 'Office - New York, NY', 'Office - London, UK', 'Remote'];

const ManageRequestors = () => {
    const [requestors, setRequestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    // 1. Fetch Requestors form API
    const fetchRequestors = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/requestors`, {
                headers: { 'x-auth-token': token }
            });
            setRequestors(res.data);
        } catch (err) {
            console.error("Error fetching requestors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestors();
    }, []);

    // Form Data State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        location: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Handle Submit (Add API)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/requestors`, formData, {
                headers: { 'x-auth-token': token }
            });

            // List update karein
            setRequestors([res.data, ...requestors]);
            
            // Reset Form
            setFormData({ firstName: '', lastName: '', email: '', department: '', location: '' });
            setIsAdding(false);
            alert(`Requestor added! Default password is: Strong@2029`); // Notify admin

        } catch (err) {
            setError(err.response?.data?.msg || "Failed to add requestor.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // 3. Handle Delete (Delete API)
    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to remove this requestor? This cannot be undone.")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/requestors/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                // UI se hatayein
                setRequestors(requestors.filter(req => req._id !== id));
            } catch (err) {
                alert("Failed to delete requestor.");
            }
        }
    };

    const handleCancel = () => {
        setFormData({ firstName: '', lastName: '', email: '', department: '', location: '' });
        setIsAdding(false);
        setError(null);
    };

    if (loading) return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin inline-block text-blue-600" /></div>;

    return (
        <div className="mt-8">
            
            {/* Header Section */}
            {!isAdding && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Manage Requestors</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Add and manage people who can submit procurement requests
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Requestor
                    </button>
                </div>
            )}

            {/* New Requestor Form */}
            {isAdding && (
                <div className="mb-8 bg-white border border-blue-200 rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">New Requestor</h3>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                <select name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" required>
                                    <option value="">Select department</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Office Location *</label>
                                <select name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" required>
                                    <option value="">Select office location</option>
                                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={handleCancel} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={submitLoading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center">
                                {submitLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add Requestor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Requestors Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office Location</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requestors.length > 0 ? (
                            requestors.map((person) => (
                                <tr key={person._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                                                {/* Initials */}
                                                {(person.firstName?.[0] || '') + (person.lastName?.[0] || '')}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {person.firstName} {person.lastName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {person.department || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.officeLocation || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleDelete(person._id)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                    No requestors found. Click "Add Requestor" to add one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageRequestors;