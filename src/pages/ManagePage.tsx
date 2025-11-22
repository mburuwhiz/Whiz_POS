import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Keyboard, Smartphone, Globe, Printer, UploadCloud } from 'lucide-react';

/**
 * ManagePage component.
 * Handles system configuration, including on-screen keyboard settings,
 * device connections (mobile printer), and back-office synchronization.
 */
const ManagePage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore(state => ({
      businessSetup: state.businessSetup,
      saveBusinessSetup: state.saveBusinessSetup,
  }));

  const [onScreenKeyboard, setOnScreenKeyboard] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [apiConfig, setApiConfig] = useState<{apiKey: string, apiUrl: string, qrCodeDataUrl: string} | null>(null);
  const [backOfficeUrl, setBackOfficeUrl] = useState('');
  const [backOfficeKey, setBackOfficeKey] = useState('');

  useEffect(() => {
    // Synchronize local state with the store when the component mounts or businessSetup changes.
    if (businessSetup) {
      setOnScreenKeyboard(businessSetup.onScreenKeyboard || false);
      setBackOfficeUrl(businessSetup.backOfficeUrl || '');
      setBackOfficeKey(businessSetup.backOfficeApiKey || '');
    }
  }, [businessSetup]);

  useEffect(() => {
      // Fetch API Config for Mobile Printer Connection
      if (window.electron && window.electron.getApiConfig) {
          window.electron.getApiConfig().then((config: any) => {
              setApiConfig(config);
          });
      }
  }, []);

  const handleSave = () => {
    if (businessSetup) {
      // Create a new object for the updated settings to ensure state updates correctly.
      const updatedSetup = {
          ...businessSetup,
          onScreenKeyboard,
          backOfficeUrl,
          backOfficeApiKey: backOfficeKey
      };
      saveBusinessSetup(updatedSetup);
      alert('Settings saved!'); // Provide feedback to the user.
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Settings</h1>

      <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-4 font-medium ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              General
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-2 px-4 font-medium ${activeTab === 'devices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              Devices & Connections
          </button>
      </div>

      {activeTab === 'general' && (
          <>
            <div className="p-4 border rounded-lg mb-6">
                <div className="flex items-center">
                <Keyboard className="w-5 h-5 mr-3 text-gray-500" />
                <label className="text-lg font-medium text-gray-700">
                    On-Screen Keyboard
                </label>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                <button
                    onClick={() => setOnScreenKeyboard(true)}
                    className={`px-4 py-3 rounded-lg text-center font-semibold transition-colors ${
                    onScreenKeyboard
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Enable
                </button>
                <button
                    onClick={() => setOnScreenKeyboard(false)}
                    className={`px-4 py-3 rounded-lg text-center font-semibold transition-colors ${
                    !onScreenKeyboard
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Disable
                </button>
                </div>
            </div>

            {/* Downloads & Links Section */}
            <div className="p-4 border rounded-lg">
                <h2 className="text-lg font-medium text-gray-700 mb-4">Downloads & Links</h2>
                <div className="space-y-3">
                <a
                    href="#" // Placeholder link
                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    Download Android APK
                </a>
                <a
                    href="#" // Placeholder link
                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Download Windows App
                </a>
                <a
                    href="http://localhost:5000"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                    Access Back Office
                </a>
                </div>
            </div>
          </>
      )}

      {activeTab === 'devices' && (
          <div className="space-y-8">
              {/* Mobile Printer Connection (Desktop API) */}
              <div className="p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-800">Mobile App Connection</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code with the Mobile App to connect to this Desktop POS for printing and syncing.
                  </p>

                  {apiConfig ? (
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <img src={apiConfig.qrCodeDataUrl} alt="Connection QR Code" className="w-48 h-48" />
                          </div>
                          <div className="flex-1 space-y-4 w-full">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Server URL</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="block w-full bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono text-gray-800">
                                        {apiConfig.apiUrl}
                                    </code>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Secret API Key</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="block w-full bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono text-gray-800 break-all">
                                        {apiConfig.apiKey}
                                    </code>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Loading connection details...</p>
                        <p className="text-xs text-red-500 mt-2">If this persists, ensure the Desktop App is running in Electron.</p>
                      </div>
                  )}
              </div>

              {/* Back Office Connection */}
              <div className="p-6 border rounded-lg bg-white">
                  <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-6 h-6 text-purple-600" />
                      <h2 className="text-xl font-bold text-gray-800">Back Office Connection</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                      Enter the details of your Back Office server to enable data synchronization.
                  </p>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Back Office URL</label>
                          <input
                            type="text"
                            placeholder="e.g., http://localhost:5000"
                            value={backOfficeUrl}
                            onChange={(e) => setBackOfficeUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Back Office API Key</label>
                          <input
                            type="password"
                            placeholder="Enter your secret Back Office API Key"
                            value={backOfficeKey}
                            onChange={(e) => setBackOfficeKey(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                      </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to overwrite cloud data with local data? This action cannot be undone.')) {
                                usePosStore.getState().pushDataToServer();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors"
                      >
                          <UploadCloud className="w-5 h-5" />
                          Sync Local Data to Cloud (Full Push)
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                          Use this to initialize the Back Office with your current Desktop data.
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default ManagePage;
