// client/src/components/AnalyticsPage.jsx

import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { Download, ChevronDown, TrendingUp, TrendingDown, Info, Save, Zap, Users } from 'lucide-react';
import axios from 'axios';
import EngagementChart from './EngagementChart';
import Recommendations from './Recommendations';
import ShadowITList from './ShadowITList';
import AccessRiskAnalysis from './AccessRiskAnalysis';

// ... (MOCK_ANALYTICS_METRICS, MOCK_USAGE_DATA, MOCK_RECOMMENDATIONS definitions from Step 1) ...

// Helper Component for Metric Cards
const MetricCard = ({ title, value, unit, subtext, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md " style={{ borderColor: color }}>
        <p className="text-sm font-normal text-gray-500">{title}</p>
        <div className="flex items-end justify-between mt-2">
           <h3 className="text-3xl font-normal text-gray-900">
                {value !== undefined ? value.toLocaleString() : 'N/A'}
                <span className="text-base font-bold ml-1" style={{ color: color }}>{unit}</span>
            </h3>
            {/* <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{subtext}</p> */}
        </div>
         <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{subtext}</p>
    </div>
);

// Helper Component for App Performance Boxes (Top Performing/Needing Attention)
const AppPerformanceBox = ({ title, data, borderColor }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border" style={{ borderColor: borderColor }}>
        <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: borderColor }}>
            {title}
        </h3>
        <div className="space-y-3">
             {data.length > 0 ? (
                data.map((app, index) => (
                    <div key={app.name} className="flex justify-between items-center border-b last:border-b-0 pb-2">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-semibold text-gray-500 w-4">{index + 1}</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2`} style={{ backgroundColor: borderColor }}>
                                {/* Example: Use first letter of app name as icon fallback */}
                                {app.icon || app.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-800">{app.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: borderColor }}>{app.activePercentage}%</span>
                    </div>
                ))
            ) : (
                <p className="text-center text-sm text-gray-500 py-4">कोई डेटा उपलब्ध नहीं है।</p>
            )}
        </div>
    </div>
);

// New Helper Component for Dropdown
const Dropdown = ({ label, options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const displayLabel = options.find(opt => opt.value === selected)?.label || label;

    return (
        <div className="relative">
            <button
                className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer border border-gray-300 px-3 py-1 rounded-lg bg-sky-50 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-sky-100 ${selected === option.value ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700'}`}
                            onClick={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AnalyticsPage = () => {
    // 👈️ New States to hold real data
    const [metrics, setMetrics] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [shadowITData, setShadowITData] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [activeTab, setActiveTab] = useState('insights');
    
    // ------------------------------------
// DATA FETCHING LOGIC
// ------------------------------------
useEffect(() => {
    // API_BASE_URL ko yahan define kar dein ya ensure karein ki woh component ke scope mein ho.
    // const API_BASE_URL = 'http://localhost:5000/api/analytics'; 

    const fetchAnalyticsData = async () => {
        try {
            // Fetch Metrics
            const metricsRes = await axios.get(`/api/analytics/metrics`);
            setMetrics(metricsRes.data);

            // Fetch Usage Data
            const usageRes = await axios.get(`/api/analytics/usage`);
            
            // --- 🎯 NEW: Console Log Added ---
            console.log("Fetched Usage Data (Raw):", usageRes.data);
            // ----------------------------------
            
            // 💡 Improved Data Extraction Logic:
            // Check if response is an Array. If not, try checking for the common 'data' wrapper.
            let usageArray = Array.isArray(usageRes.data) 
                                ? usageRes.data 
                                : (usageRes.data && usageRes.data.data && Array.isArray(usageRes.data.data) ? usageRes.data.data : []);
            
            setUsageData(usageArray);

            // Fetch Recommendations
            const recsRes = await axios.get(`/api/analytics/recommendations`);

            // 👇️ START: Shadow IT Fetching Logic
             const shadowITRes = await axios.get(`/api/analytics/shadow-it`);
             let shadowITArray = Array.isArray(shadowITRes.data) 
              ? shadowITRes.data 
              : (shadowITRes.data && shadowITRes.data.data && Array.isArray(shadowITRes.data.data) ? shadowITRes.data.data : []);
    
            setShadowITData(shadowITArray);
            console.log('Fetched Shadow IT Data:', shadowITArray);
            // 👆️ END: Shadow IT Fetching Logic

            // 💡 Improved Data Extraction for Recommendations:
            let recsArray = Array.isArray(recsRes.data) 
                                ? recsRes.data 
                                : (recsRes.data && recsRes.data.data && Array.isArray(recsRes.data.data) ? recsRes.data.data : []);
            
            setRecommendations(recsArray);

            setLoading(false);

        } catch (err) {
            setError('Failed to fetch analytics data. Check your server status and network.');
            setLoading(false);
            console.error("API Fetch Error:", err);
        }
    };

    fetchAnalyticsData();
}, []);

    
    // ------------------------------------
// DYNAMIC CATEGORY OPTIONS GENERATION (Refined for Case-Insensitivity)
// ------------------------------------
const categoryOptions = useMemo(() => {
    // 1. Get all category names from usageData and filter out null/empty strings
    const categories = usageData
        .map(app => app.category)
        .filter(Boolean); 

    // 2. Create a Map to store unique categories, using lowercase as the key
    // This ensures that "Design" and "design" are treated as the same category,
    // and we keep the case of the first one found for the dropdown label.
    const uniqueMap = new Map();
    categories.forEach(cat => {
        const lowerCaseCat = cat.toLowerCase();
        if (!uniqueMap.has(lowerCaseCat)) {
            uniqueMap.set(lowerCaseCat, cat);
        }
    });

    // 3. Convert the map values (original case categories) into the options array
    const uniqueCategories = Array.from(uniqueMap.values());
    
    // Map to dropdown format { label: 'Category Name', value: 'category-name-slug' }
    const options = uniqueCategories.map(cat => ({
        label: cat, // Keep the original Title Case for display
        // Convert to a clean, lowercase slug for internal state tracking
        value: cat.toLowerCase().replace(/\s/g, '-') 
    }));

    // Add the 'All Categories' option at the beginning
    options.unshift({ label: 'All Categories', value: 'all' });
    
    return options;
}, [usageData]);



    // ------------------------------------
    // FILTERING AND SORTING LOGIC (useMemo) - Now more robust
    // ------------------------------------
    const sortedAndFilteredUsageData = useMemo(() => {
        if (!Array.isArray(usageData) || usageData.length === 0) return [];
        
        // 1. Filtering
        let filteredData = usageData;
        
        if (selectedCategory !== 'all') {
            // Find the *original* Title Case label from options to match the database value
            const selectedCategoryLabel = categoryOptions.find(opt => opt.value === selectedCategory)?.label;
            
            if (selectedCategoryLabel) {
                // Filter where app.category exactly matches the label (Title Case)
                filteredData = filteredData.filter(app => app.category === selectedCategoryLabel);
            }
        }

        // 2. Sorting (No change in sorting logic)
        let finalData = [...filteredData]; 
        // ... (sorting switch case here, which is already correct)
        switch (sortOrder) {
            case 'name-asc': 
                finalData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'highest-usage': 
                finalData.sort((a, b) => b.activePercentage - a.activePercentage);
                break;
            case 'lowest-usage': 
                finalData.sort((a, b) => a.activePercentage - b.activePercentage);
                break;
            default:
                finalData.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return finalData;
    }, [usageData, sortOrder, selectedCategory, categoryOptions]);


    // Data for App Performance Boxes (Uses unsorted usageData, but ensures it's an array)
    const topPerforming = useMemo(() => 
        Array.isArray(usageData)
        ? usageData
            .filter(app => app.activePercentage >= 50)
            .sort((a, b) => b.activePercentage - a.activePercentage)
            .slice(0, 5)
        : [], 
        [usageData]
    );
        
    const appsNeedingAttention = useMemo(() => 
        Array.isArray(usageData)
        ? usageData
            .filter(app => app.activePercentage < 50)
            .sort((a, b) => a.activePercentage - b.activePercentage)
            .slice(0, 5)
        : [], 
        [usageData]
    );

    // Function to render content based on active tab
            const renderTabContent = () => {
                switch (activeTab) {
                    case 'insights':
                        // Aapko yahan par apne existing Top Performing Apps aur Recommendations ko render karna hoga
                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                                <AppPerformanceBox 
                                    title="Top Performing Apps" 
                                    data={topPerforming} 
                                    borderColor="#10B981" 
                                />
                                <AppPerformanceBox 
                                    title="Apps Needing Attention" 
                                    data={appsNeedingAttention} 
                                    borderColor="#F59E0B" 
                                />
                                {/* AI Recommendations */}
                                {Array.isArray(recommendations) && recommendations.length > 0 && (
                                    <Recommendations recommendations={recommendations} />
                                )}
                            </div>
                        );
                    case 'access':
                        // Access Risk Analysis ke liye placeholder
                       return <AccessRiskAnalysis riskData={[]} />;
                    case 'shadow':
                        // Shadow IT Detection ke liye ShadowITList component
                        return <ShadowITList shadowITData={shadowITData} />;
                    default:
                       // Default mein Insights & Recommendations dikhayein
                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                                    <AppPerformanceBox title="Top Performing Apps" data={topPerforming} borderColor="#10B981" />
                                    <AppPerformanceBox title="Apps Needing Attention" data={appsNeedingAttention} borderColor="#F59E0B" />
                                    {Array.isArray(recommendations) && recommendations.length > 0 && (
                                        <Recommendations recommendations={recommendations} />
                                    )}
                                </div>
                            );
                }
            };

    if (loading) return <div className="p-6 text-center text-xl">Loading Analytics Data...</div>;
    if (error) return <div className="p-6 text-center text-xl text-red-500">{error}</div>;

    // Options for the Sort Dropdown
    const sortOptions = [
        { label: 'Name (A-Z)', value: 'name-asc' },
        { label: 'Highest Usage', value: 'highest-usage' },
        { label: 'Lowest Usage', value: 'lowest-usage' },
    ];
    
    // Function to get the current display label for the sort button
    const getSortLabel = (value) => {
        return sortOptions.find(opt => opt.value === value)?.label || 'Name (A-Z)';
    };

    // Ensure metrics object has data keys before rendering
    const defaultMetrics = {
        totalApplications: { value: 0, unit: 'Active', subtext: 'Being monitored', color: "#10B981" },
        totalLicenses: { value: 0, unit: '', subtext: 'Across all applications', color: "#3B82F6" },
        highEngagementApps: { value: 0, unit: '', subtext: 'With 50%+ active usage', color: "#F59E0B" },
        underutilizedApps: { value: 0, unit: '', subtext: 'Potential cost savings', color: "#EF4444" },
    };


    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            
            {/* Header and Export Button */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-semibold text-gray-800">User Engagement Analytics</h1>
                <button className="flex items-center font-semibold text-base px-2 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                     Export Report
                </button>
            </div>

            {/* 1. Metric Cards (Dynamic Data) */}
            <div className="grid grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Applications" 
                    value={metrics.totalApplications?.value || defaultMetrics.totalApplications.value} 
                    unit={metrics.totalApplications?.unit || defaultMetrics.totalApplications.unit} 
                    subtext={metrics.totalApplications?.subtext || defaultMetrics.totalApplications.subtext}
                    color="#10B981"
                />
                <MetricCard 
                    title="Total Licenses" 
                    value={metrics.totalLicenses?.value || defaultMetrics.totalLicenses.value} 
                    unit={metrics.totalLicenses?.unit || defaultMetrics.totalLicenses.unit} 
                    subtext={metrics.totalLicenses?.subtext || defaultMetrics.totalLicenses.subtext}
                    color="#3B82F6"
                />
                <MetricCard 
                    title="High Engagement Apps" 
                    value={metrics.highEngagementApps?.value || defaultMetrics.highEngagementApps.value} 
                    unit={metrics.highEngagementApps?.unit || defaultMetrics.highEngagementApps.unit} 
                    subtext={metrics.highEngagementApps?.subtext || defaultMetrics.highEngagementApps.subtext}
                    color="#F59E0B"
                />
                <MetricCard 
                    title="Underutilized Apps" 
                    value={metrics.underutilizedApps?.value || defaultMetrics.underutilizedApps.value} 
                    unit={metrics.underutilizedApps?.unit || defaultMetrics.underutilizedApps.unit} 
                    subtext={metrics.underutilizedApps?.subtext || defaultMetrics.underutilizedApps.subtext}
                    color="#EF4444"
                />
            </div>

            {/* 2. Application Engagement Overview (Dynamic Data) */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-600">Application Engagement Overview</h2>
                    <div className="flex space-x-4">
                        
                        {/* Category Filter (Now Dynamic) */}
                        <Dropdown 
                            label="All Categories" 
                            options={categoryOptions} // Uses dynamically generated options
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                        
                        {/* Sort Order Dropdown (Functional) */}
                        <Dropdown
                            label={getSortLabel(sortOrder)}
                            options={sortOptions}
                            selected={sortOrder}
                            onSelect={setSortOrder}
                        />
                    </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-between text-xs text-gray-500 mb-4 border-b pb-2">
                    <div className='px-2 py-2 bg-gray-300'></div>
                    <span>No usage (Never logged in)</span>
                    <div className='px-2 py-2 bg-yellow-500'></div>
                    <span>Low usage (16-30 days ago)</span>
                    <div className='px-2 py-2 bg-orange-500'></div>
                    <span>Medium usage (4-15 days ago)</span>
                    <div className='px-2 py-2 bg-green-500'></div>
                    <span>High usage (0-3 days ago)</span>
                </div>

                {/* Engagement Charts (Uses sortedAndFilteredUsageData) */}
                <div className="space-y-3">
                    {Array.isArray(sortedAndFilteredUsageData) && sortedAndFilteredUsageData.length > 0 ? (
                        sortedAndFilteredUsageData.map(app => (
                            <EngagementChart key={app.name} app={app} />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-8">
                            <Info className="w-6 h-6 mx-auto mb-2"/>
                            {usageData.length === 0 
                                ? "एनालिटिक्स डेटा लोड करने में विफल रहा या कोई एप्लीकेशन डेटा उपलब्ध नहीं है।"
                                : "इस श्रेणी के लिए कोई एप्लीकेशन डेटा नहीं मिला।"
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Advanced Analytics & Recommendations */}
            <h2 className="text-xl font-semibold text-gray-600 pt-4">Advanced Analytics</h2>
            
            {/* Tabs for Insights, Access Risk, Shadow IT */}
            <div className="flex p-2 rounded-full w-fit space-x-6 bg-sky-100 ">
                <button 
                    onClick={() => setActiveTab('insights')}
                    className={`p-2 font-semibold text-sm transition-colors ${activeTab === 'insights' ? 'text-gray-600 p-2 bg-white rounded-full' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Insights & Recommendations
                </button>
                <button 
                    onClick={() => setActiveTab('access')}
                    className={`p-2 font-semibold text-sm transition-colors ${activeTab === 'access' ? 'text-gray-600 p-2 bg-white rounded-full' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Access Risk Analysis
                </button>
                <button 
                    onClick={() => setActiveTab('shadow')}
                    className={`p-2 font-semibold text-sm transition-colors ${activeTab === 'shadow' ? 'text-gray-600 p-2 bg-white rounded-full' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Shadow IT Detection
                </button>
            </div>
            
            {/* 👇️ Tab Content is rendered here */}
            <div className="mt-4">
                {renderTabContent()}
            </div>

        </div>
    );
};

export default AnalyticsPage;

