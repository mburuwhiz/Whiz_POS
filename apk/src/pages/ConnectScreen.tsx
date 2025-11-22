import { useState } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { Capacitor } from '@capacitor/core';
import { QrCode, Wifi, Loader2, Server } from 'lucide-react';

const ConnectScreen = () => {
  const { setConnection, checkConnection, syncWithServer } = useMobileStore();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!url || !key) {
        setError("Please enter URL and API Key");
        return;
    }

    setLoading(true);
    setError('');

    // Save temporarily to test
    setConnection(url, key);

    const success = await checkConnection();
    if (success) {
        await syncWithServer(); // Fetch initial data
        // The App router will redirect to Login once data is loaded (users.length > 0)
    } else {
        setError("Could not connect to Desktop POS. Check IP and Network.");
    }
    setLoading(false);
  };

  const handleScan = async () => {
      if (!Capacitor.isNativePlatform()) {
          alert("Camera scan only available on device.");
          return;
      }
      alert("Please use Manual Entry for now.");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
            <div className="bg-sky-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold">Connect to Desktop</h1>
            <p className="text-slate-400">Enter the connection details found in the Desktop POS Settings.</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Server URL</label>
                <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="http://192.168.1.x:3000"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">API Key</label>
                <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        placeholder="Enter API Key"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                </div>
            </div>

            {error && <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-lg text-center">{error}</div>}

            <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect'}
            </button>
        </div>

        <button onClick={handleScan} className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            Scan QR Code
        </button>
      </div>
    </div>
  );
};

export default ConnectScreen;
