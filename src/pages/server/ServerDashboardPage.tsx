import React, { useMemo } from 'react';
import { usePosStore } from '../../store/posStore';
import {
  LayoutDashboard,
  Monitor,
  Package,
  Users,
  BarChart3,
  History,
  ShieldCheck,
  Settings,
  ChevronRight,
  Zap,
  Activity,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServerDashboardPage = () => {
  const { transactions, approvedOutlets, products, setCurrentPage } = usePosStore();

  const metrics = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const todayTx = transactions.filter(t => t.timestamp.startsWith(today));
    const revenue = todayTx.reduce((sum, t) => sum + t.total, 0);

    return [
      {
        title: "Today's Revenue",
        value: `KES ${revenue.toLocaleString()}`,
        icon: <Zap className="w-5 h-5" />,
        color: "text-blue-600",
        bg: "bg-blue-50"
      },
      {
        title: "Active Outlets",
        value: approvedOutlets.length,
        icon: <Monitor className="w-5 h-5" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
      },
      {
        title: "Total Products",
        value: products.length,
        icon: <Package className="w-5 h-5" />,
        color: "text-violet-600",
        bg: "bg-violet-50"
      },
      {
        title: "Pending Syncs",
        value: approvedOutlets.reduce((sum, o) => sum + (o.pendingSales || 0), 0),
        icon: <Activity className="w-5 h-5" />,
        color: "text-amber-600",
        bg: "bg-amber-50"
      }
    ];
  }, [transactions, approvedOutlets, products]);

  const quickLinks = [
    { label: "Manage Outlets", icon: <Monitor />, page: "outlets", description: "Approve and monitor terminals" },
    { label: "Global Inventory", icon: <Package />, page: "inventory", description: "Master catalog management" },
    { label: "Staff & PINs", icon: <Users />, page: "users", description: "Central access control" },
    { label: "Analytics", icon: <BarChart3 />, page: "reports", description: "Business intelligence" },
    { label: "Audit Trail", icon: <History />, page: "reports", description: "View change history" },
    { label: "System Policy", icon: <ShieldCheck />, page: "settings", description: "Global feature toggles" },
    { label: "Backup Vault", icon: <Database />, page: "settings", description: "Verify automated backups" },
    { label: "Global Settings", icon: <Settings />, page: "settings", description: "Configuration & Branding" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Server Hub</h1>
              <p className="text-slate-500 font-medium">Global Management & Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-2xl border border-blue-200 text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                SERVER MODE ACTIVE
             </div>
          </div>
        </header>

        {/* Global Pulse Card */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-blue-500/20" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-white tracking-tight">Global Network Pulse</h2>
                  <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                    Your multi-outlet network is <span className="text-emerald-400 font-bold">fully operational</span>.
                    {approvedOutlets.length} terminals are currently reporting data to this vault.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                    {metrics.map((metric, idx) => (
                        <div key={idx} className="space-y-2">
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{metric.title}</p>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                                    {metric.icon}
                                </div>
                                <span className="text-2xl font-black text-white">{metric.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* Action Hub */}
        <section className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 ml-2 tracking-tight">Command Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.map((link, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentPage(link.page as any)}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left flex flex-col group"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                            <div className="text-slate-400 group-hover:text-blue-600 transition-colors scale-125">
                                {link.icon}
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{link.label}</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{link.description}</p>
                        </div>
                        <div className="mt-6 flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Open Hub</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </section>

        {/* Real-time Health Monitor */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-slate-900" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Terminals Status</h3>
                </div>
                <button
                    onClick={() => setCurrentPage('outlets')}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    Detailed Health View
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            <div className="p-8">
                {approvedOutlets.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                        <p className="text-slate-400 font-bold">No terminals connected yet.</p>
                        <p className="text-xs text-slate-300">Go to Manage Outlets to approve registration requests.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedOutlets.slice(0, 3).map((outlet, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className={`w-3 h-3 rounded-full ${new Date(outlet.lastSeenAt || 0).getTime() > Date.now() - 60000 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{outlet.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{outlet.ip}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-blue-600">{outlet.pendingSales || 0} Pending</p>
                                    <p className="text-[10px] text-slate-400">Synced {outlet.lastSyncAt ? new Date(outlet.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};

export default ServerDashboardPage;
