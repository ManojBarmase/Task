// client/src/components/IntegrationsPage.jsx 

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Settings, Repeat, Search, Zap, Loader2 } from 'lucide-react';
import ConfigureIntegrationForm from './ConfigureIntegrationForm';
import ConnectIntegrationForm from './ConnectIntegrationForm';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AllFilterTabs = ['All', 'ERP Systems', 'Accounting', 'Finance', 'CRM', 'SSO', 'HRMS'];

// --- Sub-Components ---

// 1. Status Pill Component
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

// 2. Integration Card Component
const IntegrationCard = ({ integration, onConfigure, onConnect }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState(false);
    
    const handleSyncNow = async () => {
        setIsSyncing(true);
        setSyncSuccess(false);
        setSyncError(false);

        try {
            // Mock Sync Process (Real app mein ye backend API call hogi)
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            setSyncSuccess(true); 
            setTimeout(() => setSyncSuccess(false), 3000); 
        } catch (error) {
            setSyncError(true); 
            setTimeout(() => setSyncError(false), 3000); 
        } finally {
            setIsSyncing(false);
        }
    };

    const isConnected = integration.status === 'Connected';
    const isComingSoon = integration.status === 'Coming Soon';

    return (
        <div className={`bg-white p-6 rounded-xl shadow-md border ${isConnected ? 'border-green-300' : 'border-gray-200'} space-y-4`}>
            
            {/* Header: Icon and Status */}
            <div className="flex justify-between items-start">
                <div className={`text-3xl p-2 rounded-lg ${integration.isHR ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {integration.icon || '🔗'}
                </div>
                <StatusPill status={integration.status} />
            </div>

            {/* Content */}
            <div>
                <h3 className="text-base font-bold text-gray-800">{integration.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
            </div>
            
            {/* Status Details (Only if Connected) */}
            {isConnected && (
                <>
                    <div className="flex items-center justify-between space-x-1 text-xs">
                        <span className="font-medium text-gray-700">Connected:</span>
                        <span>{integration.syncDate ? new Date(integration.syncDate).toLocaleDateString() : 'Just now'}</span> 
                    </div>
                    <div className="flex items-center justify-between space-x-1 text-xs">
                        <span className="font-medium text-gray-700">Sync:</span>
                        <span>{integration.syncFrequency || 'Manual'}</span>
                    </div>
                </>
            )}

            {/* Actions Buttons */}
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

            {/* Feedback Messages */}
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


// --- Main Component ---
const IntegrationsPage = () => {
    const [integrations, setIntegrations] = useState([]); // 1. API Data yahan aayega
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [showConfigureModal, setShowConfigureModal] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    const token = localStorage.getItem('token');

    // 2. Fetch Integrations from API
    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/integrations`, {
                    headers: { 'x-auth-token': token }
                });
                setIntegrations(res.data);
            } catch (err) {
                console.error("Error fetching integrations:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchIntegrations();
    }, [token]);

    // 3. Metrics Calculation (Fix for 'connectedCount is not defined')
    // Yeh logic ab component ke andar hai, isliye state ka use kar sakta hai
    const connectedCount = integrations.filter(i => i.status === 'Connected').length;
    const availableCount = integrations.filter(i => i.status === 'Available' || i.status === 'Coming Soon').length;
    const totalSystems = integrations.length;

    // 4. Filtering Logic
    const filteredIntegrations = useMemo(() => {
        let list = integrations;

        // Filter by Tab
        if (selectedTab !== 'All') {
            list = list.filter(i => i.category === selectedTab);
        }

        // Filter by Search Term
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            list = list.filter(i => 
                i.name.toLowerCase().includes(lowerCaseSearch) ||
                (i.description && i.description.toLowerCase().includes(lowerCaseSearch)) ||
                i.category.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return list;
    }, [selectedTab, searchTerm, integrations]);


    // Handlers
    const handleConfigureClick = (integration) => {
        setSelectedIntegration(integration);
        setShowConfigureModal(true);
    };

    const handleConnectClick = (integration) => {
        setSelectedIntegration(integration);
        setShowConnectModal(true);
    };

    // Status Update Handler (Called from Child Modal)
    const handleIntegrationConnected = async (id, updates) => {
        try {
            // 1. Backend Update
            const res = await axios.put(`${API_BASE_URL}/api/integrations/${id}/connect`, updates, {
                 headers: { 'x-auth-token': token }
            });

            // 2. Frontend State Update
            setIntegrations(prevIntegrations => 
                prevIntegrations.map(i => (i._id === id ? res.data : i))
            );
            
            // Close modal (if handled here, though form usually closes itself)
        } catch (err) {
            console.error("Failed to connect integration:", err);
            alert("Failed to update status. Please try again.");
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin inline-block text-sky-600" /> Loading integrations...</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            
            <h1 className="text-2xl font-semibold text-gray-800">Integrations</h1>
            <p className="text-gray-600">
                Connect your ERP, CRM, accounting, SSO, and HRMS systems to streamline procurement and employee management
            </p>

            {/* Metric Cards */}
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
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
                        key={integration._id} // MongoDB _id use karein
                        integration={integration} 
                        onConfigure={handleConfigureClick}
                        onConnect={handleConnectClick}
                    />
                ))}
            </div>
            
            {filteredIntegrations.length === 0 && (
                 <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
                    No integrations found matching the criteria.
                </div>
            )}
            
            {/* Help/Support Section */}
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

            {/* Configure Integration Modal */}
            {showConfigureModal && selectedIntegration && (
                <ConfigureIntegrationForm 
                    integration={selectedIntegration}
                    onClose={() => setShowConfigureModal(false)} 
                />
            )}

            {/* Connect Integration Modal */}
            {showConnectModal && selectedIntegration && (
                <ConnectIntegrationForm 
                    integration={selectedIntegration}
                    onClose={() => setShowConnectModal(false)} 
                    onIntegrationConnected={handleIntegrationConnected}
                />
            )}
        </div>
    );
};

export default IntegrationsPage;

 