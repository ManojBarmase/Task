// client/src/components/SignupScreen.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png'; // Logo import

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SignupScreen = () => {
    const [formData, setFormData] = useState({
        firstName: '', // 👈 Changed from name
        lastName: '',  // 👈 Added lastName
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation updated for first/last name
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            // Call the Backend Register API
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
            
            localStorage.setItem('token', res.data.token); 
            localStorage.setItem('userRole', res.data.role); 
            localStorage.setItem('userId', res.data.user.id);

            alert("Registration successful! Redirecting to Dashboard."); 

            setTimeout(() => {
                navigate('/requests'); 
            }, 1000);

        } catch (err) {
            const msg = err.response?.data?.msg || "Registration failed. Server error or User already exists.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-sky-100">
                
                {/* Header and Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 mb-4">
                        {/* Logo Lagaya */}
                        <img src={logo} alt="ProcureIQ Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="text-sm text-gray-500">Sign up to start managing your requests.</p>
                </div>
                
                <form onSubmit={handleSignup} className="space-y-4">
                    
                    {/* First Name & Last Name Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="firstName" className="sr-only">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="lastName" className="sr-only">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Signup Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md transition-colors ${
                            loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                    >
                        {loading ? 'Processing...' : 'Sign Up'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/')}
                        className="font-medium text-sky-600 hover:text-sky-500"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupScreen;