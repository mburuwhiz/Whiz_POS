import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Shield, User as UserIcon, Lock, Delete, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';

const LoginScreen = () => {
  const { users, login, businessSetup } = usePosStore();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Filter only active users for the list, but we might want to show all and disable click?
  // Requirement: "disable user(locks user from logging in with a pop user disabled"
  // So we show them, but when clicked or PIN entered, show error.
  // Actually, usually disabled users are hidden or greyed out.
  // "locks user from logging in with a pop user disabled" implies they might try.
  // I'll show them but maybe visually dim them.
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

  const handleLogin = () => {
    if (!selectedUser) return;

    if (!selectedUser.isActive) {
      setError('User account is disabled.');
      return;
    }

    if (pin === selectedUser.pin) {
      toast("Login Successful", "success");
      login(selectedUser);
    } else {
      setError('Incorrect PIN');
      setPin('');
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">

        {/* Left Side: User Selection */}
        <div className="flex flex-col h-full">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {businessSetup?.businessName || 'Whiz POS'}
            </h1>
            <p className="text-slate-500">Select your account to continue</p>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col bg-white/50 backdrop-blur-xl border-slate-200/60 shadow-xl">
            <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {displayUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={cn(
                    "w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 border",
                    selectedUser?.id === user.id
                      ? "bg-blue-600 border-blue-600 shadow-md transform scale-[1.02]"
                      : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/50",
                    !user.isActive && "opacity-60 grayscale"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm",
                      selectedUser?.id === user.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h3 className={cn(
                        "font-semibold text-lg",
                        selectedUser?.id === user.id ? "text-white" : "text-slate-900"
                      )}>
                        {user.name}
                      </h3>
                      <p className={cn(
                        "text-sm capitalize flex items-center gap-1",
                        selectedUser?.id === user.id ? "text-blue-100" : "text-slate-500"
                      )}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </p>
                    </div>
                  </div>
                  {!user.isActive && <Lock className="w-4 h-4 text-slate-400" />}
                  {selectedUser?.id === user.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: PIN Entry */}
        <div className="flex flex-col justify-center h-full">
          <Card className={cn(
            "p-8 bg-white shadow-2xl border-0 relative overflow-hidden transition-transform duration-100",
            shake && "translate-x-[-10px]"
          )}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 flex flex-col h-full justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedUser ? `Welcome, ${selectedUser.name}` : 'Enter PIN'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {selectedUser ? 'Please enter your 4-digit PIN' : 'Select a user first'}
                </p>
              </div>

              {/* PIN Dots */}
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-300",
                      pin.length > i
                        ? "bg-blue-600 scale-110 shadow-blue-200 shadow-lg"
                        : "bg-slate-200"
                    )}
                  />
                ))}
              </div>

              {/* Error Message */}
              <div className="h-6 mb-4 text-center">
                {error && (
                  <span className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                  </span>
                )}
              </div>

              {/* Keypad */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <KeypadButton
                      key={num}
                      value={num}
                      onClick={() => handleKeyPress(num.toString())}
                      className={!selectedUser && "opacity-50 cursor-not-allowed"}
                    />
                  ))}
                  <KeypadButton
                    label="C"
                    onClick={() => handleKeyPress('clear')}
                    className="text-red-500 font-bold hover:bg-red-50 hover:border-red-200"
                  />
                  <KeypadButton
                    value={0}
                    onClick={() => handleKeyPress('0')}
                    className={!selectedUser && "opacity-50 cursor-not-allowed"}
                  />
                  <KeypadButton
                    icon={Delete}
                    onClick={() => handleKeyPress('delete')}
                    className="text-orange-500 hover:bg-orange-50 hover:border-orange-200"
                  />
                </div>
                <button
                  onClick={() => handleKeyPress('enter')}
                  className="w-full h-14 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  Enter <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-4 text-center text-slate-400 text-xs">
        Whiz POS System v6.0 &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LoginScreen;
