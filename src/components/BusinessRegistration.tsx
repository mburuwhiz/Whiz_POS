import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, User as UserIcon, Phone, MapPin, ChevronRight, ChevronLeft,
  CheckCircle2, Lock, Printer, CreditCard, LogIn, PartyPopper,
  Network, Server, MonitorSmartphone, Wifi, Globe2, Shield, Clock, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { soundManager } from '../lib/soundUtils';
import setupBg from '../assets/setup_install_bg.png';

const PERSIST_KEY = 'whizpos_outlet_registration';

export default function BusinessRegistration() {
  const { finishSetup } = usePosStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<any[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const [deviceId] = useState<string>(() => {
    const saved = localStorage.getItem(PERSIST_KEY);
    return saved ? JSON.parse(saved).deviceId : crypto.randomUUID();
  });

  const [formData, setFormData] = useState({
    appMode: 'SERVER' as 'SERVER' | 'OUTLET',
    outletName: '',
    serverIp: '',
    apiKey: '',
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    pin: '',
    confirmPin: '',
    servedByLabel: 'Served By',
    mpesaPaybill: '',
    mpesaTill: '',
    mpesaAccountNumber: ''
  });

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Initialize Whiz Point' },
    { id: 'modeSelection', title: 'Network Mode', description: 'Choose your role' },
    ...(formData.appMode === 'OUTLET' ? [
        { id: 'outletConnect', title: 'Connect to Server', description: 'Link to Main Server' },
    ] : [
        { id: 'businessName', title: 'Business Info', description: 'Business identity' },
        { id: 'ownerName', title: 'Owner Name', description: 'Primary admin' },
        { id: 'contact', title: 'Contact Info', description: 'Contact details' },
        { id: 'address', title: 'Location', description: 'Physical location' },
        { id: 'servedBy', title: 'Receipt Labels', description: 'Labels' },
        { id: 'mpesa', title: 'Payments', description: 'M-Pesa' },
    ]),
    { id: 'pin', title: 'Security PIN', description: 'Terminal PIN' },
    { id: 'completion', title: 'Ready', description: 'Finished' }
  ];

  const handleNext = () => {
    soundManager.playClick();
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const startPolling = (serverIp: string, did: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${serverIp}/api/outlets/status/${did}`);
        const data = await res.json();
        if (data.status === 'approved') {
          clearInterval(pollInterval);
          setApprovalStatus('approved');
          handleInputChange('apiKey', data.apiKey);
          const syncRes = await fetch(`${serverIp}/api/sync/full-state`, {
            headers: { 'Authorization': `Bearer ${data.apiKey}` }
          });

          let downloadedBusinessSetup = {};
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            usePosStore.setState({ products: syncData.products || [], users: syncData.users || [], categories: syncData.categories || [] });
            if (syncData.businessSetup) {
                downloadedBusinessSetup = syncData.businessSetup;
            }
          }

          localStorage.removeItem(PERSIST_KEY);

          // Complete outlet setup silently without going to PIN step
          const businessData = {
              ...formData,
              ...downloadedBusinessSetup,
              appMode: 'OUTLET',
              outletName: formData.outletName,
              serverIp: serverIp,
              apiKey: data.apiKey,
              isSetup: true,
              isLoggedIn: false,
              printerType: 'thermal' as const,
              tax: 0,
              subtotal: 0
          };

          await finishSetup(businessData, null);
          setIsFinished(true);
          setCurrentStep(steps.length - 1);
        }
      } catch (e) {}
    }, 3000);
  };

  const handleRequestApproval = async () => {
    if (!formData.outletName || !formData.serverIp) return;
    try {
      const response = await fetch(`${formData.serverIp}/api/outlets/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outletName: formData.outletName, deviceId })
      });
      if (response.ok) {
        setApprovalStatus('pending');
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
          status: 'pending',
          outletName: formData.outletName,
          serverIp: formData.serverIp,
          deviceId
        }));
        startPolling(formData.serverIp, deviceId);
      }
    } catch (e) {
      Swal.fire('Connection Error', 'Server unreachable', 'error');
    }
  };

  const handleSubmit = async () => {
    if (formData.pin.length !== 4 || formData.pin !== formData.confirmPin) {
      Swal.fire({ title: 'Error', text: 'PIN mismatch', icon: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      const businessData = { ...formData, isSetup: true, isLoggedIn: false, printerType: 'thermal' as const, tax: 0, subtotal: 0 };
      const adminUser = { id: crypto.randomUUID(), name: formData.appMode === 'OUTLET' ? 'Outlet Admin' : formData.ownerName, pin: formData.pin, role: 'admin' as const, isActive: true, createdAt: new Date().toISOString() };
      await finishSetup(businessData, adminUser);

      // Print Welcome Receipt (Business Setup) if in Desktop Mode
      if ((window as any).electron && (window as any).electron.printBusinessSetup) {
          (window as any).electron.printBusinessSetup(businessData, adminUser);
      }

      setIsFinished(true);
      setCurrentStep(steps.length - 1);
      Swal.fire({ title: 'Success!', text: 'Setup complete', icon: 'success' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Setup failed', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(PERSIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.status === 'pending') {
        setFormData(prev => ({
          ...prev,
          appMode: 'OUTLET',
          outletName: parsed.outletName,
          serverIp: parsed.serverIp
        }));
        setApprovalStatus('pending');

        const idx = steps.findIndex(s => s.id === 'outletConnect');
        if (idx !== -1) setCurrentStep(idx);

        startPolling(parsed.serverIp, parsed.deviceId);
      }
    }
  }, []);

  useEffect(() => {
    const stepId = steps[currentStep]?.id;
    if (stepId === 'outletConnect' && approvalStatus === 'none' && !isScanning) {
      setIsScanning(true);
      if ((window as any).electron && (window as any).electron.scanMdnsServers) {
        (window as any).electron.scanMdnsServers().then((servers: any) => {
          setFoundServers(servers || []);
          setIsScanning(false);
        }).catch(() => {
          setIsScanning(false);
        });
      } else {
        setIsScanning(false);
      }
    }
  }, [currentStep, approvalStatus]);

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const renderStep = () => {
    const sid = steps[currentStep].id;
    if (sid === 'welcome') return (
      <motion.div key="welcome" variants={stepVariants} initial="enter" animate="center" exit="exit" className="text-center space-y-8">
        <Building2 className="w-20 h-20 text-blue-400 mx-auto" />
        <h1 className="text-4xl font-black text-white">Whiz Point POS</h1>
        <button onClick={handleNext} className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-bold">Begin Setup</button>
      </motion.div>
    );
    if (sid === 'modeSelection') return (
      <motion.div key="mode" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Choose Role</h2>
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => { handleInputChange('appMode', 'SERVER'); handleNext(); }} className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer">
            <Server className="w-10 h-10 text-blue-400 mb-2" />
            <p className="font-bold text-white">Main Server</p>
          </div>
          <div onClick={() => { handleInputChange('appMode', 'OUTLET'); handleNext(); }} className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer">
            <MonitorSmartphone className="w-10 h-10 text-teal-400 mb-2" />
            <p className="font-bold text-white">Outlet Terminal</p>
          </div>
        </div>
        <div className="flex justify-start mt-6">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
        </div>
      </motion.div>
    );
    if (sid === 'outletConnect') return (
      <motion.div key="connect" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Connect to Server</h2>
        {approvalStatus === 'none' ? (
          <div className="space-y-4">
            {foundServers.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3">Discovered Servers</h3>
                <div className="space-y-2">
                  {foundServers.map((server, i) => (
                    <button key={i} onClick={() => handleInputChange('serverIp', server.url)} className="w-full text-left px-4 py-3 bg-white/10 hover:bg-blue-600/50 rounded-lg text-white text-sm transition-colors flex items-center justify-between">
                      <span>{server.name}</span>
                      <span className="opacity-50 text-xs">{server.url}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isScanning && foundServers.length === 0 && (
              <div className="text-center py-4"><p className="text-white/50 text-sm animate-pulse">Scanning for local servers...</p></div>
            )}
            <input type="text" placeholder="Outlet Name" value={formData.outletName} onChange={e => handleInputChange('outletName', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
            <input type="text" placeholder="Server URL (http://ip:3000)" value={formData.serverIp} onChange={e => handleInputChange('serverIp', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white font-mono" />
            <div className="flex justify-between mt-6">
              <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
              <button onClick={handleRequestApproval} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Request Approval</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 space-y-4">
            <Clock className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-white">Pending Server Approval...</h3>
            <p className="text-white/60">Approve this outlet on the Main Server Hub.</p>
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl mt-4">Back</button>
          </div>
        )}
      </motion.div>
    );
    if (sid === 'businessName') return (
      <motion.div key="bn" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Business Name</h2>
        <input type="text" value={formData.businessName} onChange={e => handleInputChange('businessName', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );
    if (sid === 'ownerName') return (
      <motion.div key="on" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Owner Name</h2>
        <input type="text" value={formData.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );
    if (sid === 'contact') return (
      <motion.div key="contact" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Contact Info</h2>
        <input type="text" placeholder="Phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white mb-4" />
        <input type="email" placeholder="Email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );
    if (sid === 'address') return (
      <motion.div key="address" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Location</h2>
        <input type="text" placeholder="Physical Address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );
    if (sid === 'servedBy') return (
      <motion.div key="servedBy" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Receipt Labeling</h2>
        <input type="text" placeholder="Served By Label (e.g. 'Cashier')" value={formData.servedByLabel} onChange={e => handleInputChange('servedByLabel', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );
    if (sid === 'mpesa') return (
      <motion.div key="mpesa" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Payment Options (Optional)</h2>
        <input type="text" placeholder="M-Pesa Paybill" value={formData.mpesaPaybill} onChange={e => handleInputChange('mpesaPaybill', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white mb-4" />
        <input type="text" placeholder="M-Pesa Till Number" value={formData.mpesaTill} onChange={e => handleInputChange('mpesaTill', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white mb-4" />
        <input type="text" placeholder="M-Pesa Account Number" value={formData.mpesaAccountNumber} onChange={e => handleInputChange('mpesaAccountNumber', e.target.value)} className="w-full p-4 bg-white/10 rounded-xl text-white" />
        <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
            <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl">Next</button>
        </div>
      </motion.div>
    );

    if (sid === 'pin') return (
        <motion.div key="pin" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-white">Terminal PIN</h2>
            <input type="password" maxLength={4} value={formData.pin} onChange={e => handleInputChange('pin', e.target.value.replace(/\D/g,''))} className="w-32 p-4 bg-white/10 rounded-xl text-white text-center text-2xl" />
            <input type="password" maxLength={4} value={formData.confirmPin} onChange={e => handleInputChange('confirmPin', e.target.value.replace(/\D/g,''))} className="w-32 p-4 bg-white/10 rounded-xl text-white text-center text-2xl ml-2" />
            <div className="flex justify-between mt-6">
                <button onClick={handleBack} className="bg-white/10 text-white px-8 py-3 rounded-xl">Back</button>
                <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Finish Setup</button>
            </div>
        </motion.div>
    );
    if (sid === 'completion') return (
        <motion.div key="comp" variants={stepVariants} initial="enter" animate="center" exit="exit" className="text-center space-y-4">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
            <h2 className="text-3xl font-bold text-white">Ready!</h2>
            <button onClick={() => window.location.reload()} className="bg-white text-blue-900 px-10 py-4 rounded-xl font-bold">Launch POS</button>
        </motion.div>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </div>
  );
}
