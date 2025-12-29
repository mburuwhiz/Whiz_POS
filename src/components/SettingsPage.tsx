import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
import QRCode from 'qrcode';
import { 
  Settings, 
  Users, 
  Package, 
  Database, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  RefreshCw,
  Building,
  Phone,
  Mail,
  Receipt,
  Keyboard,
  QrCode,
  X,
  Smartphone,
  Monitor,
  Printer,
  Shield,
  Clock
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    businessSetup, 
    users, 
    saveBusinessSetup,
    addUser,
    updateUser,
    deleteUser,
    isOnline,
    lastSyncTime,
    processSyncQueue,
    pushDataToServer
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'business' | 'users' | 'security' | 'sync' | 'devices' | 'printers' | 'updates'>('business');
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  // User QR State
  const [showUserQr, setShowUserQr] = useState<User | null>(null);
  const [qrCodeData, setQrCodeData] = useState('');

  const [businessData, setBusinessData] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    receiptFooter: '',
    apiUrl: '',
    apiKey: '',
    servedByLabel: '',
    mpesaPaybill: '',
    mpesaTill: '',
    mpesaAccountNumber: '',
    mongoDbUri: '',
    onScreenKeyboard: false,
    autoLogoffEnabled: false,
    autoLogoffMinutes: 5,
  });

  const [userData, setUserData] = useState({
    name: '',
    pin: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier'
  });

  const [apiConfig, setApiConfig] = useState<{ apiUrl: string, apiKey: string, qrCodeDataUrl: string } | null>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  useEffect(() => {
    if (businessSetup) {
      setBusinessData({
        businessName: businessSetup.businessName || '',
        address: businessSetup.address || '',
        phone: businessSetup.phone || '',
        email: businessSetup.email || '',
        receiptFooter: businessSetup.receiptFooter || '',
        apiUrl: businessSetup.apiUrl || '',
        apiKey: businessSetup.apiKey || '',
        servedByLabel: businessSetup.servedByLabel || '',
        mpesaPaybill: businessSetup.mpesaPaybill || '',
        mpesaTill: businessSetup.mpesaTill || '',
        mpesaAccountNumber: businessSetup.mpesaAccountNumber || '',
        mongoDbUri: businessSetup.mongoDbUri || '',
        onScreenKeyboard: businessSetup.onScreenKeyboard || false,
        autoLogoffEnabled: businessSetup.autoLogoffEnabled || false,
        autoLogoffMinutes: businessSetup.autoLogoffMinutes || 5,
      });
    }
  }, [businessSetup]);

  useEffect(() => {
      if(activeTab === 'devices' && window.electron && window.electron.getApiConfig) {
          window.electron.getApiConfig().then(setApiConfig);
      }
      if(activeTab === 'printers' && window.electron) {
        if(window.electron.getPrinters) {
            window.electron.getPrinters().then(setPrinters);
        }
        if(window.electron.getPrinterSettings) {
            window.electron.getPrinterSettings().then(settings => {
                if(settings && settings.defaultPrinter) setSelectedPrinter(settings.defaultPrinter);
            });
        }
      }
  }, [activeTab]);

  const handleSavePrinter = async () => {
    if(window.electron && window.electron.savePrinterSettings) {
        await window.electron.savePrinterSettings({ defaultPrinter: selectedPrinter });
        alert('Printer settings saved!');
    }
  };

  const handleSaveBusiness = () => {
    saveBusinessSetup({ ...businessSetup, ...businessData, isSetup: true } as any);
    setEditingBusiness(false);
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleAddUser = () => {
    if (!userData.name || !userData.pin) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      ...userData
    };
    addUser(newUser);
    resetUserForm();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserData({ name: user.name, pin: user.pin, role: user.role });
    setShowAddUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUser(editingUser.id, { ...editingUser, ...userData });
    resetUserForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleShowQr = async (user: User) => {
      setShowUserQr(user);
      try {
          const payload = { userId: user.id, pin: user.pin };
          const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));
          setQrCodeData(dataUrl);
      } catch (e) {
          console.error("QR Gen Error", e);
      }
  };

  const resetUserForm = () => {
    setUserData({ name: '', pin: '', role: 'cashier' });
    setEditingUser(null);
    setShowAddUser(false);
  }

  const handleBusinessDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusinessData({ ...businessData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Manage your business, users, and connections</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'business' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="w-5 h-5 mr-2" />
              Business
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Users
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield className="w-5 h-5 mr-2" />
              Security
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'devices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Connected Devices
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Database className="w-5 h-5 mr-2" />
              Cloud Back Office
            </button>

            <button
              onClick={() => setActiveTab('printers')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'printers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Printer className="w-5 h-5 mr-2" />
              Printers
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'updates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Updates
            </button>
          </div>
        </div>

        {/* Business Settings */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Business Details</h2>
              {!editingBusiness ? (
                <button onClick={() => setEditingBusiness(true)} className="flex items-center text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              ) : (
                <button onClick={handleSaveBusiness} className="flex items-center text-green-600 hover:text-green-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" name="businessName" value={businessData.businessName} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full pl-10 p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" name="address" value={businessData.address} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full pl-10 p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" name="phone" value={businessData.phone} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full pl-10 p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="email" name="email" value={businessData.email} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full pl-10 p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Receipt Footer</label>
                <textarea name="receiptFooter" value={businessData.receiptFooter} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">"Served By" Label</label>
                <input type="text" name="servedByLabel" value={businessData.servedByLabel} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">M-Pesa Paybill</label>
                <input type="text" name="mpesaPaybill" value={businessData.mpesaPaybill} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">M-Pesa Till</label>
                <input type="text" name="mpesaTill" value={businessData.mpesaTill} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">M-Pesa Account Number</label>
                <input type="text" name="mpesaAccountNumber" value={businessData.mpesaAccountNumber} onChange={handleBusinessDataChange} disabled={!editingBusiness} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
              </div>
               <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                    <div className='flex items-center'>
                        <Keyboard className="w-5 h-5 mr-2 text-gray-600" />
                        <label htmlFor="onScreenKeyboard" className="block text-sm font-medium text-gray-700">On-Screen Keyboard</label>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="enableKeyboard"
                                name="onScreenKeyboard"
                                checked={businessData.onScreenKeyboard}
                                onChange={() => {
                                    setBusinessData(prev => ({ ...prev, onScreenKeyboard: true }));
                                    saveBusinessSetup({ ...businessSetup, ...businessData, onScreenKeyboard: true, isSetup: true } as any);
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="enableKeyboard" className="ml-2 block text-sm text-gray-900">Enable</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="disableKeyboard"
                                name="onScreenKeyboard"
                                checked={!businessData.onScreenKeyboard}
                                onChange={() => {
                                    setBusinessData(prev => ({ ...prev, onScreenKeyboard: false }));
                                    saveBusinessSetup({ ...businessSetup, ...businessData, onScreenKeyboard: false, isSetup: true } as any);
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="disableKeyboard" className="ml-2 block text-sm text-gray-900">Disable</label>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">User Accounts</h2>
              <button onClick={() => { setShowAddUser(true); setEditingUser(null); setUserData({ name: '', pin: '', role: 'cashier' }); }} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleShowQr(user)} className="text-purple-600 hover:text-purple-800" title="Login Badge">
                                <QrCode className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Settings (Auto Logoff) */}
        {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-800">Security & Session</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Manage session timeouts and access security.
                </p>

                <div className="space-y-6 max-w-xl">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <div>
                                    <h3 className="font-medium text-gray-800">Auto Log Off</h3>
                                    <p className="text-xs text-gray-500">Automatically log out inactive users</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">{businessData.autoLogoffEnabled ? 'Enabled' : 'Disabled'}</span>
                                <button
                                    onClick={() => {
                                        const newVal = !businessData.autoLogoffEnabled;
                                        setBusinessData(prev => ({ ...prev, autoLogoffEnabled: newVal }));
                                        saveBusinessSetup({ ...businessSetup, ...businessData, autoLogoffEnabled: newVal, isSetup: true } as any);
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${businessData.autoLogoffEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${businessData.autoLogoffEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {businessData.autoLogoffEnabled && (
                            <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Idle Time (Minutes)</label>
                                <div className="flex gap-4">
                                    {[1, 2, 5, 10, 30, 60].map(mins => (
                                        <button
                                            key={mins}
                                            onClick={() => {
                                                setBusinessData(prev => ({ ...prev, autoLogoffMinutes: mins }));
                                                saveBusinessSetup({ ...businessSetup, ...businessData, autoLogoffMinutes: mins, isSetup: true } as any);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                                                businessData.autoLogoffMinutes === mins
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <label className="text-xs text-gray-500">Custom (min):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={businessData.autoLogoffMinutes}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setBusinessData(prev => ({ ...prev, autoLogoffMinutes: val }));
                                            saveBusinessSetup({ ...businessSetup, ...businessData, autoLogoffMinutes: val, isSetup: true } as any);
                                        }}
                                        className="ml-2 w-20 px-2 py-1 text-sm border rounded"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Devices & Connection */}
        {activeTab === 'devices' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Mobile App Connection</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
                Scan this QR code with the Mobile App to connect to this Desktop POS for printing and syncing.
            </p>

            {apiConfig ? (
                <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <img src={apiConfig.qrCodeDataUrl} alt="Connection QR Code" className="w-48 h-48" />
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Desktop Server URL</label>
                            <div className="flex items-center gap-2 mt-1">
                            <code className="block w-full bg-white px-4 py-3 rounded-lg border border-gray-300 text-sm font-mono text-gray-800 shadow-sm">
                                {apiConfig.apiUrl}
                            </code>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Enter this exactly into the Mobile App.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile Sync Key</label>
                            <div className="flex items-center gap-2 mt-1">
                            <code className="block w-full bg-white px-4 py-3 rounded-lg border border-gray-300 text-sm font-mono text-gray-800 break-all shadow-sm">
                                {apiConfig.apiKey}
                            </code>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">This key secures the connection between Mobile and Desktop.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Generating secure connection credentials...</p>
                    <p className="text-xs text-gray-400 mt-2">Please ensure the app is running in Desktop mode.</p>
                </div>
            )}
          </div>
        )}

        {/* Cloud Sync Settings (Back Office) */}
        {activeTab === 'sync' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Cloud Back Office</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
                Check the status of your connection to the central web dashboard.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Monitor className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Configure the direct connection to the Cloud Database.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700">MongoDB URI</label>
                  <div className="flex gap-2">
                    <input
                        type="password"
                        name="mongoDbUri"
                        value={businessData.mongoDbUri}
                        onChange={(e) => {
                            handleBusinessDataChange(e);
                        }}
                        className="flex-1 p-3 border rounded-lg bg-white"
                        placeholder="mongodb+srv://..."
                    />
                    <button
                        onClick={() => saveBusinessSetup({ ...businessSetup, ...businessData, isSetup: true } as any)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Save
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Direct connection string for 100% reliable sync.</p>
                </div>

              <div className="flex items-center gap-4 mt-6">
                <button onClick={pushDataToServer} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Full Cloud Synchronization (Overwrite Server)
                </button>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Connection Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                <p className="text-xs text-gray-500">Last successful sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Printer Settings */}
        {activeTab === 'printers' && (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Printer className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-800">Printer Configuration</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Select a default printer to skip the print dialog.
                </p>

                <div className="max-w-xl space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Printer</label>
                        <select
                            value={selectedPrinter}
                            onChange={(e) => setSelectedPrinter(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white"
                        >
                            <option value="">-- Always Ask (Show Print Dialog) --</option>
                            {printers.map((p, idx) => (
                                <option key={idx} value={p.name}>{p.name} {p.isDefault ? '(System Default)' : ''}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            If a printer is selected, receipts will print automatically to it without showing a dialog.
                        </p>
                    </div>

                    <button
                        onClick={handleSavePrinter}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Save Printer Settings
                    </button>
                </div>
            </div>
        )}

        {/* Update Assistance */}
        {activeTab === 'updates' && (
             <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Update Assistance</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Check for the latest version of Whiz POS.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-gray-700">Current Version:</span>
                        <span className="text-gray-900 font-bold">{window.electron ? 'Desktop App' : 'Web Version'}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (window.electron && window.electron.checkForUpdate) {
                                window.electron.checkForUpdate();
                                alert('Checking for updates...');
                            } else {
                                alert('Update check is only available in the Desktop Application.');
                            }
                        }}
                        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Check for Updates
                    </button>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        The application automatically checks for updates in the background every hour.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUser || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <form onSubmit={(e) => { e.preventDefault(); editingUser ? handleUpdateUser() : handleAddUser(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" value={userData.name} onChange={handleUserFormChange} required className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIN</label>
                  <input type="password" name="pin" value={userData.pin} onChange={handleUserFormChange} required maxLength={4} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select name="role" value={userData.role} onChange={handleUserFormChange} className="w-full p-3 border rounded-lg">
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={resetUserForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingUser ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User QR Badge Modal */}
      {showUserQr && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-md">
                         <span className="text-3xl font-bold text-white">{showUserQr.name.charAt(0)}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{showUserQr.name}</h2>
                    <p className="text-white/80 uppercase tracking-wider text-sm">{showUserQr.role}</p>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-100">
                        {qrCodeData ? (
                            <img src={qrCodeData} alt="Login QR" className="w-48 h-48" />
                        ) : (
                            <div className="w-48 h-48 bg-gray-100 animate-pulse rounded"></div>
                        )}
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                        Scan this badge with the Mobile App to log in instantly.
                    </p>

                    <button
                        onClick={() => setShowUserQr(null)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-5 h-5" /> Close Badge
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}
