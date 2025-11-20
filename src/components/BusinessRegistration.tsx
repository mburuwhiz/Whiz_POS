import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Building2, Globe, CheckCircle, AlertCircle, Lock } from 'lucide-react';

export default function BusinessRegistration() {
  console.log('BusinessRegistration component rendering');
  const { finishSetup, isDataLoaded, businessSetup } = usePosStore(state => ({
    finishSetup: state.finishSetup,
    isDataLoaded: state.isDataLoaded,
    businessSetup: state.businessSetup,
  }));

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    businessId: '',
    servedByLabel: 'Cashier',
    mpesaPaybill: '',
    mpesaTill: '',
    mpesaAccountNumber: '',
    tax: 0,
    subtotal: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Generate a random Business ID on mount
  useEffect(() => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, businessId: randomId }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const businessData = {
      businessName: formData.businessName,
      businessId: formData.businessId,
      password: formData.password,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      servedByLabel: formData.servedByLabel,
      mpesaPaybill: formData.mpesaPaybill,
      mpesaTill: formData.mpesaTill,
      mpesaAccountNumber: formData.mpesaAccountNumber,
      tax: formData.tax,
      subtotal: formData.subtotal,
      isSetup: true,
      isLoggedIn: false, // Ensure login is required after setup
    };

    const adminUser = {
      id: `USR${Date.now()}`,
      name: formData.ownerName,
      pin: '0000', // Default PIN, but login will use Password now
      role: 'admin' as const,
    };

    try {
      await finishSetup(businessData, adminUser);
      setSubmitMessage('Business registered successfully! You can now start using WHIZ POS.');
    } catch (error) {
      console.error('Failed to finish setup:', error);
      setSubmitMessage('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-full bg-white shadow-lg mb-6">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Setup Your Business</h1>
          <p className="text-lg text-gray-500 mt-2">Configure your point of sale system</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-8 flex items-center pb-4 border-b border-gray-100">
             Business Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Auto-generated Business ID Display */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-blue-900 font-semibold text-lg">Your Business ID</h3>
                <p className="text-blue-700 text-sm">Use this number to log in to your system.</p>
              </div>
              <div className="mt-4 md:mt-0 text-3xl font-mono font-bold text-blue-600 tracking-wider bg-white px-6 py-2 rounded-lg shadow-sm border border-blue-100">
                {formData.businessId}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange('businessName')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={handleInputChange('ownerName')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Business owner name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-gray-400" />
                Admin Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleInputChange('password')}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a secure password"
              />
              <p className="text-xs text-gray-500 mt-2">This password will be used for the initial login.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+254 XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Business Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={handleInputChange('address')}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="123 Business Street, City, Country"
              />
            </div>

            {/* M-Pesa Details (Collapsible or Sectioned) */}
            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-md font-semibold text-gray-700 mb-4">Payment Configuration (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">M-Pesa Paybill</label>
                        <input type="text" value={formData.mpesaPaybill} onChange={handleInputChange('mpesaPaybill')} className="w-full p-2 rounded bg-gray-50 border text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">M-Pesa Till</label>
                        <input type="text" value={formData.mpesaTill} onChange={handleInputChange('mpesaTill')} className="w-full p-2 rounded bg-gray-50 border text-sm" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                        <input type="text" value={formData.mpesaAccountNumber} onChange={handleInputChange('mpesaAccountNumber')} className="w-full p-2 rounded bg-gray-50 border text-sm" />
                    </div>
                </div>
            </div>


            <div className="flex items-center justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Setting Up...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {submitMessage && (
            <div className={`mt-8 p-4 rounded-xl border ${submitMessage.includes('successfully') ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} animate-fade-in-up`}>
              <div className="flex items-center space-x-3">
                {submitMessage.includes('successfully') ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                )}
                <p className={`text-md font-medium ${submitMessage.includes('successfully') ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {submitMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
