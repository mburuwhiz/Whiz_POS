import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { BusinessSetup } from '../store/posStore';

const SettingsPage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore();
  const [formData, setFormData] = useState<BusinessSetup | null>(null);

  useEffect(() => {
    if (businessSetup) {
      setFormData(businessSetup);
    }
  }, [businessSetup]);

  const handleInputChange = (field: keyof BusinessSetup) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (formData) {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      saveBusinessSetup(formData);
      alert('Settings saved successfully!');
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={handleInputChange('businessName')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">"Served By" Label</label>
          <input
            type="text"
            value={formData.servedByLabel || ''}
            onChange={handleInputChange('servedByLabel')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">M-Pesa Paybill</label>
          <input
            type="text"
            value={formData.mpesaPaybill || ''}
            onChange={handleInputChange('mpesaPaybill')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">M-Pesa Till</label>
          <input
            type="text"
            value={formData.mpesaTill || ''}
            onChange={handleInputChange('mpesaTill')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">M-Pesa Account Number</label>
          <input
            type="text"
            value={formData.mpesaAccountNumber || ''}
            onChange={handleInputChange('mpesaAccountNumber')}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
