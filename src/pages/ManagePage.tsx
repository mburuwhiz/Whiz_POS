import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Keyboard } from 'lucide-react';

const ManagePage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore(state => ({
      businessSetup: state.businessSetup,
      saveBusinessSetup: state.saveBusinessSetup,
  }));

  const [onScreenKeyboard, setOnScreenKeyboard] = useState(false);

  useEffect(() => {
    // Synchronize local state with the store when the component mounts or businessSetup changes.
    if (businessSetup) {
      setOnScreenKeyboard(businessSetup.onScreenKeyboard || false);
    }
  }, [businessSetup]);

  const handleSave = () => {
    if (businessSetup) {
      // Create a new object for the updated settings to ensure state updates correctly.
      const updatedSetup = { ...businessSetup, onScreenKeyboard };
      saveBusinessSetup(updatedSetup);
      alert('Settings saved!'); // Provide feedback to the user.
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Settings</h1>

      <div className="p-4 border rounded-lg">
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
      <div className="mt-6 p-4 border rounded-lg">
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
            href="#" // Placeholder link
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
