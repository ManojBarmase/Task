 // client/src/App.jsx 
 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import MainLayout from './components/MainLayout'; // 👈️ नया Import
import Dashboard from './components/Dashboard';
import ApprovalsPage from './components/ApprovalsPage';
import RequestsPage from './components/RequestsPage'; // (भविष्य के लिए)
import AnalyticsPage from './components/AnalyticsPage';
import VendorsPage from './components/VendorsPage';
import ContractsPage from './components/ContractsPage';
import IntegrationsPage from './components/IntegrationsPage';
import RequestForm from './components/RequestForm';

// Protected Route Component (इसे सरल रखें)
const ProtectedRoute = ({ element: Element, ...rest }) => {
    const token = localStorage.getItem('token');
    return token ? <Element {...rest} /> : <Navigate to="/" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
            
                 {/* 👇️ NEW: RequestForm is now a standalone route without MainLayout */}
                <Route path="/requests/new" element={<RequestForm />} />

                {/* Protected Routes - MainLayout as the Parent */}
                <Route element={<ProtectedRoute element={MainLayout} />}> {/* 👈️ Parent Route */}
                    {/* Child Routes will render inside MainLayout's <Outlet /> */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/approvals" element={<ApprovalsPage />} />
                    {/* भविष्य में Requests Page, Vendors Page आदि यहाँ जोड़ेंगे */}
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/vendors" element={<VendorsPage />} />
                    <Route path="/contracts" element={<ContractsPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
                  

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;