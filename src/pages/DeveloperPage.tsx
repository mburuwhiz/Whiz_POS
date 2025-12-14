import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Shield, Key, Database, Globe, Save, RefreshCw, Lock, CheckCircle, AlertTriangle, Delete } from 'lucide-react';

const DeveloperPage = () => {
    const { businessSetup, saveBusinessSetup } = usePosStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Config State
    const [storedPin, setStoredPin] = useState('1410399');
    const [mongoUri, setMongoUri] = useState('');
    const [backOfficeUrl, setBackOfficeUrl] = useState('');
    const [backOfficeApiKey, setBackOfficeApiKey] = useState('');
    const [isPushing, setIsPushing] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [businessSetup]);

    const loadConfig = async () => {
        try {
            if (window.electron && window.electron.getDeveloperConfig) {
                const config = await window.electron.getDeveloperConfig();
                setStoredPin(config.developerPin || '1410399');
                setMongoUri(config.mongoUri || '');

                // Load Back Office settings from Store (primary source) or Config (fallback)
                setBackOfficeUrl(businessSetup?.backOfficeUrl || businessSetup?.apiUrl || '');
                setBackOfficeApiKey(businessSetup?.backOfficeApiKey || businessSetup?.apiKey || '');
            }
        } catch (e) {
            console.error("Failed to load developer config", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Keypad Logic
    const handleKeyPress = (key: string) => {
        if (pin.length < 7) { // Allow longer PINs if needed, default is 7 digits
            const newPin = pin + key;
            setPin(newPin);
            setError('');
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleClear = () => {
        setPin('');
        setError('');
    };

    const handleLogin = () => {
        if (pin === storedPin) {
            setIsAuthenticated(true);
            setPin('');
            setError('');
        } else {
            setError('Incorrect PIN');
            setPin('');
        }
    };

    const handleSaveSettings = async () => {
        setSuccessMsg('');
        // 1. Save Mongo URI to server-config.json
        if (window.electron && window.electron.saveDeveloperConfig) {
            await window.electron.saveDeveloperConfig({ mongoUri });
        }

        // 2. Save Back Office Settings to Business Setup (Store)
        const updatedSetup = {
            ...businessSetup,
            backOfficeUrl,
            backOfficeApiKey,
            apiUrl: backOfficeUrl,
            apiKey: backOfficeApiKey,
            isSetup: true
        };
        // @ts-ignore
        saveBusinessSetup(updatedSetup);
        setSuccessMsg('Settings saved successfully');
    };

    const handleDirectPush = async () => {
        if (!mongoUri) {
            setError('MongoDB URI is required for direct push');
            return;
        }
        setIsPushing(true);
        setError('');
        setSuccessMsg('');

        try {
            if (window.electron && window.electron.directDbPush) {
                const result = await window.electron.directDbPush(mongoUri);
                if (result.success) {
                    setSuccessMsg('Data successfully pushed to Cloud Database!');
                } else {
                    setError('Push Failed: ' + (result.error || 'Unknown error'));
                }
            } else {
                setError('Electron environment not detected');
            }
        } catch (e: any) {
            setError('Push Error: ' + e.message);
        } finally {
            setIsPushing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    // PIN Entry Screen (Keypad)
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
                    <div className="text-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Developer Access</h2>
                        <p className="text-gray-500 text-sm">Enter Developer PIN</p>
                    </div>

                    {/* PIN Dots */}
                    <div className="flex justify-center gap-2 mb-6 h-4">
                        {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors ${i < pin.length ? 'bg-blue-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center mb-4 animate-bounce">
                            {error}
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleKeyPress(num.toString())}
                                className="h-14 rounded-lg bg-gray-50 hover:bg-gray-100 text-xl font-semibold text-gray-700 transition-colors shadow-sm border border-gray-100 active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            className="h-14 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors shadow-sm border border-red-100 active:scale-95"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => handleKeyPress('0')}
                            className="h-14 rounded-lg bg-gray-50 hover:bg-gray-100 text-xl font-semibold text-gray-700 transition-colors shadow-sm border border-gray-100 active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="h-14 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors shadow-sm border border-gray-100 flex items-center justify-center active:scale-95"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors active:scale-95"
                    >
                        Unlock Settings
                    </button>
                </div>
            </div>
        );
    }

    // Authenticated Developer Settings
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="w-10 h-10 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Developer Settings</h1>
                    <p className="text-gray-600">Advanced configuration and database management.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Cloud Connection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Back Office API</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                            <input
                                type="text"
                                value={backOfficeUrl}
                                onChange={(e) => setBackOfficeUrl(e.target.value)}
                                placeholder="https://your-backoffice.com"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                            <input
                                type="password"
                                value={backOfficeApiKey}
                                onChange={(e) => setBackOfficeApiKey(e.target.value)}
                                placeholder="Secret API Key"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Direct DB Sync */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Direct Database Connection</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Directly push local data to the MongoDB instance. Useful if the API sync is blocked or failing.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">MongoDB Connection URI</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={mongoUri}
                                    onChange={(e) => setMongoUri(e.target.value)}
                                    placeholder="mongodb+srv://user:pass@cluster.mongodb.net/..."
                                    className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={handleDirectPush}
                                disabled={isPushing || !mongoUri}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-medium transition-colors
                                    ${isPushing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isPushing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Pushing Data...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-5 h-5" />
                                        Push to Cloud DB
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {successMsg && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 animate-fade-in">
                        <CheckCircle className="w-5 h-5" />
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 animate-fade-in">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSaveSettings}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-5 h-5" />
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPage;
