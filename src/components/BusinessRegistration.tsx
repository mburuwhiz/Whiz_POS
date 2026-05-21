import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User as UserIcon,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Printer,
  CreditCard,
  LogIn,
  PartyPopper,
  Network,
  Server,
  MonitorSmartphone,
  Wifi,
  Globe2,
  Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import { soundManager } from '../lib/soundUtils';
import setupBg from '../assets/setup_install_bg.png';

export default function BusinessRegistration() {
  const { finishSetup } = usePosStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<any[]>([]);
  const [handshakeStatus, setHandshakeStatus] = useState<'idle' | 'scanning' | 'handshaking' | 'pending' | 'approved' | 'rejected'>('idle');

  const [formData, setFormData] = useState({
    appMode: 'SERVER' as 'SERVER' | 'OUTLET',
    outletName: '',
    serverIp: '',
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

  useEffect(() => {
    // SoundManager is initialized automatically when a sound is played
  }, []);

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Initialize your Whiz POS system' },
    { id: 'modeSelection', title: 'Network Mode', description: 'Choose your terminal role' },
    // Outlet Steps
    ...(formData.appMode === 'OUTLET' ? [
        { id: 'outletConnect', title: 'Connect to Server', description: 'Link to your Main Server' },
    ] : [
    // Server Steps
        { id: 'businessName', title: 'Business Info', description: 'Your business identity' },
        { id: 'ownerName', title: 'Owner Name', description: 'Primary administrator' },
        { id: 'contact', title: 'Contact Info', description: 'Customer touchpoints' },
        { id: 'address', title: 'Location', description: 'Physical presence' },
        { id: 'servedBy', title: 'Receipt Labels', description: 'Customize your receipts' },
        { id: 'mpesa', title: 'Payments', description: 'Mobile money integration' },
    ]),
    { id: 'pin', title: 'Security PIN', description: 'Protect your terminal' },
    { id: 'completion', title: 'Ready', description: 'Setup finished' }
  ];

  const handleNext = () => {
    soundManager.playClick();

    // Custom logic for outlet connection step
    if (steps[currentStep].id === 'outletConnect') {
        if (!formData.serverIp || !formData.outletName) {
            Swal.fire('Error', 'Please enter terminal name and select a server.', 'error');
            return;
        }
        performHandshake();
        return;
    }

    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const performHandshake = async () => {
      setHandshakeStatus('handshaking');
      const outletId = crypto.randomUUID();

      try {
          const response = await fetch(`${formData.serverIp}/api/handshake`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  outletName: formData.outletName,
                  outletId: outletId,
                  ip: 'auto'
              })
          });

          if (response.ok) {
              setHandshakeStatus('pending');
              // Start polling for approval
              pollForApproval(outletId);
          } else {
              setHandshakeStatus('idle');
              Swal.fire('Connection Failed', 'Could not reach the server. Please check your network.', 'error');
          }
      } catch (e) {
          setHandshakeStatus('idle');
          Swal.fire('Error', 'An error occurred while connecting to the server.', 'error');
      }
  };

  const pollForApproval = async (outletId: string) => {
      const interval = setInterval(async () => {
          try {
              const res = await fetch(`${formData.serverIp}/api/handshake/status/${outletId}`);
              const data = await res.json();

              if (data.status === 'approved') {
                  clearInterval(interval);
                  setHandshakeStatus('approved');

                  // Update formData with received config
                  setFormData(prev => ({
                      ...prev,
                      apiKey: data.apiKey,
                      businessName: data.businessSetup?.businessName || prev.businessName,
                      address: data.businessSetup?.address || prev.address,
                      phone: data.businessSetup?.phone || prev.phone,
                      email: data.businessSetup?.email || prev.email,
                      mpesaPaybill: data.businessSetup?.mpesaPaybill || prev.mpesaPaybill,
                      mpesaTill: data.businessSetup?.mpesaTill || prev.mpesaTill,
                      mpesaAccountNumber: data.businessSetup?.mpesaAccountNumber || prev.mpesaAccountNumber,
                      servedByLabel: data.businessSetup?.servedByLabel || prev.servedByLabel,
                  }));

                  // Automatically move to the next step (PIN)
                  setCurrentStep(prev => prev + 1);
                  Swal.fire('Approved!', 'The server has approved your connection.', 'success');
              } else if (data.status === 'rejected') {
                  clearInterval(interval);
                  setHandshakeStatus('rejected');
                  Swal.fire('Rejected', 'The server rejected your connection request.', 'error');
              }
          } catch (e) {
              console.error('Polling error:', e);
          }
      }, 3000);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.pin.length !== 4 || formData.pin !== formData.confirmPin) {
      Swal.fire({
        title: 'Error',
        text: 'PIN must be exactly 4 digits and match the confirmation PIN.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const businessData = {
        appMode: formData.appMode,
        outletId: formData.appMode === 'OUTLET' ? crypto.randomUUID() : 'SERVER',
        outletName: formData.appMode === 'OUTLET' ? formData.outletName : 'Server Hub',
        serverIp: formData.serverIp,
        businessName: formData.businessName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        isSetup: true,
        isLoggedIn: false,
        servedByLabel: formData.servedByLabel,
        mpesaPaybill: formData.mpesaPaybill,
        mpesaTill: formData.mpesaTill,
        mpesaAccountNumber: formData.mpesaAccountNumber,
        tax: 0,
        subtotal: 0,
        printerType: 'thermal' as const
      };

      const adminUser = {
        id: crypto.randomUUID(),
        name: formData.appMode === 'OUTLET' ? 'Outlet Admin' : formData.ownerName,
        pin: formData.pin,
        role: 'admin' as const,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await finishSetup(businessData, adminUser);

      setIsFinished(true);
      setCurrentStep(steps.length - 1);

      Swal.fire({
        title: 'Success!',
        text: 'Setup completed successfully.',
        icon: 'success',
        confirmButtonColor: '#0ea5e9'
      });
    } catch (error) {
      console.error('Setup failed:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to complete setup.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50, scale: 0.95 },
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3 } }
  };

  const renderStep = () => {
    const currentStepId = steps[currentStep].id;

    switch (currentStepId) {
      case 'welcome':
        return (
          <motion.div key="welcome" variants={stepVariants} initial="enter" animate="center" exit="exit" className="text-center space-y-8">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)]">
              <Building2 className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white leading-tight">
              Welcome to Whiz POS
            </h1>
            <p className="text-xl text-blue-200/80 font-medium max-w-md mx-auto">
              The modern, decentralized point-of-sale network. Let's get your terminal configured.
            </p>
            <div className="flex flex-col items-center space-y-4 mt-10">
                <button
                onClick={handleNext}
                className="bg-white hover:bg-blue-50 text-blue-900 px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 mx-auto transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] w-full max-w-xs"
                >
                <span>Begin Setup</span>
                <ChevronRight className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2 text-blue-200/50">
                    <div className="h-px w-12 bg-white/10" />
                    <span className="text-xs uppercase tracking-widest font-bold">OR</span>
                    <div className="h-px w-12 bg-white/10" />
                </div>
                <button
                    onClick={async () => {
                        if (window.electron && window.electron.restoreData) {
                            const result = await window.electron.restoreData();
                            if (result.success) {
                                Swal.fire({
                                    title: 'Restore Successful',
                                    text: 'System will now restart to apply changes.',
                                    icon: 'success'
                                }).then(() => {
                                    window.location.reload();
                                });
                            } else if (result.error !== 'Cancelled') {
                                Swal.fire('Restore Failed', result.error, 'error');
                            }
                        }
                    }}
                    className="text-blue-100 hover:text-white flex items-center space-x-2 text-sm font-semibold transition-all border border-white/10 hover:border-white/30 px-6 py-2 rounded-xl"
                >
                    <PartyPopper className="w-4 h-4 text-blue-400" />
                    <span>Restore from Backup (.wpos)</span>
                </button>
            </div>
          </motion.div>
        );

      case 'modeSelection':
        return (
          <motion.div key="modeSelection" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Network className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Network Architecture</h2>
            </div>
            <p className="text-lg text-blue-100 mb-8">How will this specific computer be used in your business?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server Option */}
              <div
                onClick={() => { handleInputChange('appMode', 'SERVER'); handleNext(); }}
                className={`relative overflow-hidden cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:scale-[1.02] ${formData.appMode === 'SERVER' ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Server className="w-32 h-32" />
                </div>
                <Server className="w-10 h-10 text-indigo-300 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Main Server</h3>
                <p className="text-blue-100/70 text-sm">Select this for the main back-office computer. It acts as the central hub, managing the database, global inventory, and device approvals.</p>
                <div className="mt-6 flex items-center text-indigo-300 text-sm font-semibold">
                    <span>Choose Server</span> <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Outlet Option */}
              <div
                onClick={() => { handleInputChange('appMode', 'OUTLET'); handleNext(); }}
                className={`relative overflow-hidden cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:scale-[1.02] ${formData.appMode === 'OUTLET' ? 'border-teal-400 bg-teal-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MonitorSmartphone className="w-32 h-32" />
                </div>
                <MonitorSmartphone className="w-10 h-10 text-teal-300 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Checkout Outlet</h3>
                <p className="text-blue-100/70 text-sm">Select this for a cashier terminal. It connects to the Main Server over Wi-Fi, works offline, and syncs automatically.</p>
                 <div className="mt-6 flex items-center text-teal-300 text-sm font-semibold">
                    <span>Choose Outlet</span> <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

             <div className="flex justify-start pt-6">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </motion.div>
        );

      case 'outletConnect':
        return (
          <motion.div key="outletConnect" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <Wifi className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Connect to Server</h2>
            </div>

            {handshakeStatus === 'pending' ? (
                <div className="text-center space-y-8 py-10">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent animate-spin rounded-full mx-auto" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Server className="w-8 h-8 text-teal-400" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Pending Server Approval</h3>
                        <p className="text-blue-100/70 max-w-sm mx-auto">
                            Handshake request sent to <b>{formData.serverIp}</b>. Please visit the Server dashboard to approve this terminal: <b>"{formData.outletName}"</b>.
                        </p>
                    </div>
                    <button
                        onClick={() => setHandshakeStatus('idle')}
                        className="text-teal-400 font-bold hover:text-teal-300 transition-colors"
                    >
                        Cancel Request
                    </button>
                </div>
            ) : handshakeStatus === 'handshaking' ? (
                 <div className="text-center py-20">
                     <div className="w-16 h-16 border-4 border-white/20 border-t-white animate-spin rounded-full mx-auto mb-6" />
                     <p className="text-white font-bold">Initializing handshake...</p>
                 </div>
            ) : (
                <>
                <div className="space-y-4">
                <label className="block text-blue-100 font-medium">Terminal Name</label>
                <input
                    type="text"
                    placeholder="e.g. Counter 1, VIP Lounge"
                    value={formData.outletName}
                    onChange={(e) => handleInputChange('outletName', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md"
                />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <label className="block text-blue-100 font-medium">Select Master Server</label>
                    <button
                        onClick={async () => {
                            setIsScanning(true);
                            if (window.electron && window.electron.scanMdnsServers) {
                                const servers = await window.electron.scanMdnsServers();
                                setFoundServers(servers);
                            }
                            setIsScanning(false);
                        }}
                        className="text-teal-300 text-sm hover:text-teal-200 flex items-center"
                    >
                        {isScanning ? 'Scanning...' : 'Scan Network'}
                    </button>
                </div>

                {foundServers.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {foundServers.map((server, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleInputChange('serverIp', server.url)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.serverIp === server.url ? 'bg-teal-500/30 border-teal-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="font-semibold text-white">{server.name}</div>
                                <div className="text-sm text-teal-200">{server.url}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-black/20 rounded-xl p-4 text-center border border-white/5">
                        <p className="text-white/50 text-sm">No servers discovered automatically.</p>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Or enter manually (e.g. http://192.168.1.5:3000)"
                    value={formData.serverIp}
                    onChange={(e) => handleInputChange('serverIp', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-teal-500 mt-2"
                />
                </div>

                <div className="flex justify-between pt-8 border-t border-white/10">
                <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <button
                    disabled={!formData.outletName || !formData.serverIp}
                    onClick={handleNext}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-teal-900/40"
                >
                    <span>Connect Terminal</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
                </div>
                </>
            )}
          </motion.div>
        );

      case 'businessName':
        return (
          <motion.div key="businessName" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Business Name</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">What is the official name of your business? This will appear on all your receipts.</p>
            <input
              type="text"
              placeholder="e.g. Acme Coffee Shop"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-md"
              autoFocus
            />
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.businessName}
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      // (Other original Server cases like 'ownerName', 'contact', 'address', 'servedBy', 'mpesa' go here - copying them back verbatim with updated styling classes)
      case 'ownerName':
        return (
          <motion.div key="ownerName" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <UserIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Owner Name</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Who is managing this system? This creates the primary admin account.</p>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
            />
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.ownerName}
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div key="contact" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Phone className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Contact Info</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">How can customers reach you? This is printed on receipts.</p>
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Phone Number (e.g. 0700 000 000)"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
              />
              <input
                type="email"
                placeholder="Email Address (Optional)"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
              />
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.phone}
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'address':
        return (
          <motion.div key="address" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <MapPin className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Location</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Where is your business located?</p>
            <textarea
              placeholder="e.g. 123 Main Street, City Center"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md h-32 resize-none"
            />
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.address}
                onClick={handleNext}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'servedBy':
        return (
          <motion.div key="servedBy" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <UserIcon className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Receipt Labels</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">How should we label the cashier on the receipt?</p>
            <input
              type="text"
              placeholder="e.g. Served By, Cashier, Attendant"
              value={formData.servedByLabel}
              onChange={(e) => handleInputChange('servedByLabel', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-md"
            />
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.servedByLabel}
                onClick={handleNext}
                className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'mpesa':
        return (
          <motion.div key="mpesa" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">M-Pesa Setup</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Let us get you paid. Please enter your Paybill, and Account Number, or your Safaricom Till Number. 💰</p>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Paybill Number"
                value={formData.mpesaPaybill}
                onChange={(e) => handleInputChange('mpesaPaybill', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-md"
              />
              <input
                type="text"
                placeholder="Till Number"
                value={formData.mpesaTill}
                onChange={(e) => handleInputChange('mpesaTill', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-md"
              />
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Account Number (If using Paybill)"
                  value={formData.mpesaAccountNumber}
                  onChange={(e) => handleInputChange('mpesaAccountNumber', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-md"
                />
              </div>
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'pin':
        return (
          <motion.div key="pin" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6 text-center">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">4-digit PIN</h2>
            <p className="text-lg text-blue-100 mb-6">Safety first. Choose a secure code to keep your terminal locked up tight. 🔐</p>

            <div className="flex flex-col items-center space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Choose your PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={formData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, ''))}
                  className="w-48 bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-4xl tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Confirm your PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={formData.confirmPin}
                  onChange={(e) => handleInputChange('confirmPin', e.target.value.replace(/\D/g, ''))}
                  className="w-48 bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-4xl tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md"
                />
              </div>
            </div>

            <div className="flex justify-between pt-8 w-full">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={formData.pin.length !== 4 || formData.pin !== formData.confirmPin || isSubmitting}
                onClick={handleSubmit}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-cyan-900/40"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <>
                    <span>Finish Setup</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );

      case 'completion':
        return (
          <motion.div key="completion" variants={stepVariants} initial="enter" animate="center" exit="exit" className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <PartyPopper className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Setup Complete!</h1>
            <p className="text-xl text-blue-100/90">Your {formData.appMode === 'SERVER' ? 'Main Server' : 'Checkout Outlet'} has been configured successfully.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                    <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Admin Account
                    </h4>
                    <p className="text-white/80 text-sm">User: <span className="text-white font-semibold">{formData.appMode === 'OUTLET' ? 'Outlet Admin' : formData.ownerName}</span></p>
                    <p className="text-white/80 text-sm">PIN: <span className="text-white font-semibold">{formData.pin}</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                    <h4 className="text-teal-300 font-bold mb-2 flex items-center gap-2">
                        <Network className="w-4 h-4" /> Network Info
                    </h4>
                    <p className="text-white/80 text-sm">Mode: <span className="text-white font-semibold">{formData.appMode}</span></p>
                    {formData.appMode === 'OUTLET' && (
                        <p className="text-white/80 text-sm truncate">Server: <span className="text-white font-semibold">{formData.serverIp}</span></p>
                    )}
                </div>
            </div>

            {formData.appMode === 'SERVER' && (
                <div className="bg-blue-500/10 rounded-2xl p-6 mt-6 border border-blue-500/20 backdrop-blur-md">
                    <div className="flex items-center justify-center space-x-3 text-white mb-2">
                        <Printer className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-lg text-blue-100">Startup Invoice Printed</span>
                    </div>
                    <p className="text-blue-200/60 text-sm">We've printed a startup sheet with your admin credentials and system configuration. Please keep it in a safe place.</p>
                </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-10 bg-white text-blue-900 px-12 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Launch Application</span>
              <LogIn className="w-6 h-6" />
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans selection:bg-blue-500/30">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
        style={{ backgroundImage: `url(${setupBg})` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/80 via-black/60 to-slate-900/80 backdrop-blur-sm" />

      {/* Main Content Card */}
      <div className="relative z-20 w-full max-w-3xl px-4 sm:px-6">
        <div className="bg-white/10 border border-white/20 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl p-8 sm:p-10 md:p-14 overflow-hidden relative group">
          {/* Decorative Elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transition-all group-hover:bg-blue-500/30 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl transition-all group-hover:bg-purple-500/30 pointer-events-none" />

          {/* Progress Indicator */}
          {!isFinished && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/5 flex">
               {steps.map((step, idx) => (
                   <div key={step.id} className="h-full flex-1 relative border-r border-black/20 last:border-0">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: currentStep >= idx ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ originX: 0 }}
                        />
                   </div>
               ))}
            </div>
          )}

          {/* Step Counter */}
          {!isFinished && (
            <div className="absolute top-6 right-8 text-white/20 font-black text-4xl">
                {String(currentStep + 1).padStart(2, '0')}
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 font-medium tracking-widest text-sm uppercase">
            Whiz Pos • Multi-Outlet Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
