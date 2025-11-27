import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMobileStore } from '../store/mobileStore';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const { cart, clearCart, addToSyncQueue, currentUser } = useMobileStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);

    const transaction = {
      id: crypto.randomUUID(), // Or generate simpler ID
      items: cart,
      total,
      paymentMethod,
      timestamp: new Date().toISOString(),
      cashierId: currentUser?.id,
      cashierName: currentUser?.name,
      status: 'completed'
    };

    // 1. Add to sync queue
    addToSyncQueue({ type: 'transaction', data: transaction });

    // 2. Try to print receipt remotely
    try {
      await api.printReceipt(transaction);
    } catch (e) {
      console.warn('Print failed or offline', e);
    }

    // 3. Clear cart and show success
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        onClose();
        setIsSuccess(false); // Reset for next time
      }, 2000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Checkout</h2>

            <div className="bg-white/5 rounded-2xl p-6 mb-8 text-center">
              <span className="text-slate-400 text-sm uppercase tracking-wider block mb-1">Total to Pay</span>
              <span className="text-4xl font-bold text-emerald-400">KES {total.toLocaleString()}</span>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-sm font-medium text-slate-400 ml-1">Payment Method</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-95",
                    paymentMethod === 'cash'
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", paymentMethod === 'cash' ? "border-emerald-500" : "border-slate-500")}>
                    {paymentMethod === 'cash' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                  <span className="font-bold">CASH</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-95",
                    paymentMethod === 'mpesa'
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", paymentMethod === 'mpesa' ? "border-green-500" : "border-slate-500")}>
                    {paymentMethod === 'mpesa' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                  <span className="font-bold">M-PESA</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-95",
                    paymentMethod === 'credit'
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", paymentMethod === 'credit' ? "border-orange-500" : "border-slate-500")}>
                    {paymentMethod === 'credit' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                  </div>
                  <span className="font-bold">CREDIT</span>
                </button>
              </div>
            </div>

            <button
              disabled={!paymentMethod || isProcessing}
              onClick={handleCheckout}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                isProcessing ? "bg-slate-700" : "bg-sky-500 hover:bg-sky-600 shadow-sky-500/20"
              )}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : "Complete Sale"}
            </button>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
             <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
               <CheckCircle className="w-10 h-10 text-emerald-500" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
             <p className="text-slate-400">Transaction recorded & queued.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
