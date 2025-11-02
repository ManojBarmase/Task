// client/src/components/RequestForm.jsx (पूरी फ़ाइल को बदलें)

import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, CornerDownLeft, Loader2, Check, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'R&D'];

// --- Step Components (Placeholders for now) ---

// Step 1: Basic Info
const Step1 = ({ formData, handleChange, handleNext }) => (
    <div className="px-5 py-5 bg-white border rounded-md shadow-lg space-y-6 ">
        <h3 className="text-xl font-semibold text-gray-800  pb-2">Basic Info</h3>
        <p className="text-gray-500">Enter the basic information about your request</p>
        
        {/* Request Title */}
        <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Request Title</label>
            <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 bg-sky-50 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g., Office Supplies - Q1 2025"
            />
        </div>

        {/* Department */}
        <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <select
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 bg-sky-50 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Select Ddepartment"
           >
                <option value="" >Select department</option>
                {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>
        </div>
        
        <div className="flex justify-end pt-4">
            <button
                type="button"
                onClick={() => { if (formData.title && formData.department) handleNext(); }}
                className="flex items-center px-3 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-500 transition-colors disabled:bg-sky-300"
                disabled={!formData.title || !formData.department}
            >
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </div>
);

// Step 2: Vendor (Placeholder)
const Step2 = ({ formData, handleChange, handleNext, handlePrev }) => (
    <div className="space-y-6 bg-white px-6 pt-6 pb-16 border rounded-md shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800  pb-2">Vendor</h3>
        <p className="text-gray-600">Select the vendor for this request</p>
        
        {/* Vendor Name Field (from your old form) */}
        <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">Vendor</label>
            <input
                type="text"
                name="vendorName"
                id="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className="mt-1 block w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Select vendor"
            />
        </div>

        <div className='flex w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3'>
           <h5 className='font-semibold  text-gray-700'>Tip:</h5>
           <p className='font-normal  text-gray-500'>Select an existing vendor from our approved list or add a new vendor for review.</p>
        </div>

        <div className="flex justify-between pt-4">
             <button
                type="button"
                onClick={handlePrev}
                className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <button
                type="button"
                onClick={handleNext} // Assuming vendorName is optional, so we can always proceed
                className="flex items-center px-2 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </div>
);

// Step 3: Budget & Justification (Placeholder)
const Step3 = ({ formData, handleChange, handleNext, handlePrev }) => (
    <div className="space-y-6 bg-white p-6 border rounded-md shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800  pb-2">Budget & Justification</h3>
        <p className="text-gray-600">Provide budget details and business justification</p>

         {/* Cost */}
        <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Estimated Cost</label>
            <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                    type="number"
                    name="cost"
                    id="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    className="block w-full bg-sky-50 rounded-md border border-gray-300 pl-7 pr-12 p-3 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="0.00"
                />
            </div>
        </div>
        
        {/* Description */}
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Business Justification</label>
            <textarea
                name="description"
                id="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                className="mt-1 block w-full bg-sky-50 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Explain why this purchase is necessary and how it will benefit the organization"
            ></textarea>
            <p className='text-sm font-light text-gray-500' >Provide a clear explanation for budget approval</p>
        </div>


        <div className="flex justify-between pt-4">
             <button
                type="button"
                onClick={handlePrev}
                className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <button
                type="button"
                onClick={() => { if (formData.cost && formData.description) handleNext(); }}
                className="flex items-center px-2 py-1 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400"
                disabled={!formData.cost || !formData.description || parseFloat(formData.cost) <= 0}
            >
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    </div>
);

// Step 4: Review and Submit
const Step4 = ({ formData, handleSubmit, loading }) => (
    <div className="space-y-6 bg-white p-6 border rounded-md shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800  pb-2">Review</h3>
        <p className="text-gray-600">Please review your request details before submission.</p>

        {/* Review Summary */}
        <div className="bg-sky-50 p-4 rounded-lg space-y-2">
            <p><strong> Request Title:</strong><br /> {formData.title}</p>
            <p><strong>Department:</strong><br /> {formData.department}</p>
            <p><strong>Vendor:</strong> <br />{formData.vendorName || 'N/A'}</p>
            <p><strong>Estimated Cost:</strong> <br />${parseFloat(formData.cost).toFixed(2)}</p>
            <p><strong>Business Justification:</strong><br /> {formData.description}</p>
        </div>

        <div className=' w-full bg-yellow-50 border border-yellow-300 rounded-md shadow-sm p-3'>
           <p className='font-normal text-sm text-yellow-800'>Please review all information carefully before submitting. Once submitted, your request will be sent for approval.</p>
        </div>
  
        <div className="flex justify-end pt-4">
            <button
                type="button"
                onClick={handleSubmit}
                className={`flex items-center px-2 py-1 text-white font-medium rounded-lg transition-colors 
                    ${loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CornerDownLeft className="w-4 h-4 mr-2" />}
                {loading ? 'Submitting...' : 'Confirm & Submit'}
            </button>
        </div>
    </div>
);


// --- Main RequestForm Component ---

const RequestForm = ({ onSave }) => {
    // We remove onClose as it's a full-page component now
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: '', // Stays as string input
        department: departments[0] || '', 
        vendorName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const steps = [
        { label: 'Basic Info', component: Step1 },
        { label: 'Vendor', component: Step2 },
        { label: 'Budget & Justification', component: Step3 },
        { label: 'Review', component: Step4 }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    // Use window.history to go back to Dashboard/Requests Page
    // const handleBack = () => {
    //     window.history.back(); 
    // };

    // Use window.history.back() or navigate to a specific path
    const handleBackToDashboard = () => {
        navigate('/dashboard'); 
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("Error: Not authorized. Please log in again.");
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            cost: parseFloat(formData.cost) 
        };

        try {
            const res = await axios.post(`/api/requests`, payload, {
                headers: { 'x-auth-token': token }
            });
            
            setSuccess(true);
            // onSave(res.data); 
            
            // Redirect back to request list after success
            // setTimeout(handleBackToDashboard, 2000);
            // 👇️ FIX: /dashboard के बजाय /requests पर रीडायरेक्ट करें और State पास करें
                setTimeout(() => {
                    navigate('/requests', { state: { requestSubmitted: true } });
                }, 2000); 
            
        } catch (err) {
            console.error("Request Submission Error:", err.response || err);
            setError(err.response?.data?.msg || "Failed to submit request. Check console.");
        } finally {
            setLoading(false);
        }
    };
    
    // Get the current step component
    const CurrentStepComponent = steps[currentStep - 1].component;


    return (
        <div className="flex h-screen overflow-hidden">

            {/* 👇️ Custom Sidebar for RequestForm: Only Back to Dashboard Link */}
            <div className=" flex flex-col flex-shrink-0 bg-sky-800 border-r border-gray-200 h-full" style={{ width: '256px' }}>
                <div className="h-16 flex items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-normal text-white">ProcureIQ</h1>
                </div>
                <div className="pt-1 pb-1 overflow-y-auto">
                    <nav className="space-y-1 px-4">
                        <button
                            onClick={handleBackToDashboard}
                            className={`flex items-center w-full text-white px-4 py-2.5 rounded-lg transition-colors hover:bg-sky-900`}
                        >
                            {/* 👇️ FIX: MainLayout के बजाय LayoutDashboard का उपयोग करें */}
                            <LayoutDashboard className="w-5 h-5 mr-3" /> 
                            Back to Dashboard
                        </button>
                    </nav>
                </div>
            </div>

            <div className=" flex-1 flex flex-col overflow-y-auto ">
                
                {/* Back Button */}
                {/* <button 
                    onClick={handleBack}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button> */}

                {/* Main Card */}
                <div className=" px-32 bg-gray-50 rounded-xl shadow-2xl p-8">
                    <h1 className="text-xl font-semibold text-gray-800 mb-2">New Request</h1>
                    <p className="text-gray-500 mb-8">Complete the form below to submit a new procurement request.</p>

                    {/* Step Indicator */}
                    <div className="flex justify-between items-center pb-4 mb-6">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold 
                                    ${index + 1 === currentStep ? 'bg-sky-500  ' : 
                                    (index + 1 < currentStep ? 'bg-sky-700' : 'bg-gray-400')}`
                                }>
                                    {index + 1 < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${index + 1 <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm mb-4">
                            ✅ Request submitted successfully! Redirecting...
                        </div>
                    )}

                    {/* Current Step Content */}
                    <CurrentStepComponent 
                        formData={formData} 
                        handleChange={handleChange} 
                        handleNext={handleNext} 
                        handlePrev={handlePrev} 
                        handleSubmit={handleSubmit} 
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestForm;