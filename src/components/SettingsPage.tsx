import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
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
  Smartphone,
  Building,
  Phone,
  Mail,
  Receipt
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
    processSyncQueue
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'business' | 'users' | 'mobile'>('business');
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

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
    mpesaAccountNumber: ''
  });

  const [userData, setUserData] = useState({
    name: '',
    pin: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier'
  });

  const [apiConfig, setApiConfig] = useState<{ apiUrl: string, apiKey: string, qrCodeDataUrl: string } | null>(null);

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
        mpesaAccountNumber: businessSetup.mpesaAccountNumber || ''
      });
    }
  }, [businessSetup]);

  useEffect(() => {
      if(activeTab === 'mobile' && window.electron) {
          window.electron.getApiConfig().then(setApiConfig);
      }
  }, [activeTab]);

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
              <p className="text-gray-600">Manage your business and user settings</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors ${
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
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Users
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'mobile'
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Database className="w-5 h-5 mr-2" />
              Cloud Sync
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
                        <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 mr-4"><Edit className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cloud Sync Settings */}
        {activeTab === 'mobile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cloud Sync Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">API URL</label>
                <input type="text" name="apiUrl" value={businessData.apiUrl} onChange={handleBusinessDataChange} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input type="password" name="apiKey" value={businessData.apiKey} onChange={handleBusinessDataChange} className="w-full p-3 border rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleSaveBusiness} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </button>
                <button onClick={processSyncQueue} className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Sync Now
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}</p>
                <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>{isOnline ? 'Online' : 'Offline'}</p>
              </div>
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
    </div>
  );
}
