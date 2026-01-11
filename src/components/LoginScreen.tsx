import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Shield, User as UserIcon, Lock, Delete, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';

const LoginScreen = () => {
  const { users, setSession, businessSetup } = usePosStore();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const displayUsers = users.sort((a, b) => a.role === 'admin' ? -1 : 1);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => {
        setShake(false);
        setError('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUserSelect = (user: User) => {
    if (!user.isActive) {
      setError('User is disabled. Contact Admin.');
      return;
    }
    setSelectedUser(user);
    setPin('');
    setError('');
  };

  const handleKeyPress = (key: string) => {
    if (isLoading) return; // Block input while loading

    if (key === 'clear') {
      setPin('');
    } else if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      handleLogin();
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + key);
      }
    }
  };

  const handleLogin = async () => {
    if (!selectedUser) return;
    if (isLoading) return;

    if (!selectedUser.isActive) {
      setError('User account is disabled.');
      return;
    }

    if (pin.length < 4) {
        setError('Enter 4-digit PIN');
        return;
    }

    setIsLoading(true);

    try {
        if (window.electron && window.electron.auth) {
            const result = await window.electron.auth.login(selectedUser.id, pin, 'desktop-main');
            if (result.success && result.token && result.user) {
                toast("Login Successful", "success");
                setSession(result.user, result.token);
            } else {
                setError(result.error || 'Login failed');
                setPin('');
            }
        } else {
            // Fallback for dev/web environment (Simulate Strict Auth)
            if (pin === selectedUser.pin) {
                toast("Login Successful (Dev Mode)", "success");
                setSession(selectedUser, 'dev-token');
            } else {
                setError('Incorrect PIN');
                setPin('');
            }
        }
    } catch (e) {
        setError('System Error during Login');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const KeypadButton = ({ value, label, icon: Icon, onClick, className }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "h-16 w-full rounded-xl text-xl font-medium transition-all active:scale-95 flex items-center justify-center",
        "bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300",
        className
      )}
    >
      {Icon ? <Icon className="w-6 h-6" /> : label || value}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex h-[700px] z-10 relative">

        {/* Left Side: User Selection (Scrollable) */}
        <div className="w-1/2 bg-slate-50 border-r border-slate-100 flex flex-col">
          <div className="p-8 pb-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {businessSetup?.businessName || 'Whiz POS'}
            </h1>
            <p className="text-slate-500">Select an account to login</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 custom-scrollbar">
            {displayUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                disabled={!user.isActive}
                className={cn(
                  "w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-200 border text-left group",
                  selectedUser?.id === user.id
                    ? "bg-blue-600 border-blue-600 shadow-lg transform scale-[1.02]"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md",
                  !user.isActive && "opacity-50 grayscale cursor-not-allowed bg-slate-100"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-sm transition-colors",
                    selectedUser?.id === user.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                  )}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-bold text-lg",
                      selectedUser?.id === user.id ? "text-white" : "text-slate-900"
                    )}>
                      {user.name}
                    </h3>
                    <p className={cn(
                      "text-sm font-medium capitalize flex items-center gap-1.5",
                      selectedUser?.id === user.id ? "text-blue-100" : "text-slate-500"
                    )}>
                      {user.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                      {user.role}
                    </p>
                  </div>
                </div>
                {selectedUser?.id === user.id && (
                  <div className="bg-white/20 p-2 rounded-full">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                )}
                {!user.isActive && <Lock className="w-5 h-5 text-slate-400" />}
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50/50">
             <p className="text-xs text-center text-slate-400">Whiz POS v6.0.1</p>
          </div>
        </div>

        {/* Right Side: Keypad (Fixed) */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-50 pointer-events-none" />

           <div className="relative z-10 w-full max-w-sm">
              <div className="text-center mb-10">
                <div className={cn(
                  "w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-300",
                  selectedUser ? "bg-blue-600 text-white rotate-3" : "bg-slate-100 text-slate-300"
                )}>
                   {selectedUser ? selectedUser.name.charAt(0) : <UserIcon className="w-10 h-10" />}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 transition-all">
                  {selectedUser ? `Hello, ${selectedUser.name.split(' ')[0]}` : 'Welcome'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {selectedUser ? (isLoading ? 'Verifying credentials...' : 'Enter your PIN to access the terminal') : 'Please select a user account'}
                </p>
              </div>

              {/* PIN Display */}
              <div className="flex justify-center gap-4 mb-10 h-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-200 ring-2 ring-offset-2",
                      pin.length > i
                        ? "bg-blue-600 ring-blue-600 scale-110"
                        : "bg-slate-200 ring-transparent",
                      isLoading && "animate-pulse bg-blue-400"
                    )}
                  />
                ))}
              </div>

              {/* Error & Keypad */}
              <div className="space-y-6">
                 {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                       <Shield className="w-4 h-4" /> {error}
                    </div>
                 )}

                 <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleKeyPress(num.toString())}
                        disabled={!selectedUser || isLoading}
                        className="h-16 rounded-2xl text-2xl font-semibold bg-slate-50 hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 border border-slate-200 text-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                        onClick={() => handleKeyPress('clear')}
                        disabled={isLoading}
                        className="h-16 rounded-2xl text-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        CLR
                    </button>
                    <button
                        onClick={() => handleKeyPress('0')}
                        disabled={!selectedUser || isLoading}
                        className="h-16 rounded-2xl text-2xl font-semibold bg-slate-50 hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 border border-slate-200 text-slate-700 transition-all disabled:opacity-50"
                    >
                        0
                    </button>
                    <button
                        onClick={() => handleKeyPress('delete')}
                        disabled={isLoading}
                        className="h-16 rounded-2xl flex items-center justify-center font-bold bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        DEL
                    </button>
                 </div>

                 <button
                    onClick={() => handleKeyPress('enter')}
                    disabled={!selectedUser || pin.length < 4 || isLoading}
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl text-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                 >
                    {isLoading ? 'Verifying...' : 'Access POS'} <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Moving Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-slate-400 py-3 overflow-hidden z-0">
        <div className="animate-marquee whitespace-nowrap flex gap-10">
          {[1, 2, 3, 4].map((i) => (
             <span key={i} className="text-sm font-medium tracking-wide mx-8">
               Developed and managed by Whiz Tech KE — Call 0740 841 168 to get yours.
             </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
