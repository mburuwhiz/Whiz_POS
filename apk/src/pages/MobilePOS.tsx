import { useState, useMemo } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { Search, ShoppingCart, Plus, Minus, LogOut, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const MobilePOS = () => {
  const {
    products, cart, addToCart, updateQuantity,
    processTransaction, logout, isConnected, syncWithServer
  } = useMobileStore();

  const [view, setView] = useState<'grid' | 'cart'>('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [processing, setProcessing] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async (method: 'cash' | 'mpesa' | 'credit') => {
    if (cart.length === 0) return;
    setProcessing(true);
    await processTransaction(method);
    setProcessing(false);
    setView('grid');
    alert("Transaction Completed!");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
            <span className="font-bold text-lg text-gray-800">WHIZ POS</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => syncWithServer()} className="p-2 text-gray-500 active:text-blue-600">
                <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={logout} className="p-2 text-gray-500 active:text-red-600">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">

        {/* Product Grid View */}
        <div className={clsx("absolute inset-0 flex flex-col transition-transform duration-300", view === 'cart' ? "-translate-x-full" : "translate-x-0")}>

            {/* Search & Filter */}
            <div className="p-4 space-y-3 bg-white shadow-sm z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={clsx(
                                "px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-colors",
                                category === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                {filteredProducts.map(product => (
                    <button
                        key={product.id}
                        onClick={() => {
                            addToCart(product);
                            // Optional: haptic feedback
                        }}
                        className="bg-white p-3 rounded-xl border shadow-sm flex flex-col gap-2 active:scale-95 transition-transform"
                    >
                        <div className="aspect-square bg-gray-100 rounded-lg w-full overflow-hidden relative">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                {product.stock} left
                            </div>
                        </div>
                        <div className="text-left w-full">
                            <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                            <div className="text-blue-600 font-bold">Ksh {product.price}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Cart View */}
        <div className={clsx("absolute inset-0 bg-white flex flex-col transition-transform duration-300", view === 'grid' ? "translate-x-full" : "translate-x-0")}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <ShoppingCart className="w-16 h-16 opacity-20" />
                        <p>Cart is empty</p>
                        <button onClick={() => setView('grid')} className="text-blue-600 font-medium">Start Shopping</button>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 bg-white border-b pb-4 last:border-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                {item.product.image && <img src={item.product.image} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{item.product.name}</div>
                                <div className="text-blue-600 font-bold">Ksh {item.product.price * item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm active:bg-gray-50"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-medium w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm active:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div className="p-4 border-t bg-gray-50 space-y-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>Ksh {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            disabled={processing}
                            onClick={() => handleCheckout('cash')}
                            className="bg-green-600 text-white py-3 rounded-lg font-semibold active:bg-green-700"
                        >
                            CASH
                        </button>
                        <button
                            disabled={processing}
                            onClick={() => handleCheckout('mpesa')}
                            className="bg-green-500 text-white py-3 rounded-lg font-semibold active:bg-green-600"
                        >
                            M-PESA
                        </button>
                        <button
                            disabled={processing}
                            onClick={() => handleCheckout('credit')}
                            className="bg-blue-600 text-white py-3 rounded-lg font-semibold active:bg-blue-700"
                        >
                            CREDIT
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* Bottom Nav (Only needed if we have multiple main tabs, but for POS simple toggle is fine) */}
      <div className="bg-white border-t px-6 py-3 flex justify-between shrink-0 pb-safe">
         <button
            onClick={() => setView('grid')}
            className={clsx("flex flex-col items-center gap-1", view === 'grid' ? "text-blue-600" : "text-gray-400")}
         >
             <Search className="w-6 h-6" />
             <span className="text-xs font-medium">Products</span>
         </button>

         <button
            onClick={() => setView('cart')}
            className="relative flex flex-col items-center gap-1 text-gray-400"
         >
             <div className={clsx("flex flex-col items-center gap-1", view === 'cart' ? "text-blue-600" : "text-gray-400")}>
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs font-medium">Cart</span>
             </div>
             {cart.length > 0 && (
                 <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                     {cart.reduce((a,b) => a + b.quantity, 0)}
                 </span>
             )}
         </button>
      </div>
    </div>
  );
};

export default MobilePOS;
