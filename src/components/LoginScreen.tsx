import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import { Store, ArrowRight, AlertCircle, Lock, Building2, User as UserIcon } from 'lucide-react';

export default function LoginScreen() {
  const { login, users, businessSetup } = usePosStore();

  // State
  const [step, setStep] = useState<'business' | 'user'>('business');

  // Business Login State
  const [businessIdInput, setBusinessIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // User Login State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!businessSetup) return null;

  const handleBusinessLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
        if (businessIdInput === businessSetup.businessId && passwordInput === businessSetup.password) {
            setStep('user');
            setError('');
        } else {
            setError('Invalid Business ID or Password.');
        }
        setIsLoading(false);
    }, 600);
  };

  const handleUserLogin = (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedUserId) {
          setError('Please select a user.');
          return;
      }

      const user = users.find(u => u.id === selectedUserId);
      if (user && user.pin === pin) {
          login(user);
      } else {
          setError('Invalid PIN.');
          setPin('');
      }
  };

  // User Selection View (Step 2)
  if (step === 'user') {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center z-50 font-sans">
             {/* Background Abstract Elements */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md p-8 mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl mb-4 border border-white/20">
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Select User</h1>
                    <p className="text-blue-200 mt-2 text-sm">Who is logging in?</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
                     <form onSubmit={handleUserLogin} className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">User</label>
                            <div className="relative">
                                <select
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="block w-full pl-4 pr-10 py-4 bg-gray-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-gray-900/70 transition-all duration-200 outline-none appearance-none"
                                >
                                    <option value="" className="text-gray-900">Select a user...</option>
                                    {users.filter(u => u.isActive).map(user => (
                                        <option key={user.id} value={user.id} className="text-gray-900">
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                         </div>

                         {selectedUserId && (
                             <div className="space-y-2 animate-fade-in">
                                <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">Enter PIN</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-blue-100 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-gray-900/70 transition-all duration-200 outline-none tracking-[0.5em] text-center font-mono text-lg"
                                        placeholder="••••"
                                    />
                                </div>
                             </div>
                         )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('business')}
                                className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200 border border-white/10"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedUserId || pin.length !== 4}
                                className="flex-[2] flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Login
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                     </form>
                </div>
            </div>
        </div>
      );
  }

  // Business Login View (Step 1)
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center z-50 font-sans">
      {/* Background Abstract Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md p-8 mx-4">
        {/* Header / Logo Area */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl mb-6 border border-white/20">
                <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{businessSetup.businessName}</h1>
            <p className="text-blue-200 mt-2 text-sm tracking-wide uppercase opacity-80">Secure Point of Sale</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleBusinessLogin} className="space-y-6">

            <div className="space-y-2">
                <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">Business ID</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-blue-300 group-focus-within:text-blue-100 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={businessIdInput}
                        onChange={(e) => setBusinessIdInput(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-gray-900/70 transition-all duration-200 outline-none"
                        placeholder="Enter Business ID"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-blue-100 transition-colors" />
                    </div>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-gray-900/70 transition-all duration-200 outline-none"
                        placeholder="Enter Password"
                        required
                    />
                </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>
                  <span>Access System</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-blue-300/60">
                Powered by Whiz Tech &copy; {new Date().getFullYear()}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
