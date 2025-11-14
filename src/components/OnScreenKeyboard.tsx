import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';

const OnScreenKeyboard = () => {
  const { isKeyboardOpen, closeKeyboard, updateKeyboardTargetValue } = usePosStore();
  const [capsLock, setCapsLock] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  if (!isKeyboardOpen) return null;

  const handleKeyPress = (key: string) => {
    updateKeyboardTargetValue(key);
  };

  const toggleCapsLock = () => {
    setCapsLock(!capsLock);
  };

  const toggleNumberView = () => {
    setShowNumbers(!showNumbers);
  };

  const renderKeys = () => {
    const keys = showNumbers
      ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '⌫']
      : 'qwertyuiopasdfghjklzxcvbnm'.split('');

    return keys.map((key) => {
      const displayKey = capsLock ? key.toUpperCase() : key;
      return (
        <button
          key={key}
          onClick={() => handleKeyPress(key === '⌫' ? 'backspace' : displayKey)}
          className="m-1 flex-1 rounded-md bg-white p-4 text-xl shadow-sm hover:bg-gray-200"
        >
          {displayKey}
        </button>
      );
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-300 p-4 shadow-lg">
      <div className="mb-2 flex flex-wrap justify-center">{renderKeys()}</div>
      <div className="flex justify-between">
        <button onClick={toggleNumberView} className="rounded-md bg-white p-4 shadow-sm hover:bg-gray-200">
          {showNumbers ? 'ABC' : '123'}
        </button>
        <button onClick={toggleCapsLock} className={`rounded-md p-4 shadow-sm ${capsLock ? 'bg-blue-500 text-white' : 'bg-white'}`}>
          Caps
        </button>
        <button onClick={() => handleKeyPress(' ')} className="flex-grow rounded-md bg-white p-4 shadow-sm hover:bg-gray-200">
          Space
        </button>
        <button onClick={closeKeyboard} className="rounded-md bg-red-500 p-4 text-white shadow-sm hover:bg-red-600">
          Close
        </button>
      </div>
    </div>
  );
};

export default OnScreenKeyboard;
