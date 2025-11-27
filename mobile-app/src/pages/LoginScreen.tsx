import React, { useState } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { User as UserIcon, Lock, ChevronRight, Delete, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginScreen() {
  const { users, login } = useMobileStore();
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setPin('');
    setError('');
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    if (!selectedUser) return;

    // In a real app, we would hash the PIN or check against a secure hash.
    // For now, assuming direct comparison or using a simple check.
    // Spec says "User ID/JSON credential", but typically PIN is verified locally or via auth endpoint.
    // The store has `users` which might contain the PIN (if safe) or we send to server.
    // Given "Offline-First", data must be local.

    if (selectedUser.pin === pin) {
      login(selectedUser);
      navigate('/dashboard');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px]" />

      <div className="flex-1 flex flex-col p-6 z-10">
        <header className="mb-8 pt-8">
          <img src="/logo.svg" className="h-10 w-auto mb-4" alt="Whiz Pos" />
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-slate-400">Select your account to continue</p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold truncate w-full">{user.name}</div>
                    <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full"
            >
              <div className="flex flex-col items-center mb-8 w-full">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="self-start text-sm text-sky-400 mb-6 flex items-center gap-1"
                >
                   ← Switch User
                </button>

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-3xl font-bold mb-4 shadow-xl shadow-sky-500/20">
                  {selectedUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mt-4 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-4 h-4 rounded-full border-2 border-slate-600 transition-colors",
                        i < pin.length ? "bg-sky-400 border-sky-400" : "bg-transparent"
                      )}
                    />
                  ))}
                </div>
                {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {error}</p>}
              </div>

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    className="aspect-square rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                   onClick={() => handlePinInput('0')}
                   className="aspect-square rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium transition-colors"
                >
                  0
                </button>
                <button
                   onClick={handleBackspace}
                   className="aspect-square rounded-full hover:bg-white/5 active:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={pin.length !== 4}
                className="w-full bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Enter POS <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
