import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/posStore';
import {
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Activity,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Database,
  Smartphone
} from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import Swal from 'sweetalert2';

const ManageOutletsPage = () => {
  const {
    pendingOutlets,
    approvedOutlets,
    loadOutlets,
    approveOutlet,
    isOnline
  } = usePosStore();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOutlets();
    const interval = setInterval(loadOutlets, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOutlets();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleApprove = async (outletId: string, name: string) => {
    const result = await Swal.fire({
      title: 'Approve Outlet?',
      text: `Are you sure you want to approve "${name}" to connect to this server?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve'
    });

    if (result.isConfirmed) {
      await approveOutlet(outletId);
      toast("Outlet Approved", "success");
    }
  };

  const handleReject = async (outletId: string, name: string) => {
      // For now rejection just removes from pending
      // Implementation can be added to electron.cjs if needed
      toast("Rejection feature coming soon", "info");
  };

  const filteredApproved = approvedOutlets.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.ip.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Outlet Management</h1>
              <p className="text-slate-500 font-medium">Control and monitor your terminal network</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-95"
             >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
             </button>
             <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                SERVER ACTIVE
             </div>
          </div>
        </header>

        {/* Pending Requests Section */}
        {pendingOutlets.length > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-500" />
                        PENDING APPROVALS ({pendingOutlets.length})
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOutlets.map((request) => (
                        <div key={request.id} className="bg-white p-6 rounded-[2rem] border-2 border-amber-200 shadow-lg shadow-amber-100/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Smartphone className="w-20 h-20" />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                                    <Monitor className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900">{request.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{request.ip}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-xs text-slate-400 font-bold gap-2">
                                    <Clock className="w-3 h-3" />
                                    REQUESTED {new Date(request.requestedAt).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(request.id, request.name)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    APPROVE
                                </button>
                                <button
                                    onClick={() => handleReject(request.id, request.name)}
                                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search approved terminals by name or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700"
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    <Filter className="w-4 h-4" />
                    STATUS
                </button>
            </div>
        </div>

        {/* Approved Terminals Grid */}
        <section className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 ml-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                CONNECTED TERMINALS ({approvedOutlets.length})
            </h2>

            {approvedOutlets.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <WifiOff className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-400">No Terminals Connected</h3>
                        <p className="text-slate-400 max-w-xs mx-auto text-sm">
                            Approved outlets will appear here with real-time status and health metrics.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApproved.map((outlet) => (
                        <div key={outlet.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <Monitor className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <div className={`flex items-center gap-2 ${new Date(outlet.lastSeenAt || 0).getTime() > Date.now() - 60000 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                                        <span className={`w-2 h-2 ${new Date(outlet.lastSeenAt || 0).getTime() > Date.now() - 60000 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'} rounded-full`} />
                                        {new Date(outlet.lastSeenAt || 0).getTime() > Date.now() - 60000 ? 'ONLINE' : 'OFFLINE'}
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-black text-slate-900">{outlet.name}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{outlet.ip}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Sync</p>
                                        <p className="text-sm font-bold text-slate-700">{outlet.lastSyncAt ? new Date(outlet.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Pending Sales</p>
                                        <p className={`text-sm font-bold ${outlet.pendingSales > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{outlet.pendingSales || 0}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                        <Activity className="w-4 h-4" />
                                        VIEW HEALTH
                                    </button>
                                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                        <MoreVertical className="w-5 h-5 text-slate-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Visual Progress/Health Bar */}
                            <div className="h-2 bg-slate-50 w-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[100%]" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* Global Network Stats */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <p className="text-blue-400 font-black text-xs uppercase tracking-widest">Network Status</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{approvedOutlets.length}</span>
                        <span className="text-slate-400 font-bold uppercase text-xs">Active Terminals</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Data Integrity</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">100%</span>
                        <span className="text-slate-400 font-bold uppercase text-xs">Synced</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-violet-400 font-black text-xs uppercase tracking-widest">Global Vault</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">
                            {approvedOutlets.length > 0 ? 'ACTIVE' : 'IDLE'}
                        </span>
                        <span className="text-slate-400 font-bold uppercase text-xs">Backups Enabled</span>
                    </div>
                </div>
             </div>
        </section>
      </div>
    </div>
  );
};

export default ManageOutletsPage;
