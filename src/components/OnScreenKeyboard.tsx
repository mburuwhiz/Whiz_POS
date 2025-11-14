import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import { X, CornerDownLeft, delete as DeleteKey, ChevronUp } from 'lucide-react';
import Draggable from 'react-draggable';

const OnScreenKeyboard = () => {
  const { isKeyboardOpen, closeKeyboard, updateKeyboardTargetValue } = usePosStore();
  const [capsLock, setCapsLock] = useState(false);

  if (!isKeyboardOpen) return null;

  const handleKeyPress = (key: string) => {
    const keyToPress = capsLock && key.length === 1 ? key.toUpperCase() : key;
    updateKeyboardTargetValue(keyToPress);
  };

  const keyRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const KeyButton = ({ children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`flex h-12 min-w-[40px] flex-1 items-center justify-center rounded-md bg-white p-2 text-lg font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-200 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <Draggable handle=".keyboard-handle">
            <div className="w-full max-w-3xl cursor-move rounded-lg bg-gray-300 p-3 shadow-2xl">
                <div className="keyboard-handle mb-2 flex justify-end">
                    <button onClick={closeKeyboard} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-2">
                    {keyRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center space-x-2">
                        {rowIndex === 2 && <div className="w-4" />} {/* Stagger ASDF row */}
                        {rowIndex === 3 && (
                            <KeyButton onClick={() => setCapsLock(!capsLock)} className={capsLock ? 'bg-blue-500 text-white' : ''}>
                                <ChevronUp />
                            </KeyButton>
                        )}
                        {row.map((key) => (
                            <KeyButton key={key} onClick={() => handleKeyPress(key)}>
                                {capsLock ? key.toUpperCase() : key}
                            </KeyButton>
                        ))}
                        {rowIndex === 3 && (
                             <KeyButton onClick={() => handleKeyPress('backspace')} className="w-16">
                                <DeleteKey />
                            </KeyButton>
                        )}
                         {rowIndex === 2 && <div className="w-4" />} {/* Stagger ASDF row */}
                        </div>
                    ))}
                    <div className="flex justify-center space-x-2">
                        <KeyButton onClick={() => handleKeyPress(' ')} className="flex-[8]">
                            Space
                        </KeyButton>
                        <KeyButton onClick={() => handleKeyPress('enter')} className="w-20">
                            <CornerDownLeft />
                        </KeyButton>
                    </div>
                </div>
            </div>
      </Draggable>
    </div>
  );
};

export default OnScreenKeyboard;
