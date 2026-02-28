import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
import { cn } from '../lib/utils';
import { Shield, User as UserIcon, Lock, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';

const LoginScreen = () => {
  const { users, setSession, businessSetup } = usePosStore();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayUsers = users.sort((a, b) => a.role === 'admin' ? -1 : 1);

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
    if (isLoading) return;

    if (key === 'clear') {
      setPin('');
      setError('');
    } else if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError('');
    } else if (key === 'enter') {
      handleLogin();
    } else {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);
        if (newPin.length === 4) {
          // Auto-login attempt
          handleLogin(newPin);
        }
      }
    }
  };

  const handleLogin = async (explicitPin?: string) => {
    const loginPin = explicitPin || pin;
    if (isLoading) return;

    let userToLogin = selectedUser;

    // If no user selected, try to find user by PIN (Auto-login)
    if (!userToLogin && loginPin.length === 4) {
      userToLogin = users.find(u => u.pin === loginPin && u.isActive) || null;
    }

    if (!userToLogin) {
      if (loginPin.length === 4) {
        setError('Invalid PIN or account disabled');
        setPin('');
      }
      return;
    }

    if (!userToLogin.isActive) {
      setError('User account is disabled.');
      return;
    }

    if (loginPin.length < 4) {
        setError('Enter 4-digit PIN');
        return;
    }

    setIsLoading(true);

    try {
        if (window.electron && window.electron.auth) {
            const result = await window.electron.auth.login(userToLogin.id, loginPin, 'desktop-main');
            if (result.success && result.token && result.user) {
                toast("Login Successful", "success");
                setSession(result.user, result.token);
            } else {
                setError(result.error || 'Login failed');
                setPin('');
            }
        } else {
            // Fallback for dev/web environment
            if (loginPin === userToLogin.pin) {
                toast("Login Successful (Dev Mode)", "success");
                setSession(userToLogin, 'dev-token');
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Simplified Login Card */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 z-10 relative">
        <div className="relative z-10 w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {businessSetup?.businessName || 'Whiz POS'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">Enter your 4-digit PIN</p>
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
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Shield className="w-3 h-3" /> {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  disabled={isLoading}
                  className="h-14 rounded-xl text-xl font-bold bg-slate-50 hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress('clear')}
                disabled={isLoading}
                className="h-14 rounded-xl text-sm font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                disabled={isLoading}
                className="h-14 rounded-xl text-xl font-bold bg-slate-50 hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress('delete')}
                disabled={isLoading}
                className="h-14 rounded-xl flex items-center justify-center font-bold bg-slate-50 hover:bg-slate-900 hover:text-white transition-all active:scale-95 disabled:opacity-50 text-slate-600"
              >
                DEL
              </button>
            </div>

            <button
              onClick={() => handleKeyPress('enter')}
              disabled={pin.length < 4 || isLoading}
              className="w-full h-14 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'SECURE LOGIN...' : 'VERIFY ACCESS'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Moving Footer - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/50 backdrop-blur-md text-slate-400 py-4 overflow-hidden z-0 border-t border-white/5">
        <div className="animate-marquee whitespace-nowrap flex gap-10">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] mx-8 opacity-50">
              Developed and managed by Whizpoint Solutions — Call 0740 841 168 to get yours.
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
