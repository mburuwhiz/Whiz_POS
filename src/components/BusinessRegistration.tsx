import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Settings, Download, CheckCircle2,
  ChevronRight, ChevronLeft, Terminal,
  Package, Zap, Database, Building2, User, Lock,
  ExternalLink, Sparkles, Cpu, Globe, Server
} from 'lucide-react';
import { soundManager } from '../lib/soundUtils';
import setupBg from '../assets/setup_install_bg.png';
import logo from '../assets/logo.png';
import packageJson from '../../package.json';

const VERSION = `v${packageJson.version}`;

const EULA_TEXT = `
# End User License Agreement (EULA)

This End User License Agreement is a binding legal agreement between **Whizpoint Solutions** and you (the User) for the software product **Whiz POS**.

### 1. License Grant
Whizpoint Solutions grants you a non-exclusive, non-transferable license to use the Whiz POS Desktop, Back Office Dashboard, and Mobile App for your business operations. This license is for your internal use only. You may not sub-license, rent, or lease this software to third parties.

### 2. Intellectual Property
The software, including its source code, design, and architecture, is the sole property of Whizpoint Solutions. You agree not to reverse engineer, decompile, or attempt to derive the source code of any component within the ecosystem.

### 3. Data & Privacy
Whiz POS is an offline-first system. You are responsible for the security of your local hardware and MongoDB instances. Whizpoint Solutions is not liable for data loss caused by hardware failure, improper backup routines, or unauthorized local access.

### 4. Updates & Maintenance
We provide periodic updates to improve functionality. The software is provided "as is" without any express or implied warranties regarding its fitness for a particular purpose.

### 5. Payment & Subscription
Your right to use the Sync API and Back Office features is subject to your specific payment plan. Failure to maintain an active subscription may result in the suspension of cloud-based services and dashboard access.

### 6. Limitation of Liability
In no event shall Whizpoint Solutions be liable for any financial loss, business interruptions, or data corruption arising from the use of this software. You are responsible for ensuring that receipt formatting and tax calculations comply with your local regulations.

### 7. Termination
This license is effective until terminated. We reserve the right to terminate your access if you violate these terms. Upon termination, you must cease all use of the software and delete all copies.

---

**Contact Support**
📞 Phone: 0740-841-168
📧 Email: whiz.techke@gmail.com
🏢 Made with ❤️ by Whizpoint Solutions
`;

type SetupStep = 'welcome' | 'license' | 'config' | 'install' | 'complete';

export default function BusinessRegistration() {
  const [step, setStep] = useState<SetupStep>('welcome');
  const [progress, setProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('Initializing installation core...');
  const { finishSetup } = usePosStore();

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    pin: '',
    confirmPin: ''
  });

  const handleNext = () => {
    soundManager.playClick();
    if (step === 'welcome') setStep('license');
    else if (step === 'license') setStep('config');
    else if (step === 'config') {
      if (!formData.businessName || !formData.ownerName || formData.pin.length !== 4) {
        soundManager.playError();
        return;
      }
      if (formData.pin !== formData.confirmPin) {
        soundManager.playError();
        alert("PINs do not match!");
        return;
      }
      startInstallation();
    }
  };

  const handleBack = () => {
    soundManager.playClick();
    if (step === 'license') setStep('welcome');
    else if (step === 'config') setStep('license');
  };

  const startInstallation = () => {
    setStep('install');
    soundManager.playPop();
  };

  useEffect(() => {
    if (step === 'install') {
      const duration = 5000;
      const interval = 50;
      const stepSize = 100 / (duration / interval);

      const statusMessages = [
        'Unpacking core modules...',
        'Linking React components...',
        'Building state management (Zustand)...',
        'Initializing local database engine...',
        'Syncing UI assets with Vite...',
        'Generating administrative credentials...',
        'Finalizing secure environment...',
        'Optimizing build artifacts...'
      ];

      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            completeSetup();
            return 100;
          }

          const nextProgress = prev + stepSize;
          const statusIdx = Math.floor((nextProgress / 100) * statusMessages.length);
          setInstallStatus(statusMessages[Math.min(statusIdx, statusMessages.length - 1)]);

          return nextProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [step]);

  const completeSetup = async () => {
    const businessData = {
      businessName: formData.businessName,
      address: formData.address || 'Default Address',
      phone: formData.phone || '0740-841-168',
      email: formData.email || 'support@whizpos.com',
      servedByLabel: 'Cashier',
      mpesaPaybill: '',
      mpesaTill: '',
      mpesaAccountNumber: '',
      tax: 16,
      subtotal: 0,
      isSetup: true,
      isLoggedIn: false,
      printerType: 'thermal' as const,
    };

    const adminUser = {
      id: `USR${Date.now()}`,
      name: formData.ownerName,
      pin: formData.pin,
      role: 'admin' as const,
    };

    try {
      await finishSetup(businessData, adminUser);
      soundManager.playSuccess();
      setStep('complete');
    } catch (error) {
      console.error('Setup failed:', error);
      soundManager.playError();
      setInstallStatus('System error during deployment. Please contact support.');
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, scale: 1.05, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen w-full bg-[#030305] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div
          className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150 contrast-150"
          style={{ mixBlendMode: 'overlay' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030305]/50 to-[#030305]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10 w-full max-w-5xl px-6"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden flex flex-col min-h-[640px]">

            {/* Elegant Header */}
            <header className="p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-3 bg-black rounded-2xl border border-white/10">
                    <img src={logo} alt="Whiz POS" className="w-8 h-8 object-contain" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    WHIZ POS <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] uppercase font-mono border border-blue-500/20">System Setup</span>
                  </h2>
                  <p className="text-xs text-white/40 font-mono tracking-widest mt-0.5 uppercase">Professional Edition • {VERSION}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-white/30 text-[10px] font-mono tracking-tighter uppercase">
                 <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span>Global Ready</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Server className="w-3 h-3" />
                    <span>MongoDB Engine</span>
                 </div>
              </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
              {step === 'welcome' && (
                <div className="flex-1 flex p-12 gap-16">
                  <div className="flex-1 flex flex-col justify-center">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Next-Gen Infrastructure
                      </div>
                      <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                        Experience the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Future of Retail.</span>
                      </h1>
                      <p className="text-white/50 text-xl leading-relaxed max-w-lg">
                        You're moments away from deploying Whiz POS—the ultimate tool for modern business orchestration. Fast, secure, and beautiful.
                      </p>
                      <div className="pt-8 flex items-center gap-4">
                         <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="User" />
                              </div>
                            ))}
                         </div>
                         <p className="text-xs text-white/40">Trusted by over <span className="text-white font-bold">500+</span> businesses worldwide.</p>
                      </div>
                    </motion.div>
                  </div>
                  <div className="w-80 flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-square flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-[3rem] blur-3xl animate-pulse" />
                      <div className="relative w-48 h-48 bg-white/[0.02] border border-white/10 rounded-[3rem] flex items-center justify-center shadow-2xl overflow-hidden group">
                         <Package className="w-24 h-24 text-white group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
                      </div>
                      {/* Floating Tech Badges */}
                      <div className="absolute top-0 right-0 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl -rotate-12">
                         <Cpu className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="absolute bottom-8 left-0 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl rotate-12">
                         <Database className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'license' && (
                <div className="flex-1 flex flex-col p-12">
                   <div className="flex items-center gap-4 mb-8">
                     <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black">Legal Agreement</h2>
                        <p className="text-white/40 text-sm">Review our terms of service and license agreement.</p>
                     </div>
                   </div>
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-8 overflow-y-auto font-mono text-xs leading-relaxed text-white/50 custom-scrollbar mb-8 selection:bg-blue-500/30">
                      {EULA_TEXT.split('\n').map((line, i) => (
                        <div key={i} className={`mb-1 ${line.startsWith('#') ? 'text-blue-400 font-bold text-sm mt-4 mb-2' : ''}`}>
                          {line}
                        </div>
                      ))}
                   </div>
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <p className="text-xs text-white/60 uppercase tracking-widest font-bold">BY CONTINUING, YOU AGREE TO ALL TERMS LISTED ABOVE.</p>
                   </div>
                </div>
              )}

              {step === 'config' && (
                <div className="flex-1 flex p-12 gap-12">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                          <Settings className="w-8 h-8 text-cyan-400" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black">Configuration</h2>
                          <p className="text-white/40 text-sm">Personalize your deployment environment.</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Business Name</label>
                           <div className="relative group">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                              <input
                                type="text"
                                placeholder="e.g. Whizpoint Cafe"
                                value={formData.businessName}
                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Administrator Name</label>
                           <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                              <input
                                type="text"
                                placeholder="e.g. Alex Johnson"
                                value={formData.ownerName}
                                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.06] transition-all"
                              />
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Contact Email</label>
                           <input
                             type="email"
                             placeholder="admin@whizpos.com"
                             value={formData.email}
                             onChange={(e) => setFormData({...formData, email: e.target.value})}
                             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Business Address</label>
                           <input
                             type="text"
                             placeholder="Nairobi, Kenya"
                             value={formData.address}
                             onChange={(e) => setFormData({...formData, address: e.target.value})}
                             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                           />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-80 flex flex-col justify-center">
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 space-y-6">
                       <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                             <Lock className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="font-bold">System PIN</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">Master Access Key</p>
                       </div>
                       <div className="space-y-4">
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="SET 4-DIGIT PIN"
                            value={formData.pin}
                            onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-2xl tracking-[0.6em] focus:border-blue-500 focus:bg-black/60 transition-all placeholder:text-[10px] placeholder:tracking-widest"
                          />
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="CONFIRM PIN"
                            value={formData.confirmPin}
                            onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-2xl tracking-[0.6em] focus:border-blue-500 focus:bg-black/60 transition-all placeholder:text-[10px] placeholder:tracking-widest"
                          />
                       </div>
                       <p className="text-[9px] text-center text-white/30 italic">This PIN will be used for all administrative logins.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 'install' && (
                <div className="flex-1 flex p-16 gap-16">
                   <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="relative">
                           <Download className="w-10 h-10 text-blue-400 animate-bounce" />
                           <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#030305]" />
                        </div>
                        <h2 className="text-4xl font-black">Deploying System...</h2>
                      </div>

                      <div className="space-y-12">
                         <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase">
                               <span className="text-blue-400 animate-pulse">{installStatus}</span>
                               <span className="text-white/60">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full border border-white/10 p-1">
                               <motion.div
                                 className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progress}%` }}
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            {[
                              { label: 'File Extraction', icon: Package, color: 'text-blue-400' },
                              { label: 'Database Setup', icon: Database, color: 'text-emerald-400' },
                              { label: 'UI Optimization', icon: Zap, color: 'text-yellow-400' },
                              { label: 'Security Patching', icon: ShieldCheck, color: 'text-purple-400' }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                 <item.icon className={`w-5 h-5 ${item.color}`} />
                                 <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{item.label}</span>
                                 <CheckCircle2 className={`w-4 h-4 ml-auto ${progress > (idx+1)*25 ? 'text-emerald-500' : 'text-white/10'}`} />
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="w-80 flex flex-col justify-center">
                      <div className="p-6 bg-black/40 border border-white/10 rounded-[2rem] font-mono text-[10px] text-white/30 space-y-2">
                         <p className="text-blue-400">&gt; whiz-pos@6.0.2 install /app</p>
                         <p className="text-emerald-400">&gt; node ./scripts/init-db.js</p>
                         <p className="text-white/20">Extracting: app.asar (84.2MB)</p>
                         <p className="text-white/20">Linking: libsystem_pos.dylib</p>
                         <p className="text-white/20">Configuring: .env.production</p>
                         <p className="animate-pulse underline decoration-blue-500/50">Processing cluster shards...</p>
                      </div>
                   </div>
                </div>
              )}

              {step === 'complete' && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className="relative mb-12"
                   >
                      <div className="absolute -inset-8 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                      <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-white/20">
                         <CheckCircle2 className="w-16 h-16 text-white" />
                      </div>
                   </motion.div>
                   <h1 className="text-6xl font-black mb-4 tracking-tight">Deployment Complete</h1>
                   <p className="text-white/50 text-xl max-w-xl leading-relaxed mb-12">
                     Whiz POS has been successfully deployed to your workstation. You are now ready to revolutionize your business.
                   </p>

                   <div className="flex items-center gap-8 text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Integrity Verified</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Ready to Launch</span>
                   </div>
                </div>
              )}
            </main>

            {/* Futuristic Footer */}
            <footer className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 text-white/20">
                   <ExternalLink className="w-4 h-4" />
                   <span className="text-[10px] font-mono tracking-widest uppercase">whizpointsolutions.com</span>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                   Server Sync Active
                </div>
              </div>

              <div className="flex items-center gap-4">
                {step !== 'install' && step !== 'complete' && (
                  <>
                    <button
                      onClick={() => { if(confirm('Abort deployment?')) window.close(); }}
                      className="px-8 py-3 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    {step !== 'welcome' && (
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-3 px-12 py-3 rounded-xl text-xs font-black bg-white text-black hover:bg-blue-50 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
                    >
                      <span className="uppercase tracking-widest">{step === 'license' ? 'Accept & Continue' : step === 'config' ? 'Deploy Now' : 'Begin Setup'}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
                {step === 'complete' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-3 px-16 py-4 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] group"
                  >
                    <span className="uppercase tracking-widest">Launch Environment</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </footer>
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
