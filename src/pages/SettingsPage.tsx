import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { QrCode, Smartphone } from 'lucide-react';

const SettingsPage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore();

  // State for all settings
  const [settings, setSettings] = useState({
    printerType: 'thermal',
    apiUrl: '',
    apiKey: '',
  });
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (businessSetup) {
      setSettings({
        printerType: businessSetup.printerType || 'thermal',
        apiUrl: businessSetup.apiUrl || '',
        apiKey: businessSetup.apiKey || '',
      });
    }
    // Fetch the QR code on component mount
    const fetchApiConfig = async () => {
      if (window.electron) {
        const config = await window.electron.getApiConfig();
        setQrCode(config.qrCodeDataUrl);
        // Also update the state with the fetched config if it's not already set
        if (!settings.apiUrl || !settings.apiKey) {
          setSettings(prev => ({
            ...prev,
            apiUrl: prev.apiUrl || config.apiUrl,
            apiKey: prev.apiKey || config.apiKey,
          }));
        }
      }
    };
    fetchApiConfig();
  }, [businessSetup]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    if (businessSetup) {
      saveBusinessSetup({ ...businessSetup, ...settings });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* General Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">General</h2>
        <div className="mb-4">
          <label htmlFor="printerType" className="block text-gray-700 mb-2 font-medium">Printer Type</label>
          <select
            id="printerType"
            value={settings.printerType}
            onChange={handleInputChange}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thermal">Thermal Receipt Printer</option>
            <option value="standard">Standard/PDF Printer</option>
          </select>
        </div>
      </div>

      {/* Cloud Sync Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Cloud Sync Settings</h2>
        <p className="text-gray-600 mb-4">Connect the mobile back-office app by scanning the QR code.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-4">
              <label htmlFor="apiUrl" className="block text-gray-700 mb-2 font-medium">API URL</label>
              <input
                type="text"
                id="apiUrl"
                value={settings.apiUrl}
                onChange={handleInputChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-gray-700 mb-2 font-medium">API Key</label>
              <input
                type="password" // Mask the key for security
                id="apiKey"
                value={settings.apiKey}
                onChange={handleInputChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-md">
            {qrCode ? (
              <img src={qrCode} alt="API Configuration QR Code" className="w-40 h-40" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-md">
                <QrCode className="text-gray-400 w-16 h-16" />
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <Smartphone className="w-4 h-4 mr-1" />
              Scan with mobile app
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
