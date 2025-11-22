import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, User, CartItem, Transaction, BusinessSetup } from '../types';

interface MobileState {
  // Connection Settings
  apiUrl: string;
  apiKey: string;
  isConnected: boolean;

  // Data
  products: Product[];
  users: User[];
  cart: CartItem[];
  businessSetup: BusinessSetup | null;

  // Session
  currentUser: User | null;
  rememberedUser: User | null; // User who logged in last (for PIN-only login)

  // Sync
  syncQueue: any[];
  isOnline: boolean;

  // Actions
  setConnection: (url: string, key: string) => void;
  checkConnection: () => Promise<boolean>;

  login: (user: User) => void;
  logout: () => void;
  forgetUser: () => void;

  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  processTransaction: (paymentMethod: 'cash' | 'mpesa' | 'credit') => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useMobileStore = create<MobileState>()(
  persist(
    (set, get) => ({
      apiUrl: '',
      apiKey: '',
      isConnected: false,

      products: [],
      users: [],
      cart: [],
      businessSetup: null,
      currentUser: null,
      rememberedUser: null,
      syncQueue: [],
      isOnline: true, // Default to true, will update based on listeners

      setConnection: (url, key) => {
        // Normalize URL
        const normalizedUrl = url.replace(/\/$/, '');
        const finalUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `http://${normalizedUrl}`;
        set({ apiUrl: finalUrl, apiKey: key });
      },

      checkConnection: async () => {
        const { apiUrl, apiKey } = get();
        if (!apiUrl || !apiKey) return false;

        try {
          // Short timeout for check
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(`${apiUrl}/api/status`, { signal: controller.signal });
          clearTimeout(id);

          if (res.ok) {
            set({ isConnected: true });
            return true;
          }
        } catch (e) {
          console.error("Connection check failed", e);
        }
        set({ isConnected: false });
        return false;
      },

      login: (user) => set({ currentUser: user, rememberedUser: user }),
      logout: () => set({ currentUser: null }),
      forgetUser: () => set({ rememberedUser: null, currentUser: null }),

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== id)
      })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item => item.product.id === id ? { ...item, quantity: qty } : item)
        }));
      },

      clearCart: () => set({ cart: [] }),

      processTransaction: async (paymentMethod) => {
        const state = get();
        if (!state.currentUser) return;

        const subtotal = state.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const transaction: Transaction = {
          id: `MTXN${Date.now()}`, // Mobile Transaction ID
          timestamp: new Date().toISOString(),
          items: [...state.cart],
          subtotal,
          tax: 0, // Simplify for mobile or calculate from businessSetup
          total: subtotal,
          paymentMethod,
          cashier: state.currentUser.name,
          status: 'completed'
        };

        // 1. Add to Sync Queue (Offline First)
        const operation = { type: 'new-transaction', data: transaction };
        set((s) => ({ syncQueue: [...s.syncQueue, operation], cart: [] }));

        // 2. Try to Push Immediately
        try {
            if (state.isConnected) {
                 await fetch(`${state.apiUrl}/api/transactions`, {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${state.apiKey}`
                     },
                     body: JSON.stringify(transaction)
                 });

                 // If successful, remove from queue?
                 // Actually, cleaner to process queue in batch.
                 // Let's just trigger syncWithServer which handles queue.
                 get().syncWithServer();

                 // 3. Trigger Remote Print
                 if (state.businessSetup) {
                     fetch(`${state.apiUrl}/api/print-receipt`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.apiKey}` },
                         body: JSON.stringify({ transaction, businessSetup: state.businessSetup })
                     }).catch(err => console.error("Print failed", err));
                 }
            }
        } catch (e) {
            console.error("Offline transaction saved to queue");
        }
      },

      syncWithServer: async () => {
        const state = get();
        if (!state.apiUrl || !state.apiKey) return;

        try {
            // 1. Push Queue
            if (state.syncQueue.length > 0) {
                const res = await fetch(`${state.apiUrl}/api/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.apiKey}` },
                    body: JSON.stringify(state.syncQueue)
                });

                if (res.ok) {
                    set({ syncQueue: [] });
                }
            }

            // 2. Pull Data
            const res = await fetch(`${state.apiUrl}/api/sync`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${state.apiKey}` }
            });

            if (res.ok) {
                const data = await res.json();
                set({
                    products: data.products || [],
                    users: data.users || [],
                    businessSetup: data.businessSetup || state.businessSetup,
                    isConnected: true
                });
            }
        } catch (e) {
            console.error("Sync failed", e);
            set({ isConnected: false });
        }
      }
    }),
    {
      name: 'whiz-mobile-storage',
      partialize: (state) => ({
          apiUrl: state.apiUrl,
          apiKey: state.apiKey,
          syncQueue: state.syncQueue,
          // Persist data so offline works
          products: state.products,
          users: state.users,
          businessSetup: state.businessSetup,
          rememberedUser: state.rememberedUser // Persist remembered user
      })
    }
  )
);
