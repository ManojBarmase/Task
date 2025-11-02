// client/src/components/IntegrationsPage.jsx 

const MOCK_INTEGRATIONS = [
    {
        id: 1,
        name: 'Coupa ERP',
        category: 'ERP Systems',
        description: 'Sync contracts, purchase orders, and vendor data',
        status: 'Connected',
        syncDate: 'Jan 15, 2025',
        syncFrequency: 'Real-time',
        icon: '🔗', // Placeholder
        isHR: false,
    },
    {
        id: 2,
        name: 'NetSuite ERP',
        category: 'ERP Systems',
        description: 'Enterprise resource planning and contract management',
        status: 'Connected',
        syncDate: 'Feb 3, 2025',
        syncFrequency: 'Every 6 hours',
        icon: '🏢',
        isHR: false,
    },
    {
        id: 3,
        name: 'NetSuite Finance',
        category: 'Finance',
        description: 'Financial management and accounting integration',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '💰',
        isHR: false,
    },
    {
        id: 4,
        name: 'QuickBooks',
        category: 'Accounting',
        description: 'Accounting software for contract invoicing',
        status: 'Connected',
        syncDate: 'Dec 12, 2024',
        syncFrequency: 'Daily',
        icon: '📊',
        isHR: false,
    },
    {
        id: 5,
        name: 'QuickBooks Finance',
        category: 'Finance',
        description: 'Advanced financial reporting and analytics',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '📈',
        isHR: false,
    },
    {
        id: 6,
        name: 'Sage Intacct',
        category: 'Accounting',
        description: 'Cloud financial management software',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '☁️',
        isHR: false,
    },
    // HR Integrations (from Screenshot 28)
    {
        id: 7,
        name: 'BambooHR',
        category: 'HRMS',
        description: 'HR software for employee data and onboarding',
        status: 'Connected',
        syncDate: 'Feb 1, 2025',
        syncFrequency: 'Daily',
        icon: '🌿',
        isHR: true,
    },
    {
        id: 8,
        name: 'Hibob',
        category: 'HRMS',
        description: 'Modern HRIS for employee management',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '🧑‍🤝‍🧑',
        isHR: true,
    },
    {
        id: 9,
        name: 'Workday',
        category: 'HRMS',
        description: 'Enterprise cloud platform for HR and finance',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '💼',
        isHR: true,
    },
    {
        id: 10,
        name: 'ADP Workforce',
        category: 'HRMS',
        description: 'Payroll and HR management system',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '🔴',
        isHR: true,
    },
    {
        id: 11,
        name: 'Namely',
        category: 'HRMS',
        description: 'All-in-one HR platform for mid-sized companies',
        status: 'Coming Soon',
        syncDate: null,
        syncFrequency: null,
        icon: '🟦',
        isHR: true,
    },
    {
        id: 12,
        name: 'Gusto',
        category: 'HRMS',
        description: 'Payroll, benefits, and HR for small businesses',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '🟣',
        isHR: true,
    },
    // Add CRM and SSO placeholders for filter tabs
    {
        id: 13,
        name: 'Salesforce CRM',
        category: 'CRM',
        description: 'Customer Relationship Management',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '☁️',
        isHR: false,
    },
    {
        id: 14,
        name: 'Okta SSO',
        category: 'SSO',
        description: 'Single Sign-On authentication',
        status: 'Available',
        syncDate: null,
        syncFrequency: null,
        icon: '🔑',
        isHR: false,
    },
];

const AllFilterTabs = ['All', 'ERP Systems', 'Accounting', 'Finance', 'CRM', 'SSO', 'HRMS'];

// client/src/components/IntegrationsPage.jsx

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, Settings, Repeat, Search, Zap,Loader2 } from 'lucide-react';
import ConfigureIntegrationForm from './ConfigureIntegrationForm';
import ConnectIntegrationForm from './ConnectIntegrationForm'; // 👈️ नया Import
import { useNavigate } from 'react-router-dom';

// ... (MOCK_INTEGRATIONS and AllFilterTabs from Step 1) ...
// (We assume MOCK_INTEGRATIONS and AllFilterTabs are defined above)



// Status Pill Component
const StatusPill = ({ status }) => {
    let classes = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full';
    let icon = null;

    switch (status) {
        case 'Connected':
            classes += ' bg-green-100 text-green-800';
            icon = <CheckCircle className="w-4 h-4 mr-1" />;
            break;
        case 'Available':
            classes += ' bg-blue-100 text-blue-800';
            break;
        case 'Coming Soon':
            classes += ' bg-gray-100 text-gray-700';
            break;
        default:
            classes += ' bg-gray-100 text-gray-700';
    }

    return (
        <span className={classes}>
            {icon}
            {status}
        </span>
    );
};

// Integration Card Component (based on Screenshots 27 & 28)
const IntegrationCard = ({ integration, onConfigure, onSyncComplete, onConnect}) => {
   const [isSyncing, setIsSyncing] = useState(false); // 👈️ नया स्टेट
   const [syncSuccess, setSyncSuccess] = useState(false); // 👈️ नया स्टेट
   const [syncError, setSyncError] = useState(false);     // 👈️ नया स्टेट
   
   const handleSyncNow = async () => {
        setIsSyncing(true);
        setSyncSuccess(false);
        setSyncError(false);

        try {
            console.log(`Starting immediate sync for: ${integration.name}`);
            
            // Mock API call (2-second delay)
            await new Promise(resolve => setTimeout(resolve, 2000)); 

            setSyncSuccess(true); // Success state update
            
            // Revert success message after 3 seconds
            setTimeout(() => setSyncSuccess(false), 3000); 

        } catch (error) {
            console.error("Sync failed:", error);
            setSyncError(true); // Error state update
            setTimeout(() => setSyncError(false), 3000); 
        } finally {
            setIsSyncing(false);
        }
    };

   
    const isConnected = integration.status === 'Connected';
    const isComingSoon = integration.status === 'Coming Soon';
    // ... (rest of the component logic)

    return (
        <div className={`bg-white p-6 rounded-xl shadow-md border ${isConnected ? 'border-green-300' : 'border-gray-200'} space-y-4`}>
            
            {/* Header: Icon and Status */}
            <div className="flex justify-between items-start">
                {/* Placeholder Icon */}
                <div className={`text-3xl p-2 rounded-lg ${integration.isHR ? 'bg-red-100' : 'bg-blue-100'}`}>{integration.icon}</div>
                <StatusPill status={integration.status} />
            </div>

            {/* Content */}
            <div>
                <h3 className="text-base font-bold text-gray-800">{integration.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
            </div>
            
            {/* Status Details */}
           {isConnected && (
                <>
                    <div className="flex items-center justify-between space-x-1 text-xs">
                        <span className="font-medium text-gray-700">Connected:</span>
                        {/* Null/undefined चेक जरूरी नहीं है, लेकिन सुरक्षित है */}
                        <span>{integration.syncDate || 'N/A'}</span> 
                    </div>
                    <div className="flex items-center justify-between space-x-1 text-xs">
                        <span className="font-medium text-gray-700">Sync:</span>
                        <span>{integration.syncFrequency || 'N/A'}</span>
                    </div>
                </>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-2">
                {isConnected ? (
                    <>
                        <button 
                           onClick={() => onConfigure(integration)}
                           className="flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                           >
                            <Settings className="w-4 h-4 mr-1" /> Configure
                        </button>

                         <button 
                            onClick={handleSyncNow}
                            disabled={isSyncing}
                            className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Syncing...
                                </>
                            ) : (
                                <>
                                    <Repeat className="w-4 h-4 mr-1" /> Sync Now
                                </>
                            )}
                        </button>
                    </>
                ) : isComingSoon ? (
                    <button className="w-full px-4 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed">
                        Coming Soon
                    </button>
                ) : (
                    <button 
                        onClick={() => onConnect(integration)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors">
                        Connect <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                )}
            </div>

            {/* 👇️ Success/Error Feedback UI */}
            {syncSuccess && (
                <div className="text-xs text-green-600 font-medium pt-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1"/> Sync successful!
                </div>
            )}
             {syncError && (
                <div className="text-xs text-red-600 font-medium pt-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-1"/> Sync failed. Try again.
                </div>
            )}
        </div>
    );
};


const IntegrationsPage = () => {
    // MOCK_INTEGRATIONS को state के रूप में परिभाषित करें
    const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS); 
    
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // 👇️ नए States
    const [showConfigureModal, setShowConfigureModal] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    // Metrics Calculation (based on Screenshot 26)
    const connectedCount = integrations.filter(i => i.status === 'Connected').length;
    const availableCount = MOCK_INTEGRATIONS.filter(i => i.status === 'Available').length + MOCK_INTEGRATIONS.filter(i => i.status === 'Coming Soon').length;
    const totalSystems = MOCK_INTEGRATIONS.length;


    // Filtering Logic (Memoized for performance)
    const filteredIntegrations = useMemo(() => {
        let list = MOCK_INTEGRATIONS;

        // 1. Filter by Tab
        if (selectedTab !== 'All') {
            list = list.filter(i => i.category === selectedTab);
        }

        // 2. Filter by Search Term
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            list = list.filter(i => 
                i.name.toLowerCase().includes(lowerCaseSearch) ||
                i.description.toLowerCase().includes(lowerCaseSearch) ||
                i.category.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return list;
    }, [selectedTab, searchTerm, integrations]);

    const handleConfigureClick = (integration) => {
        setSelectedIntegration(integration);
        setShowConfigureModal(true);
    };

    const handleConnectClick = (integration) => { // 👈️ नया हैंडलर
        setSelectedIntegration(integration);
        setShowConnectModal(true);
    };

    // 👇️ Integration Status अपडेट करने का मुख्य फ़ंक्शन
    const handleIntegrationConnected = (id, updates) => {
        setIntegrations(prevIntegrations => {
            console.log(`Updating integration ID: ${id} with status: ${updates.status}`);
            return prevIntegrations.map(i => {
                if (i.id === id) {
                    return { ...i, ...updates }; // ID मैच होने पर ऑब्जेक्ट को अपडेट करें
                }
                return i;
            });
        });
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            
            <h1 className="text-2xl font-semibold text-gray-800">Integrations</h1>
            <p className="text-gray-600">
                Connect your ERP, CRM, accounting, SSO, and HRMS systems to streamline procurement and employee management
            </p>

            {/* Metric Cards (Screenshot 26) */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Connected</p>
                    <div className="text-4xl font-normal text-gray-900 flex items-center">
                        {connectedCount}
                        <CheckCircle className="w-5 h-5 ml-2 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500">{connectedCount} active integrations</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Available</p>
                    <div className="text-3xl font-normal text-gray-900">{availableCount}</div>
                    <p className="text-xs text-gray-500">Ready to connect</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Total Systems</p>
                    <div className="text-3xl font-normal text-gray-900">{totalSystems}</div>
                    <p className="text-xs text-gray-500">Supported platforms</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-2">
                    <p className="text-sm font-normal text-gray-500">Last Sync</p>
                    <div className="text-3xl font-normal text-gray-900">2m</div>
                    <p className="text-xs text-gray-500">Ago</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="space-x-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <div className="relative ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-sky-50 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                </div>
               
                
                {/* Filter Tabs */}
                <div className="flex p-2 w-fit bg-sky-100 text-gray-900 rounded-full space-x-2 overflow-x-auto pb-2">
                    {AllFilterTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium  whitespace-nowrap transition-colors ${
                                selectedTab === tab
                                    ? 'bg-white shadow-md'
                                    : 'bg-sky-100 '
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Available Integrations Grid */}
            <h2 className="text-xl font-semibold text-gray-600 pt-4">Available Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredIntegrations.map(integration => (
                    <IntegrationCard
                        key={integration.id}
                        integration={integration} 
                        onConfigure={handleConfigureClick}
                        onConnect={handleConnectClick} // 👈️ नया हैंडलर पास करें
                        
                    />
                ))}
            </div>
            
            {filteredIntegrations.length === 0 && (
                 <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
                    No integrations found matching the criteria.
                </div>
            )}
            
            {/* Help/Support Section (Screenshot 28) */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-4 mt-8">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Need help setting up integrations?</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Our team can help you configure your integrations and ensure data flows smoothly between systems. Contact support for personalized assistance.
                    </p>
                    <button className="text-sm font-medium text-sky-600 hover:text-sky-800 mt-3">
                        Contact Support
                    </button>
                </div>
            </div>

            {/* 👇️ Configure Integration Modal */}
            {showConfigureModal && selectedIntegration && (
                <ConfigureIntegrationForm 
                    integration={selectedIntegration}
                    onClose={() => setShowConfigureModal(false)} 
                />
            )}

            {/* 👇️ Connect Integration Modal */}
            {showConnectModal && selectedIntegration && (
                <ConnectIntegrationForm 
                    integration={selectedIntegration}
                    onClose={() => setShowConnectModal(false)} 
                    onIntegrationConnected={handleIntegrationConnected} // 👈️ Status अपडेट करने का फ़ंक्शन
                />
            )}
        </div>
    );
};

export default IntegrationsPage;