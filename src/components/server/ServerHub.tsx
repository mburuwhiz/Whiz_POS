import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Package, BarChart3, Settings, Monitor, Database, History, Clock, Trash2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import InventoryManagement from '../InventoryManagement';
import ReportsPage from '../ReportsPage';
import SettingsPage from '../SettingsPage';
import UsersPage from '../../pages/UsersPage';

const ServerDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800">Server Hub Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">Active Outlets</h3>
        <p className="text-4xl font-black text-slate-900 mt-2">0</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">Total Daily Sales</h3>
        <p className="text-4xl font-black text-emerald-600 mt-2">KES 0.00</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">System Health</h3>
        <div className="flex items-center gap-2 mt-2 text-emerald-500 font-bold">
           <CheckCircle2 className="w-5 h-5" /> Online
        </div>
      </div>
    </div>
  </div>
);

const ManageOutlets = () => {
  const [outlets, setOutlets] = useState<{ approved: any[], pending: any[] }>({ approved: [], pending: [] });

  const fetchOutlets = async () => {
    if (window.electron && (window.electron as any).getConnectedDevices) {
      const data = await (window.electron as any).getConnectedDevices();
      setOutlets(data || { approved: [], pending: [] });
    }
  };

  useEffect(() => {
    fetchOutlets();
    const interval = setInterval(fetchOutlets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (deviceId: string) => {
    if (window.electron && (window.electron as any).approveOutlet) {
      await (window.electron as any).approveOutlet(deviceId);
      fetchOutlets();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Manage Outlets</h2>

      {/* Pending Section */}
      {outlets.pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-amber-100/50 text-amber-900 font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Pending Requests
            </div>
            <div className="divide-y divide-amber-100">
            {outlets.pending.map((outlet) => (
                <div key={outlet.deviceId} className="p-4 flex items-center justify-between bg-white/50">
                <div>
                    <p className="font-bold text-slate-900">{outlet.outletName}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">IP: {outlet.ip} • REQ: {new Date(outlet.requestedAt).toLocaleTimeString()}</p>
                </div>
                <button
                    onClick={() => handleApprove(outlet.deviceId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    APPROVE TERMINAL
                </button>
                </div>
            ))}
            </div>
          </div>
      )}

      {/* Active Section */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b text-slate-700 font-bold uppercase tracking-widest text-xs">Connected Terminals</div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b">
                <tr>
                <th className="px-6 py-4">Outlet Name</th>
                <th className="px-6 py-4">Connection</th>
                <th className="px-6 py-4">Last Sync</th>
                <th className="px-6 py-4">Pending Sales</th>
                <th className="px-6 py-4">Shift ID</th>
                <th className="px-6 py-4 text-right">Last Backup</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {outlets.approved.length > 0 ? outlets.approved.map((outlet) => (
                <tr key={outlet.deviceId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{outlet.outletName}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{outlet.lastSync || "Just now"}</td>
                    <td className="px-6 py-4">
                        <span className={`font-bold \${(outlet.pendingSales || 0) > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {outlet.pendingSales || 0}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{outlet.shiftId || "SHIFT-001"}</td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                        {outlet.lastBackup || "2 hrs ago"}
                    </td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No approved outlets found</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default function ServerHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout, currentCashier } = usePosStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'outlets', label: 'Manage Outlets', icon: Monitor },
    { id: 'inventory', label: 'Global Inventory', icon: Package },
    { id: 'Staff & PINs', label: 'Staff & PINs', icon: Users },
    { id: 'Sales Reports', label: 'Sales Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <ServerDashboard />;
      case 'outlets': return <ManageOutlets />;
      case 'inventory': return <InventoryManagement />;
      case 'Staff & PINs': return <UsersPage />;
      case 'Sales Reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <ServerDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">SERVER <span className="text-blue-400">HUB</span></h1>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">Whiz Point POS</p>
              </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold \${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 \${activeTab === item.id ? 'text-white' : 'text-blue-400/50'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-4 px-2 mb-6">
             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 font-black border border-white/10 shadow-inner">
               {currentCashier?.name?.charAt(0) || "A"}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-white truncate">{currentCashier?.name || "Administrator"}</p>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{currentCashier?.role || "Owner"}</p>
             </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-widest border border-red-400/20"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-700 slide-in-from-bottom-4">
          {renderContent()}
        </div>

        {/* Footer info */}
        <div className="absolute bottom-6 right-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Handshake Security Active • support@whizpoint.app
        </div>
      </div>
    </div>
  );
}
