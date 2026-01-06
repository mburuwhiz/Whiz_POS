import React, { useState } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Receipt, Calendar, CreditCard, ChevronLeft, ChevronRight, LayoutGrid, Layers, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../services/api';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { transactions, currentUser } = useMobileStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'deck'>('deck'); // Default to deck per request
  const [deckIndex, setDeckIndex] = useState(0);

  // Filter for CURRENT USER only
  const myTransactions = transactions.filter(t =>
      (t.cashierId === currentUser?.id || t.cashier === currentUser?.name)
  ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredTransactions = myTransactions.filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.total.toString().includes(searchQuery)
  );

  const handleReprint = async (transaction: any) => {
    try {
      await api.printReceipt(transaction);
      alert('Reprint sent to printer');
    } catch (e) {
      alert('Failed to print receipt. Check connection.');
    }
  };

  // Deck Navigation
  const nextCard = () => {
      if (deckIndex < filteredTransactions.length - 1) setDeckIndex(prev => prev + 1);
  };
  const prevCard = () => {
      if (deckIndex > 0) setDeckIndex(prev => prev - 1);
  };

  // Reset deck index when filter changes
  React.useEffect(() => {
      setDeckIndex(0);
  }, [searchQuery]);

  const currentCard = filteredTransactions[deckIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="h-16 px-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-lg font-bold">My Sales</h1>
                <p className="text-xs text-slate-400">{filteredTransactions.length} Receipts</p>
            </div>
        </div>

        <div className="flex bg-white/5 rounded-lg p-1">
            <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white")}
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
            <button
                onClick={() => setViewMode('deck')}
                className={cn("p-2 rounded-md transition-all", viewMode === 'deck' ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white")}
            >
                <Layers className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or Amount..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <Receipt className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-center">No transactions found for you.</p>
          </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { setViewMode('deck'); setDeckIndex(filteredTransactions.indexOf(transaction)); }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500">#{transaction.id.slice(0, 8)}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                    transaction.paymentMethod === 'cash' ? "bg-emerald-500/20 text-emerald-400" :
                    transaction.paymentMethod === 'mpesa' ? "bg-green-500/20 text-green-400" :
                    "bg-orange-500/20 text-orange-400"
                  )}>
                    {transaction.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
              </div>
              <span className="font-bold text-lg">KES {transaction.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : (
        /* Deck View */
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-10">
                 <button onClick={prevCard} disabled={deckIndex === 0} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center pointer-events-auto disabled:opacity-20 transition-opacity">
                     <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button onClick={nextCard} disabled={deckIndex === filteredTransactions.length - 1} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center pointer-events-auto disabled:opacity-20 transition-opacity">
                     <ChevronRight className="w-6 h-6" />
                 </button>
            </div>

            {currentCard && (
                <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
                    {/* Receipt Header Visual */}
                    <div className="bg-sky-500 p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                        <Receipt className="w-12 h-12 mx-auto mb-2 relative z-10" />
                        <h2 className="text-2xl font-bold relative z-10">KES {currentCard.total.toLocaleString()}</h2>
                        <div className="text-sky-100 text-sm font-mono mt-1 relative z-10">#{currentCard.id}</div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <span className="text-slate-500 text-sm">Date</span>
                            <span className="font-medium text-sm">{new Date(currentCard.timestamp).toLocaleString()}</span>
                        </div>

                        <div className="space-y-3 mb-6">
                            {currentCard.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-slate-400">{item.quantity}x</span>
                                        <span className="text-slate-700">{item.product?.name || item.name}</span>
                                    </div>
                                    <span className="font-medium">{(item.product?.price || item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Payment</span>
                                 <span className="font-bold uppercase">{currentCard.paymentMethod}</span>
                             </div>
                             {currentCard.creditCustomer && (
                                 <div className="flex justify-between text-sm">
                                     <span className="text-slate-500">Customer</span>
                                     <span className="font-medium">{currentCard.creditCustomer}</span>
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={() => handleReprint(currentCard)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Reprint Receipt
                        </button>
                        <div className="text-center mt-3 text-xs text-slate-400">
                            Receipt {deckIndex + 1} of {filteredTransactions.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
