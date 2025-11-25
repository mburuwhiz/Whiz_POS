import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Zap } from 'lucide-react';
import { useStore } from '../store/store';
import QrScanner from '../components/QrScanner';
import './ConnectionScreen.css';
import '../components/QrScanner.css';

const ConnectionScreen = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const setConnectionDetails = useStore((state) => state.setConnectionDetails);
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/sync`, {
        headers: {
          'X-API-KEY': syncKey,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or server not found');
      }

      setConnectionDetails(serverUrl, syncKey);
      navigate('/login');
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed. Please check the URL and sync key.');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    try {
      const { apiUrl, apiKey } = JSON.parse(decodedText);
      setServerUrl(apiUrl);
      setSyncKey(apiKey);
      setScannerOpen(false);
    } catch (error) {
      console.error('Failed to parse QR code:', error);
      alert('Invalid QR code format.');
    }
  };

  return (
    <div className="connection-screen">
      <div className="connection-card">
        <h1>Connect to Desktop</h1>
        <input
          type="text"
          placeholder="Desktop Server URL"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mobile Sync Key"
          value={syncKey}
          onChange={(e) => setSyncKey(e.target.value)}
        />
        <button onClick={() => setScannerOpen(true)}>
          <QrCode size={16} />
          <span>Scan QR Code</span>
        </button>
        <button onClick={handleConnect}>
          <Zap size={16} />
          <span>Connect</span>
        </button>
      </div>
      {isScannerOpen && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default ConnectionScreen;
