import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { usePosStore } from '../store/posStore';

const OnScreenKeyboard = () => {
  const { isKeyboardOpen, closeKeyboard, keyboardTarget, updateKeyboardTargetValue } = usePosStore();
  const [isCaps, setIsCaps] = useState(false);

  if (!isKeyboardOpen) return null;

  const handleKeyPress = (key: string) => {
    if (!keyboardTarget) return;

    const finalKey = isCaps ? key.toUpperCase() : key;

    const target = keyboardTarget as HTMLInputElement;
    const currentCaretPosition = target.selectionStart || 0;
    const currentValue = target.value;
    const newValue = currentValue.slice(0, currentCaretPosition) + finalKey + currentValue.slice(currentCaretPosition);

    updateKeyboardTargetValue(newValue);

    target.focus();
    setTimeout(() => {
      target.setSelectionRange(currentCaretPosition + 1, currentCaretPosition + 1);
    }, 0);
  };

  const handleBackspace = () => {
    if (!keyboardTarget) return;

    const target = keyboardTarget as HTMLInputElement;
    const currentCaretPosition = target.selectionStart || 0;
    const currentValue = target.value;

    if (currentCaretPosition > 0) {
      const newValue = currentValue.slice(0, currentCaretPosition - 1) + currentValue.slice(currentCaretPosition);

      updateKeyboardTargetValue(newValue);

      target.focus();
      setTimeout(() => {
        target.setSelectionRange(currentCaretPosition - 1, currentCaretPosition - 1);
      }, 0);
    }
  };

  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '-'],
  ];

  return (
    <Draggable handle=".keyboard-header">
      <div className="fixed bottom-1/4 left-1/4 w-1/2 bg-gray-200 p-2 rounded-lg shadow-lg z-50">
        <div className="keyboard-header bg-gray-300 text-center p-1 rounded-t-lg cursor-move">
          On-Screen Keyboard
        </div>
        <div className="p-2">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center my-1">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="w-12 h-12 m-1 bg-white rounded shadow hover:bg-gray-100"
                >
                  {isCaps ? key.toUpperCase() : key}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center my-1">
            <button
              onClick={() => setIsCaps(!isCaps)}
              className={`w-24 h-12 m-1 rounded shadow ${isCaps ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Caps
            </button>
            <button
              onClick={() => handleKeyPress(' ')}
              className="w-64 h-12 m-1 bg-white rounded shadow hover:bg-gray-100"
            >
              Space
            </button>
            <button
              onClick={handleBackspace}
              className="w-24 h-12 m-1 bg-white rounded shadow hover:bg-gray-100"
            >
              Backspace
            </button>
            <button
              onClick={closeKeyboard}
              className="w-24 h-12 m-1 bg-red-400 text-white rounded shadow hover:bg-red-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default OnScreenKeyboard;
