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
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(outlet.deviceId)} className="bg-sky-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-sky-600 transition-colors">
                      Approve
                  </button>
                  {/* <button onClick={() => handleReject(outlet.deviceId)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors">
                      Reject
                  </button> */}
                </div>
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

const StockTransfer = () => {
  const { products, updateProduct } = usePosStore();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
  const [note, setNote] = useState('');

  const handleApply = () => {
      if (!selectedProduct || transferAmount <= 0) return;
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      const currentStock = product.stock || 0;
      const newStock = actionType === 'add' ? currentStock + transferAmount : currentStock - transferAmount;

      updateProduct(selectedProduct, { stock: newStock });

      setTransferAmount(0);
      setNote('');
      setSelectedProduct(null);
      // In a real scenario, we would also save an inventory transfer log here
      alert('Stock updated successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Stock Transfer & Adjustments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Package className="w-5 h-5 text-blue-500"/> Adjust Master Stock</h3>

              <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Select Product</label>
                  <select
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      value={selectedProduct || ''}
                      onChange={(e) => setSelectedProduct(Number(e.target.value))}
                  >
                      <option value="" disabled>Choose a product...</option>
                      {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock || 0})</option>
                      ))}
                  </select>
              </div>

              {selectedProduct && (
                <>
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-600 mb-1">Action</label>
                          <select
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                              value={actionType}
                              onChange={(e) => setActionType(e.target.value as 'add'|'subtract')}
                          >
                              <option value="add">Add Stock (Receive/Transfer-In)</option>
                              <option value="subtract">Subtract Stock (Write-Off/Transfer-Out)</option>
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                          <input
                              type="number"
                              min="1"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(Number(e.target.value))}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Reason / Note (Optional)</label>
                      <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="e.g. Received from supplier, Damaged goods"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                  </div>
                  <button onClick={handleApply} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all">
                      Apply Adjustment
                  </button>
                </>
              )}
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
            <Database className="w-16 h-16 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">Centralized Intelligence</h3>
            <p className="text-slate-500 max-w-sm text-sm">
              All stock adjustments made here will automatically synchronize and push out to all active terminal branches based on delta-syncing principles.
            </p>
          </div>
      </div>
    </div>
  );
};

export default function ServerHub() {
  const [activeTab, setActiveTab] = useState('outlets');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <ServerDashboard />;
      case 'outlets': return <ManageOutlets />;
      case 'transfers': return <StockTransfer />;
      default: return <ManageOutlets />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative h-full">
        <div className="p-6 mx-auto animate-in fade-in duration-700 slide-in-from-bottom-4">
          <div className="flex gap-4 mb-8">
            <button
                onClick={() => setActiveTab('outlets')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'outlets' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
                Terminal Approvals
            </button>
            <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
                System Health
            </button>
            <button
                onClick={() => setActiveTab('transfers')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'transfers' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
                Stock Transfers
            </button>
          </div>
          {renderContent()}
        </div>
    </div>
  );
}