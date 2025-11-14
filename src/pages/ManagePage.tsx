import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';

const ManagePage = () => {
  const { businessSetup, saveBusinessSetup } = usePosStore();
  const [onScreenKeyboard, setOnScreenKeyboard] = useState(businessSetup?.onScreenKeyboard || false);

  const handleSave = () => {
    if (businessSetup) {
      saveBusinessSetup({ ...businessSetup, onScreenKeyboard });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage</h1>
      <div className="mb-4">
        <label htmlFor="onScreenKeyboard" className="flex items-center">
          <input
            type="checkbox"
            id="onScreenKeyboard"
            checked={onScreenKeyboard}
            onChange={(e) => setOnScreenKeyboard(e.target.checked)}
            className="mr-2"
          />
          <span>Enable On-Screen Keyboard</span>
        </label>
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Save Settings
      </button>
    </div>
  );
};

export default ManagePage;
