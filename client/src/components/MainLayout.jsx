 // client/src/components/MainLayout.jsx 

import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LogOut, CheckSquare, Clock, Users, DollarSign, TrendingUp, LayoutDashboard, BarChart3 } from 'lucide-react';
import UserProfileModal from './UserProfileModal'
const MainLayout = () => {
    const navigate = useNavigate();
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Small screen toggle (Optional)

    // 👈️ नया स्टेट: प्रोफाइल मॉडल की स्थिति ट्रैक करने के लिए
    const [isProfileOpen, setIsProfileOpen] = useState(false); 
    
    // 👈️ नया हैंडलर: क्लिक करने पर स्थिति बदलने के लिए
    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

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

            {/* <div className="p-4 border-t border-gray-200">
                <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-white hover:bg-sky-900 hover:text-white rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Log Out
                </button>
            </div> */}
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
                            onClick={toggleProfile} // 👈️ यहां क्लिक हैंडलर जोड़ा गया
                        >
                            {userNameInitial}
                        </span>
                    </div>
                </header>

                {/* Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto"> {/* 👈️ overflow-y-auto: केवल यह क्षेत्र स्क्रॉल होगा */}
                    {/* Outlet renders the child route component (Dashboard or ApprovalsPage) */}
                    <Outlet />
                </main>
            </div>

           {/* 👈️ Conditional Rendering: मॉडल को यहां रेंडर करें */}
            {/* {isProfileOpen && <UserProfileModal onClose={toggleProfile} />} */}
           {/* 👈️ Profile Modal को अपडेट करें */}
            {isProfileOpen && <UserProfileModal 
                onClose={toggleProfile} 
                onLogout={handleLogout} // 👈️ यहां onLogout प्रॉप पास करें
            />}
        </div>
    );
};

export default MainLayout;