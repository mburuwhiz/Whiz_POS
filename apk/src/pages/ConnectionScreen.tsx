import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Zap } from 'lucide-react';
import { useStore } from '../store/store';
import QrScanner from '../components/QrScanner';
import Notification from '../components/Notification';
import { Camera } from '@capacitor/camera';
import './ConnectionScreen.css';
import '../components/QrScanner.css';
import '../components/Notification.css';

const ConnectionScreen = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const setConnectionDetails = useStore((state) => state.setConnectionDetails);
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      // The server expects the API key in the 'Authorization' header with 'Bearer '.
      const response = await fetch(`${serverUrl}/api/sync`, {
        headers: {
          'Authorization': `Bearer ${syncKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or server not found');
      }

      setConnectionDetails(serverUrl, syncKey);
      navigate('/login');
    } catch (error) {
      console.error('Connection failed:', error);
      setNotification({ message: 'Connection failed. Please check the URL and sync key.', type: 'error' });
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
      setNotification({ message: 'Invalid QR code format.', type: 'error' });
    }
  };

  const openScanner = async () => {
    try {
      await Camera.requestPermissions();
      setScannerOpen(true);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setNotification({ message: 'Camera permission is required to scan QR codes.', type: 'error' });
    }
  };

  return (
    <div className="connection-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
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
        <button onClick={openScanner}>
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
