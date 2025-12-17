import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Clock, Activity } from 'lucide-react';

interface AutoLogoutModalProps {
  onLogout: () => void;
}

export default function AutoLogoutModal({ onLogout }: AutoLogoutModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  // Calculate progress for a circular timer or progress bar
  const progress = (timeLeft / 10) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative overflow-hidden"
        >
          {/* Background Decorative Gradient */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
              {/* Circular Progress Timer */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={276} // 2 * PI * 44
                  strokeDashoffset={276 - (276 * progress) / 100}
                  className={`transition-all duration-1000 ease-linear ${
                    timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Are you still there?</h2>
            <p className="text-gray-500 mb-8">
              For security, you will be automatically logged out in <span className="font-semibold text-gray-700">{timeLeft} seconds</span> due to inactivity.
            </p>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              onClick={() => {
                // Just interacting with the button (clicking) triggers user activity events
                // which react-use's useIdle listens for, causing isIdle to flip to false.
                // We don't strictly need a handler here to cancel, but we can add a visual effect.
              }}
            >
              <Activity className="w-5 h-5 group-hover:animate-pulse" />
              I'm Still Here
            </button>

            <p className="mt-4 text-xs text-gray-400">
                Move your mouse or press any key to stay logged in.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
