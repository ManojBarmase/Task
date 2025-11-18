// client/src/components/AddVendorForm.jsx

import React, { useState, useEffect } from 'react';
// ISKE NEECHE YEH LINE ADD KAREIN:
import { Country, State, City } from 'country-state-city';
import axios from 'axios';
import { X, Loader2 , Upload} from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_URL;


const AddVendorForm = ({ onClose, onVendorAdded }) => {
    // IS 'formData' STATE KO REPLACE KAREIN:

        // IS NAYE CODE SE:
        const [formData, setFormData] = useState({
            vendorName: '',
            productTool: '',
            category: 'Other',
            contactPerson: '',
            contactEmail: '',
            phoneNumber: '',
            annualSpend: 0, // 'initialSpend' ko rename kiya
            website: '',
            notes: '',
            registeredId: '',
            
            // Naya Nested Address Structure
            billingAddress: {
                country: '',
                state: '',
                city: '',
                address: '', // 'Address Line' ke liye
                zip: ''      // 'Zip/Postal Code' ke liye
            },
            companyAddress: {
                country: '',
                state: '',
                city: '',
                address: '',
                zip: ''
            },
        });

         // YEH NAYA CODE ADD KAREIN
    // YEH NAYA CODE ADD KAREIN
    const [countries, setCountries] = useState([]);
    const [billingStates, setBillingStates] = useState([]);
    const [billingCities, setBillingCities] = useState([]);
    const [companyStates, setCompanyStates] = useState([]);
    const [companyCities, setCompanyCities] = useState([]);

    // YEH POORA NAYA CODE ADD KAREIN

        // 1. Countries ko load karein (Sirf ek baar)
        useEffect(() => {
            setCountries(Country.getAllCountries());
        }, []);

        // 2. Billing: Jab Country badle, States load karein
        useEffect(() => {
            const countryIsoCode = formData.billingAddress.country;
            setBillingStates(State.getStatesOfCountry(countryIsoCode));
            setBillingCities([]); // States badalne par cities reset karein
        }, [formData.billingAddress.country]);

        // 3. Billing: Jab State badle, Cities load karein
        useEffect(() => {
            const countryIsoCode = formData.billingAddress.country;
            const stateIsoCode = formData.billingAddress.state;
            setBillingCities(City.getCitiesOfState(countryIsoCode, stateIsoCode));
        }, [formData.billingAddress.country, formData.billingAddress.state]);

        // 4. Company: Jab Country badle, States load karein
        useEffect(() => {
            const countryIsoCode = formData.companyAddress.country;
            setCompanyStates(State.getStatesOfCountry(countryIsoCode));
            setCompanyCities([]);
        }, [formData.companyAddress.country]);

        // 5. Company: Jab State badle, Cities load karein
        useEffect(() => {
            const countryIsoCode = formData.companyAddress.country;
            const stateIsoCode = formData.companyAddress.state;
            setCompanyCities(City.getCitiesOfState(countryIsoCode, stateIsoCode));
        }, [formData.companyAddress.country, formData.companyAddress.state]);

      // 👇️ NEW STATE for file upload
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const AllCategories = [
        'Other', 'Productivity', 'Communication', 'Project Management', 
        'Cloud Services', 'Hardware', 'CRM', 'Development', 'Design Software'
    ];

    // PURANE 'handleChange' FUNCTION KO IS NAAYE CODE SE REPLACE KAREIN

        const handleChange = (e) => {
            const { name, value } = e.target;

            // Check karein ki yeh address field hai ya nahi
            if (name.includes('Address.')) {
                // e.g., name="billingAddress.country"
                const [addressType, fieldName] = name.split('.'); // ["billingAddress", "country"]

                setFormData(prev => {
                    const updatedAddress = { ...prev[addressType], [fieldName]: value };

                    // Reset logic: Agar country badli hai, toh state aur city reset karo
                    if (fieldName === 'country') {
                        updatedAddress.state = '';
                        updatedAddress.city = '';
                    }
                    // Agar state badla hai, toh city reset karo
                    if (fieldName === 'state') {
                        updatedAddress.city = '';
                    }

                    return {
                        ...prev,
                        [addressType]: updatedAddress
                    };
                });
            } else {
                // Normal (top-level) field
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        };

     // 👇️ FILE CHANGE HANDLER
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
    };

      // PURANE 'handleSubmit' FUNCTION KO IS NAYE CODE SE REPLACE KAREIN

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(false);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authorization token not found.');
                setLoading(false);
                return;
            }

            try {
                const data = new FormData();
                // 1. Simple Fields
                    data.append('vendorName', formData.vendorName);
                    data.append('productTool', formData.productTool);
                    data.append('category', formData.category);
                    data.append('annualSpend', parseFloat(formData.annualSpend) || 0);
                    data.append('website', formData.website);
                    data.append('notes', formData.notes);
                    data.append('registeredId', formData.registeredId);
                    
                    // 2. MAPPING FIELDS (Form -> Schema)
                    // Form mein 'contactEmail' hai, Schema mein 'companyEmail' hai
                    data.append('contactEmail', formData.contactEmail); 
                    data.append('phoneNumber', formData.phoneNumber);
                    data.append('companyEmail', formData.contactEmail);

                    // 3. NESTED OBJECTS (JSON.stringify karein)
                    // Isse backend parsing error khatam ho jayega
                    
                    // Billing Address
                    data.append('billingAddress', JSON.stringify({
                        country: formData.billingAddress.country ? Country.getCountryByCode(formData.billingAddress.country).name : '',
                        state: formData.billingAddress.state ? State.getStateByCodeAndCountry(formData.billingAddress.state, formData.billingAddress.country).name : '',
                        city: formData.billingAddress.city,
                        address: formData.billingAddress.address,
                        zip: formData.billingAddress.zip
                    }));

                    // Company Address
                    data.append('companyAddress', JSON.stringify({
                        country: formData.companyAddress.country ? Country.getCountryByCode(formData.companyAddress.country).name : '',
                        state: formData.companyAddress.state ? State.getStateByCodeAndCountry(formData.companyAddress.state, formData.companyAddress.country).name : '',
                        city: formData.companyAddress.city,
                        address: formData.companyAddress.address,
                        zip: formData.companyAddress.zip
                    }));

                    // Primary Contact (Create Object)
                    data.append('primaryContact', JSON.stringify({
                        name: formData.contactPerson,
                        email: formData.contactEmail,
                        phone: formData.phoneNumber
                    }));
                // 4. Append File Data
                if (uploadedFile) {
                    data.append('document', uploadedFile);
                }

                const res = await axios.post(`${API_BASE_URL}/api/vendors`, data, {
                    headers: { 'x-auth-token': token }
                });

                setSuccess(true);
                // Form reset logic (ab naye state structure ke saath)
                setFormData({
                    vendorName: '', productTool: '', category: 'Other', contactPerson: '',
                    contactEmail: '', phoneNumber: '', annualSpend: 0, website: '',
                    notes: '', registeredId: '',
                    billingAddress: { country: '', state: '', city: '', address: '', zip: '' },
                    companyAddress: { country: '', state: '', city: '', address: '', zip: '' },
                });
                setUploadedFile(null);
                onVendorAdded(res.data);
                
            }catch (err) {
            console.error("Add Vendor Error:", err.response || err);
            // Error message dikhane ka behtar tareeka
            const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Failed to add vendor.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
     };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Create New Vendor</h3>
                        <p className="text-sm text-gray-500">Enter the details of the new vendor to add them to your vendor management system.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Success!</strong>
                            <span className="block sm:inline ml-2">Vendor added successfully.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        {/* Vendor Name */}
                        <div>
                            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Registered Name *
                            </label>
                            <input
                                type="text"
                                id="vendorName"
                                name="vendorName"
                                value={formData.vendorName || ''}
                                onChange={handleChange}
                                placeholder="e.g., Google LLC, Microsoft Corp"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Product/Tool Name */}
                        <div>
                            <label htmlFor="productTool" className="block text-sm font-medium text-gray-700 mb-1">
                                Product/Tool Name 
                            </label>
                            <input
                                type="text"
                                id="productTool"
                                name="productTool"
                                value={formData.productTool || ''}
                                onChange={handleChange}
                                placeholder="e.g., Google Workspace, Slack"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Category */}
                        <div className="col-span-2"> {/* Takes full width */}
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category || ''}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                {AllCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Contact Person (UI only for now) */}
                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={formData.contactPerson || ''}
                                onChange={handleChange}
                                placeholder="Enter contact name"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Email *
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail || ''}
                                onChange={handleChange}
                                placeholder="contact@vendor.com"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Phone Number (UI only for now) */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Initial Spend */}
                        <div>
                            <label htmlFor="initialSpend" className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Spend
                            </label>
                            <input
                                type="number"
                                id="initialSpend"
                                name="initialSpend"
                                value={formData.initialSpend || ''}
                                onChange={handleChange}
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 👇️ NEW: Company Registered ID */}
                        <div className="col-span-2">
                            <label htmlFor="registeredId" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Registered ID
                            </label>
                            <input
                                type="text"
                                id="registeredId"
                                name="registeredId"
                                value={formData.registeredId || ''}
                                onChange={handleChange}
                                placeholder="e.g., CIN or Tax ID"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        {/* ------------------------------------------------------------- */}
 
                          {/* ------------------------------------------------------------- */}
                        {/* Upload Document Field (NEW) */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Document (Contract, Invoice, etc.)
                            </label>
                            <div className="flex items-center space-x-3">
                                <label className="cursor-pointer bg-white py-2 px-4 border border-sky-600 rounded-lg shadow-sm text-sm font-medium text-sky-600 hover:bg-sky-50 flex items-center transition-colors">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                    <input 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" // Accepted file types
                                    />
                                </label>
                                <span className="text-sm text-gray-500 truncate max-w-xs sm:max-w-md">
                                    {uploadedFile ? uploadedFile.name : 'No file chosen'}
                                </span>
                                {uploadedFile && (
                                    <button 
                                        type="button" 
                                        onClick={() => setUploadedFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}

                        {/* 👇️ NEW SECTION: Billing Address */}
                         {/* 👇️ NEW SECTION: Billing Address (REPLACE KAREIN) */}
                        <div className="col-span-2 pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Billing Address</h4>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                
                                {/* Billing Country */}
                                <div>
                                    <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select
                                        id="billingCountry"
                                        name="billingAddress.country" // 👈 Naam badla hai
                                        value={formData.billingAddress.country || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country.isoCode} value={country.isoCode || ''}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Billing State (Naya) */}
                                <div>
                                    <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <select
                                        id="billingState"
                                        name="billingAddress.state" // 👈 Naya
                                        value={formData.billingAddress.state || ''} // 👈 Naya
                                        onChange={handleChange}
                                        disabled={!billingStates.length} // Disable karein jab tak country select na ho
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select State</option>
                                        {billingStates.map(state => (
                                            <option key={state.isoCode} value={state.isoCode || ''}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Billing City */}
                                <div>
                                    <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <select
                                        id="billingCity"
                                        name="billingAddress.city" // 👈 Naam badla hai
                                        value={formData.billingAddress.city || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        disabled={!billingCities.length} // Disable karein jab tak state select na ho
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select City</option>
                                        {billingCities.map(city => (
                                            <option key={city.name} value={city.name || ''}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Billing Zip/Postal Code */}
                                <div>
                                    <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                    <input
                                        type="text"
                                        id="billingZip"
                                        name="billingAddress.zip" // 👈 Naam badla hai
                                        value={formData.billingAddress.zip || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        placeholder="e.g., 400001"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                {/* Billing Address Line */}
                                <div className="col-span-2">
                                    <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                                    <input
                                        type="text"
                                        id="billingAddress"
                                        name="billingAddress.address" // 👈 Naam badla hai
                                        value={formData.billingAddress.address || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        placeholder="Street address, P.O. Box, etc."
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}


                        {/* 👇️ NEW SECTION: Company Address */}
                         {/* 👇️ NEW SECTION: Company Address (REPLACE KAREIN) */}
                        <div className="col-span-2 pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Company Address</h4>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                
                                {/* Company Country */}
                                <div>
                                    <label htmlFor="companyCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select
                                        id="companyCountry"
                                        name="companyAddress.country" // 👈 Naam badla hai
                                        value={formData.companyAddress.country || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country.isoCode} value={country.isoCode || ''}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Company State (Naya) */}
                                <div>
                                    <label htmlFor="companyState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <select
                                        id="companyState"
                                        name="companyAddress.state" // 👈 Naya
                                        value={formData.companyAddress.state || ''} // 👈 Naya
                                        onChange={handleChange}
                                        disabled={!companyStates.length}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select State</option>
                                        {companyStates.map(state => (
                                            <option key={state.isoCode} value={state.isoCode || ''}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Company City */}
                                <div>
                                    <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <select
                                        id="companyCity"
                                        name="companyAddress.city" // 👈 Naam badla hai
                                        value={formData.companyAddress.city || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        disabled={!companyCities.length}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">Select City</option>
                                        {companyCities.map(city => (
                                            <option key={city.name} value={city.name || ''}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Company Zip/Postal Code */}
                                <div>
                                    <label htmlFor="companyZip" className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                    <input
                                        type="text"
                                        id="companyZip"
                                        name="companyAddress.zip" // 👈 Naam badla hai
                                        value={formData.companyAddress.zip || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        placeholder="e.g., 400001"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                {/* Company Address Line */}
                                <div className="col-span-2">
                                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                                    <input
                                        type="text"
                                        id="companyAddress"
                                        name="companyAddress.address" // 👈 Naam badla hai
                                        value={formData.companyAddress.address || ''} // 👈 Value badli hai
                                        onChange={handleChange}
                                        placeholder="Street address, P.O. Box, etc."
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                
                            </div>
                        </div>
                        {/* ------------------------------------------------------------- */}

                        {/* Website (UI only for now) */}
                        <div className="col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website || ''}
                                onChange={handleChange}
                                placeholder="https://vendor.com"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>

                        {/* Notes (UI only for now) */}
                        <div className="col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Additional information about the vendor or product/service..."
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-sky-500 focus:border-sky-500"
                            ></textarea>
                        </div>
                    </div>

                    {/* Modal Footer - Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                                loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                            }`}
                            disabled={loading}
                        >
                            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding...</> : 'Add Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVendorForm;