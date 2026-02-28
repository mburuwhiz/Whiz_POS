import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, User, Mail, Phone, MapPin,
  Tag, CreditCard, Lock, CheckCircle2,
  ChevronRight, ChevronLeft, Printer, LogIn,
  Sparkles, PartyPopper
} from 'lucide-react';
import { soundManager } from '../lib/soundUtils';
import setupBg from '../assets/setup_install_bg.png';

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'businessName', title: 'Business Name' },
  { id: 'ownerName', title: 'Owner Name' },
  { id: 'contact', title: 'Contact Info' },
  { id: 'address', title: 'Business Address' },
  { id: 'servedBy', title: 'Served By' },
  { id: 'mpesa', title: 'M-Pesa Setup' },
  { id: 'pin', title: '4-digit PIN' },
  { id: 'completion', title: 'Completion' }
];

export default function BusinessRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const { finishSetup } = usePosStore();

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    servedByLabel: 'Cashier',
    mpesaPaybill: '',
    mpesaTill: '',
    mpesaAccountNumber: '',
    pin: '',
    confirmPin: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      soundManager.playPop();
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      soundManager.playClick();
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.pin !== formData.confirmPin) {
      soundManager.playError();
      alert("PINs do not match!");
      return;
    }
    if (formData.pin.length !== 4) {
      soundManager.playError();
      alert("PIN must be exactly 4 digits!");
      return;
    }

    setIsSubmitting(true);
    soundManager.playClick();

    const businessData = {
      businessName: formData.businessName,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      servedByLabel: formData.servedByLabel,
      mpesaPaybill: formData.mpesaPaybill,
      mpesaTill: formData.mpesaTill,
      mpesaAccountNumber: formData.mpesaAccountNumber,
      tax: 0,
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
      setIsFinished(true);
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error('Setup failed:', error);
      soundManager.playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <motion.div key="welcome" variants={stepVariants} initial="enter" animate="center" exit="exit" className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Hi, Thank you for choosing Whiz Pos</h1>
            <p className="text-xl text-blue-100">Let's get you started. We are so excited to help you grow your business today. 👋</p>
            <button
              onClick={handleNext}
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20"
            >
              Let's Begin
            </button>
          </motion.div>
        );

      case 'businessName':
        return (
          <motion.div key="bizName" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Business Name</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Every great venture needs a name. What should we call your amazing business? 🏢</p>
            <input
              autoFocus
              type="text"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && formData.businessName && handleNext()}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
            />
            <div className="flex justify-end pt-8">
              <button
                disabled={!formData.businessName}
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'ownerName':
        return (
          <motion.div key="ownerName" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <User className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Owner Name</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">It is time to meet the boss. Please enter your full name so we know who is running the show. 👑</p>
            <input
              autoFocus
              type="text"
              placeholder="Business owner name"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && formData.ownerName && handleNext()}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-md"
            />
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.ownerName}
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Looks Good</span>
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
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Contact Info</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">How can we stay in touch? Please provide your email address and phone number. 📱</p>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                <input
                  type="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 pl-14 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                <input
                  type="tel"
                  placeholder="+254 XXX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 pl-14 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
                />
              </div>
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={handleBack} className="text-white/60 hover:text-white font-medium flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                disabled={!formData.email || !formData.phone}
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all"
              >
                <span>Save Contact</span>
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
              <h2 className="text-3xl font-bold text-white">Business Address</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Where is the magic happening? Enter your address to help us put you on the map. 🗺️</p>
            <textarea
              autoFocus
              placeholder="123 Business Street, City, Country"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md resize-none"
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
                <span>Set Location</span>
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
                <Tag className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Served By</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">Who is serving your customers? Enter the "Served By" Label name that will appear on every receipt. 🏷️</p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Cashier, Server, Budtender"
              value={formData.servedByLabel}
              onChange={(e) => handleInputChange('servedByLabel', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-md"
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
                <span>Set Label</span>
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
                <span>Save Payments</span>
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
            <p className="text-lg text-blue-100 mb-6">Safety first. Choose a secure code to keep your business data locked up tight. 🔐</p>

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
            <h1 className="text-4xl font-bold text-white">You are all set</h1>
            <p className="text-xl text-blue-100">Your business is officially registered and ready for big things. 🎉</p>

            <div className="bg-white/10 rounded-2xl p-6 mt-8 border border-white/20 backdrop-blur-md">
              <div className="flex items-center justify-center space-x-3 text-white mb-2">
                <Printer className="w-5 h-5 text-green-400" />
                <span className="font-medium text-lg">Startup Invoice Printed</span>
              </div>
              <p className="text-white/60">Check the printed startup for your login details and business configuration.</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-12 bg-white text-blue-900 px-12 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Go to Login Screen</span>
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
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
        style={{ backgroundImage: `url(${setupBg})` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/80 via-black/40 to-blue-900/40 backdrop-blur-[2px]" />

      {/* Main Content Card */}
      <div className="relative z-20 w-full max-w-2xl px-6">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl p-10 md:p-14 overflow-hidden relative group">
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl transition-all group-hover:bg-blue-500/30" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl transition-all group-hover:bg-purple-500/30" />

          {/* Progress Indicator */}
          {!isFinished && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Footer Page Counter - Hidden as per user requirement to not mention steps */}
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 font-medium">
            Whiz Pos v2024.1 • Secure & Efficient
          </p>
        </div>
      </div>
    </div>
  );
}
