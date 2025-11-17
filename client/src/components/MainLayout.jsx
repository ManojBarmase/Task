 // client/src/components/MainLayout.jsx 

import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { LogOut, CheckSquare, Clock, Users, DollarSign, TrendingUp, LayoutDashboard, BarChart3, User } from 'lucide-react';
// import UserProfileModal from './UserProfileModal'
const MainLayout = () => {
    const navigate = useNavigate();
   
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // 👈️ 1. ड्रॉपडाउन के लिए
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);   // 👈️ 2. मोडल के लिए

// ड्रॉपडाउन को टॉगल करने का फ़ंक्शन
const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
};

// मोडल को टॉगल करने का फ़ंक्शन
const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
}

    const userRole = localStorage.getItem('userRole'); 
    const isApprover = userRole === 'approver' || userRole === 'admin'; 
    const isSuperAdmin = userRole === 'super-admin'; // 👈️ नया 'super-admin' रोल

    // 👈️ नया वेरिएबल: यह तब true होगा जब user न तो approver हो और न ही admin.
    const isEmployee = userRole === 'requester';
    const userNameInitial = localStorage.getItem('userNameInitial') || 'JD'; 
    // NOTE: सुनिश्चित करें कि आप लॉगिन/रजिस्टर के बाद यह 'userNameInitial' localStorage में सेव कर रहे हैं।

   // 👈️ isApprover लॉजिक को अन्य लिंक्स पर लागू करें
const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', current: true, show: isSuperAdmin }, // हमेशा दिखाएं
    { name: 'Requests', icon: Clock, href: '/requests', current: false, show: true },           // हमेशा दिखाएं
    
    // Approver/Admin के लिए विशिष्ट लिंक्स:
    { name: 'Approvals', icon: CheckSquare, href: '/approvals', current: false, show: isApprover }, 
    
    // Employee (Requester) को ये लिंक्स नहीं दिखने चाहिए
    { name: 'Vendors', icon: Users, href: '/vendors', current: false, show: isApprover }, // 👈️ केवल Approver/Admin के लिए
    { name: 'Contracts', icon: DollarSign, href: '/contracts', current: false, show: isApprover }, // 👈️ केवल Approver/Admin के लिए
    { name: 'Integrations', icon: TrendingUp, href: '/integrations', current: false, show: isApprover }, // 👈️ केवल Approver/Admin के लिए
    { name: 'Analytics', icon: BarChart3, href: '/analytics', current: false, show: isApprover }, // 👈️ केवल Approver/Admin के लिए
];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userNameInitial'); 
        navigate('/');
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center text-white px-4 py-2.5 rounded-lg transition-colors ${
            isActive ? 'bg-sky-400 text-sky-700 font-semibold' : 'text-white hover:bg-sky-900'
        }`;
    
    // --- Sidebar JSX ---
    const Sidebar = (
        <div className="flex flex-col flex-shrink-0 bg-sky-800 border-r border-gray-200 h-full" style={{ width: '256px' }}> {/* h-full जोड़ा गया */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                <h1 className="text-xl font-normal text-white">ProcureIQ</h1>
            </div>

            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto"> {/* Sidebar Navigation Scrollable */}
                <nav className="space-y-1 px-4">
                    {navLinks
                        .filter(item => item.show)
                        .map((item) => (
                        <NavLink key={item.name} to={item.href} className={navLinkClasses}>
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            
        </div>
    );
    // ----------------------------------------------------

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden"> {/* 👈️ h-screen और overflow-hidden */}
            {/* 1. Sidebar */}
            {Sidebar}

            {/* 2. Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main Header (Static Top Bar) */}
                <header className="h-16 flex items-center justify-between px-6  bg-white border-b-2 shadow-lg flex-shrink-0"> {/* 👈️ flex-shrink-0 */}
                    <div className="flex-1 max-w-lg">
                        <input
                            type="text"
                            placeholder="Search requests, vendors, contracts..."
                            className="w-full px-4 py-2 text-gray-800 border border-gray-300 bg-sky-50  rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm font-normal "
                        />
                    </div>
                   <div className="flex items-center space-x-4 relative"> {/* relative जोड़ा गया ताकि मॉडल को absolute position दी जा सके */}
                        <span 
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-sky-600 text-white font-bold cursor-pointer transition-shadow hover:shadow-lg"
                            onClick={toggleProfileDropdown} // 👈️ यहां क्लिक हैंडलर जोड़ा गया
                        >
                            {userNameInitial}
                        </span>
                        {/* 👇️ NEW: Profile Dropdown (Screenshot 101) */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-medium text-gray-900 truncate">My Account</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to="/profile" // Step 2 wale route par bhejega
                                                onClick={() => setIsProfileDropdownOpen(false)} // Sirf dropdown band karega
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                              >
                                                <User className="w-4 h-4 mr-2" /> My Profile
                                            </Link>
                                            <button
                                                // (Requestors page ke liye)
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            >
                                                <Users className="w-4 h-4 mr-2" /> Requestors
                                            </button>
                                            <div className="border-t my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                        {/* 👆️ END NEW */}
                    </div>
                </header>

                {/* Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto"> {/* 👈️ overflow-y-auto: केवल यह क्षेत्र स्क्रॉल होगा */}
                    {/* Outlet renders the child route component (Dashboard or ApprovalsPage) */}
                    <Outlet />
                </main>
            </div>

          
        </div>
    );
};

export default MainLayout;