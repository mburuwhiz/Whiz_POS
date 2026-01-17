import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, CheckCircle, Wifi, Monitor, Copy } from 'lucide-react';
import { usePosStore } from '../store/posStore';
import QRCode from 'react-qr-code';

export default function OfflineSyncStatus() {
  const { isOnline, apiConfig, businessSetup } = usePosStore();
  const [localIp, setLocalIp] = useState<string>('');

  // Try to get local IP (this is a best-effort in browser, usually handled by electron or known by user)
  useEffect(() => {
    // In a real Electron app, we'd request this from the main process
    // For now, we rely on the user knowing their IP or the displayed mock
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setLocalIp(window.location.hostname);
    } else {
        // Fallback or placeholder for the "server" IP
        setLocalIp('192.168.1.X');
    }
  }, []);

  const serverUrl = `http://${localIp}:3000`; // Assuming default port

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">

      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Smartphone className="w-5 h-5 text-indigo-600" />
             Connected Devices
           </h2>
           <p className="text-sm text-slate-500">Manage Mobile App connections.</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
           <Wifi className="w-3 h-3" />
           {isOnline ? 'Cloud Connected' : 'Local Mode'}
        </div>
      </div>

      <div className="p-8">
         <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center space-y-4">
               <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                  {apiConfig?.apiKey ? (
                    <QRCode
                        value={JSON.stringify({
                            url: serverUrl,
                            key: apiConfig.apiKey,
                            business: businessSetup?.businessName
                        })}
                        size={180}
                        level="H"
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                        Generating Key...
                    </div>
                  )}
               </div>
               <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Scan with Mobile App</p>
            </div>

            {/* Manual Connection Info */}
            <div className="space-y-6">

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server URL</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-700 font-mono text-sm">
                           {serverUrl}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(serverUrl)}
                            className="p-3 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            title="Copy URL"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">Enter this exactly into the Mobile App settings.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Sync Key</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-700 font-mono text-xs break-all">
                           {apiConfig?.apiKey || 'Generating...'}
                        </code>
                        <button
                             onClick={() => apiConfig?.apiKey && navigator.clipboard.writeText(apiConfig.apiKey)}
                             className="p-3 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                             title="Copy Key"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">This key secures the connection between Mobile and Desktop.</p>
                </div>

                <div className="bg-indigo-50 text-indigo-900 p-4 rounded-lg text-sm flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p>
                        Ensure your Mobile Device is connected to the same Wi-Fi network as this computer.
                    </p>
                </div>

            </div>

         </div>
      </div>
    </div>
  );
}
