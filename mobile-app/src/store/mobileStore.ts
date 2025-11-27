import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Preferences } from '@capacitor/preferences';

// Custom storage adapter for Capacitor Preferences
const capacitorStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key: name });
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await Preferences.remove({ key: name });
  },
};

interface User {
  id: string;
  name: string;
  role: string;
  pin?: string;
}

interface Product {
  id: string; // Use string for ID to match desktop/mongo
  _id?: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  minStock?: number;
}

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

interface ConnectionSettings {
  apiUrl: string;
  apiKey: string;
  isConnected: boolean;
}

interface MobileStore {
  // Connection
  connection: ConnectionSettings;
  setConnection: (settings: Partial<ConnectionSettings>) => void;

  // Auth
  currentUser: User | null;
  users: User[]; // Synced users list for login
  login: (user: User) => void;
  logout: () => void;
  setUsers: (users: User[]) => void;

  // Data
  products: Product[];
  categories: string[];
  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;

  // Sync Queue (simplified for now)
  syncQueue: any[];
  addToSyncQueue: (item: any) => void;
  clearSyncQueue: () => void;
}

export const useMobileStore = create<MobileStore>()(
  persist(
    (set, get) => ({
      connection: {
        apiUrl: '',
        apiKey: '',
        isConnected: false,
      },
      setConnection: (settings) =>
        set((state) => ({ connection: { ...state.connection, ...settings } })),

      currentUser: null,
      users: [],
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      setUsers: (users) => set({ users }),

      products: [],
      categories: [],
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),

      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        return {
          cart: [...state.cart, { ...product, cartId: Math.random().toString(36), quantity: 1 }]
        };
      }),
      removeFromCart: (cartId) =>
        set((state) => ({ cart: state.cart.filter(item => item.cartId !== cartId) })),
      updateCartQuantity: (cartId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter(item => item.cartId !== cartId) };
          }
          return {
            cart: state.cart.map(item =>
              item.cartId === cartId ? { ...item, quantity } : item
            )
          };
        }),
      clearCart: () => set({ cart: [] }),

      syncQueue: [],
      addToSyncQueue: (item) => set((state) => ({ syncQueue: [...state.syncQueue, item] })),
      clearSyncQueue: () => set({ syncQueue: [] }),
    }),
    {
      name: 'whiz-pos-mobile-storage',
      storage: createJSONStorage(() => capacitorStorage),
      partialize: (state) => ({
        connection: state.connection,
        currentUser: state.currentUser,
        syncQueue: state.syncQueue,
        // Persist data for offline use
        products: state.products,
        categories: state.categories,
        users: state.users
      }),
    }
  )
);
