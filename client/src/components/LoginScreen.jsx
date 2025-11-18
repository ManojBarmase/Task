// client/src/components/LoginScreen.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Chrome, Check } from 'lucide-react'; // Icons
import logo1 from '../assets/logo1.png';

// Backend API URL (Vite environment variable से)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { 
                email, 
                password 
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);

            setMessage('✅ Login Successful! Redirecting...');
            
            // setTimeout(() => {
            //     navigate('/dashboard'); 
            // }, 1500);
            setTimeout(() => {
                // 👈️ नया रोल-बेस्ड रीडायरेक्ट
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'admin' || userRole === 'approver') {
                    navigate('/approvals');
                } else {
                    navigate('/requests');
                }
            }, 1500);

        } catch (error) {
            console.error("Login Error:", error.response ? error.response.data : error.message);
            setMessage(error.response 
                ? error.response.data.msg || 'Login failed. Check credentials.' 
                : 'Network Error. Server might be down.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-sky-200">

            {/* Login Card Container */}
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
                
                {/* Header (Logo and Description) */}
                <div className="text-center space-y-3">
                    <div className="flex px-0 py-1 flex-col items-center justify-center">
                        {/* 👇 YAHAN LOGO LAGAYA HAI */}
                        <img 
                            src={logo1} 
                            alt="ProcureIQ Logo" 
                            className="h-16 w-auto mb-2 object-contain" // h-16 size adjust karne ke liye hai
                        />
                    </div>
                    <p className="text-sm text-gray-600 pt-2">
                        Sign in to your ProcureIQ account
                    </p>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-3 text-center rounded-lg text-sm ${message.includes('Successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.includes('Successful') && <Check className="inline h-4 w-4 mr-1" />} {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* Email Field */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            />
                        </div>
                        <div className="text-right">
                            <a href="#" className="text-xs text-sky-600 hover:text-sky-800">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button 
                        type="submit" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-sky-600 text-white hover:bg-sky-700"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {/* OR Separator */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-4 text-xs uppercase text-gray-500 font-medium">
                        OR CONTINUE WITH
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Continue with Google Button */}
                <button 
                    type="button" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full border border-gray-300 text-gray-700  hover:bg-gray-50"
                >
                    <Chrome className="mr-2 h-4 w-4" /> Continue with Google
                </button>
                
                {/* Signup Link */}
                <div className="flex flex-col text-center pt-2">
                    <p className="text-sm text-gray-500">
                        Don't have an account? 
                        <a href="/signup" className="text-sky-600 hover:text-sky-800 ml-1 font-medium">Sign up</a>
                    </p>
                </div>
            </div>
            
            {/* Footer: © 2025 ProcureIQ */}
            <footer className="absolute bottom-4 text-xs text-gray-500">
                © 2025 ProcureIQ
            </footer>
        </div>
    );
};

export default LoginScreen;