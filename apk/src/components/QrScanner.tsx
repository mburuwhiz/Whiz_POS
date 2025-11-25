import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div id="qr-reader" />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default QrScanner;
