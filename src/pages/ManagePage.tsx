import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Keyboard, Copy, RefreshCw, Smartphone, Check } from 'lucide-react';
import QRCode from 'qrcode';

const ManagePage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore(state => ({
      businessSetup: state.businessSetup,
      saveBusinessSetup: state.saveBusinessSetup,
  }));

  const [onScreenKeyboard, setOnScreenKeyboard] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Synchronize local state with the store when the component mounts or businessSetup changes.
    if (businessSetup) {
      setOnScreenKeyboard(businessSetup.onScreenKeyboard || false);

      if (businessSetup.apiKey) {
        generateQRCode(businessSetup.apiKey);
      }
    }
  }, [businessSetup]);

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text);
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = () => {
    if (businessSetup) {
      // Create a new object for the updated settings to ensure state updates correctly.
      const updatedSetup = { ...businessSetup, onScreenKeyboard };
      saveBusinessSetup(updatedSetup);
      alert('Settings saved!'); // Provide feedback to the user.
    }
  };

  const generateApiKey = () => {
    if (!businessSetup) return;

    // Generate a random API key (UUID v4 style or simple random string)
    const newApiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const updatedSetup = { ...businessSetup, apiKey: newApiKey };
    saveBusinessSetup(updatedSetup);
    generateQRCode(newApiKey);
  };

  const copyApiKey = () => {
    if (businessSetup?.apiKey) {
      navigator.clipboard.writeText(businessSetup.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* On-Screen Keyboard Settings */}
        <div className="p-4 border rounded-lg h-fit">
          <div className="flex items-center mb-4">
            <Keyboard className="w-5 h-5 mr-3 text-gray-500" />
            <label className="text-lg font-medium text-gray-700">
              On-Screen Keyboard
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
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

        {/* API Key & Mobile Connection */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center mb-4">
            <Smartphone className="w-5 h-5 mr-3 text-gray-500" />
            <label className="text-lg font-medium text-gray-700">
              Mobile & Back Office Connection
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={businessSetup?.apiKey || 'No API Key generated'}
                  className="flex-1 p-2 border rounded bg-white text-sm text-gray-600 font-mono"
                />
                <button
                  onClick={copyApiKey}
                  className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Copy API Key"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={generateApiKey}
                  className="p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Generate New Key"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use this key to connect the Mobile APK or Back Office.
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center p-4 bg-white rounded border">
                <img src={qrCodeUrl} alt="API Key QR Code" className="w-48 h-48" />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Scan to connect Mobile App
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Downloads & Links Section */}
      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Downloads & Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#"
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Download Android APK
          </a>
          <a
            href="#"
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Download Windows App
          </a>
          <a
            href="http://localhost:5000" // Updated to point to the local back-office for now
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Access Back Office
          </a>
        </div>
      </div>

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
