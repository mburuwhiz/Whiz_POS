import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Electron API that will be exposed on the window object
declare global {
  interface Window {
    electron: {
      saveData: (fileName: string, data: any) => Promise<{ success: boolean; error?: any }>;
      readData: (fileName: string) => Promise<{ success: boolean; data?: any; error?: any }>;
      printReceipt: (transaction: Transaction, businessSetup: BusinessSetup, isReprint: boolean) => void;
      saveImage: (tempPath: string) => Promise<{ success: boolean; path?: string; fileName?: string; error?: any }>;
      printClosingReport: (reportData: ClosingReportData, businessSetup: BusinessSetup) => void;
      printBusinessSetup: (businessSetup: BusinessSetup, adminUser: User) => void;
      getApiConfig: () => Promise<{ apiUrl: string, apiKey: string, qrCodeDataUrl: string }>;
      uploadImage: (filePath: string, apiUrl: string, apiKey: string) => Promise<{ imageUrl: string }>;
      getPrinters: () => Promise<any[]>;
    };
  }
}

// Helper function for saving data via Electron's main process
const saveDataToFile = async (fileName: string, data: any) => {
  if (window.electron) {
    return await window.electron.saveData(fileName, data);
  } else {
    console.warn('Electron API not available. Data not saved to disk.');
    return { success: true }; // Prevent crashes in a pure web environment
  }
};

// Helper function for reading data via Electron's main process
const readDataFromFile = async (fileName: string) => {
  if (window.electron) {
    return await window.electron.readData(fileName);
  } else {
    console.error('Electron API is not available. This application is designed to run in Electron.');
    return { success: false, error: 'Electron API not available' };
  }
};

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  localImage?: string;
  available: boolean;
  stock?: number;
  minStock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  cashier: string;
  creditCustomer?: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface CreditSale {
  transactionId: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partially-paid' | 'paid';
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  paidAmount: number;
  balance: number;
  transactions: string[]; // Store transaction IDs
  createdAt: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: string;
  cashier: string;
  receipt?: string;
}

export interface BusinessSetup {
  businessName: string;
  businessId?: string;
  apiUrl?: string;
  apiKey?: string;
  address: string;
  phone?: string;
  email?: string;
  taxRate?: number;
  currency?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  printerType: 'thermal' | 'standard';
  selectedPrinter?: string;
  showPrintPreview?: boolean;
  onScreenKeyboard?: boolean;
  isSetup: boolean;
  isLoggedIn: boolean; // Added for login state
  createdAt: string;
  servedByLabel: string;
  mpesaPaybill: string;
  mpesaTill: string;
  mpesaAccountNumber: string;
  tax: number;
  subtotal: number;
}

export interface CreditTransaction {
  customerName: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'partially-paid';
}

export interface CashierReport {
  cashierName: string;
  transactions: Transaction[];
  totalSales: number;
  cashTotal: number;
  mpesaTotal: number;
  creditTotal: number;
  creditTransactions: CreditTransaction[];
}

export interface ClosingReportData {
  date: string;
  cashiers: CashierReport[];
  grandTotal: number;
  totalCash: number;
  totalMpesa: number;
  totalCredit: number;
}

interface PosState {
  // Data
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  creditCustomers: CreditCustomer[];
  users: User[];
  expenses: Expense[];
  businessSetup: BusinessSetup | null;
  
  // UI State
  isDataLoaded: boolean;
  currentCashier: User | null;
  isCheckoutOpen: boolean;
  isSetupWizardOpen: boolean;
  isLoginOpen: boolean;
  isKeyboardOpen: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  currentPage: 'pos' | 'reports' | 'customers' | 'settings' | 'closing' | 'dashboard' | 'inventory' | 'loyalty' | 'scanner' | 'sync' | 'register' | 'backoffice';
  // Settings
  isOnline: boolean;
  syncQueue: any[];
  lastSyncTime: string | null;
  
  // Enhanced features state
  inventoryProducts: Product[];
  loyaltyCustomers: any[];
  syncHistory: any[];
  lastClosingReportDate: string | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  
  setCurrentCashier: (user: User | null) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openSetupWizard: () => void;
  closeSetupWizard: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openKeyboard: (inputElement: HTMLInputElement | HTMLTextAreaElement) => void;
  closeKeyboard: () => void;
  updateKeyboardTargetValue: (value: string) => void;
  setCurrentPage: (page: PosState['currentPage']) => void;

  completeTransaction: (paymentMethod: 'cash' | 'mpesa' | 'credit', creditCustomer?: string) => void;
  reprintTransaction: (transactionId: string) => void;
  saveTransaction: (transaction: Transaction) => void;
  saveCreditCustomer: (customer: CreditCustomer) => void;
  updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => void;
  deleteCreditCustomer: (id: string) => void;
  saveExpense: (expense: Expense) => void;
  saveBusinessSetup: (setup: BusinessSetup) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Sync operations
  addToSyncQueue: (operation: any) => void;
  processSyncQueue: () => void;
  syncFromServer: () => void;
  setOnlineStatus: (isOnline: boolean) => void;

  // Reports
  getDailySales: (date: string) => { cash: number; mpesa: number; credit: number; total: number };
  getDailyClosingReport: (date: string) => ClosingReportData;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getUnpaidCredits: () => CreditCustomer[];

  // Enhanced features actions
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addLoyaltyCustomer: (customer: any) => void;
  updateLoyaltyCustomer: (id: string, updates: any) => void;
  addSyncHistoryItem: (item: any) => void;
  loadInitialData: () => void;
  autoPrintClosingReport: () => void;
  finishSetup: (businessData: Omit<BusinessSetup, 'createdAt'>, adminUser: Omit<User, 'createdAt' | 'isActive'>) => Promise<void>;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      cart: [],
      transactions: [],
      creditCustomers: [],
      users: [],
      expenses: [],
      businessSetup: null,
      currentCashier: null,
      isDataLoaded: false,
      isCheckoutOpen: false,
      isSetupWizardOpen: true,
      isLoginOpen: true,
      isKeyboardOpen: false,
      activeInput: null,
      currentPage: 'pos',
      isOnline: navigator.onLine,
      syncQueue: [],
      lastSyncTime: null,
      lastClosingReportDate: null,

      // User operations
      login: (user) => {
        set((state) => ({
          currentCashier: user,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: true } : null,
        }));
      },
      logout: () => {
        set((state) => ({
          currentCashier: null,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: false } : null,
        }));
      },

      // Product operations
      setProducts: (products) => set({ products }),

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            };
          }
          return {
            cart: [...state.cart, { product, quantity: 1 }]
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.product.id !== productId)
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },

      clearCart: () => set({ cart: [] }),

      // User operations
      setCurrentCashier: (user) => set({ currentCashier: user }),

      // UI operations
      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openSetupWizard: () => set({ isSetupWizardOpen: true }),
      closeSetupWizard: () => set({ isSetupWizardOpen: false }),
      openLogin: () => set({ isLoginOpen: true }),
      closeLogin: () => set({ isLoginOpen: false }),
      openKeyboard: (inputElement) => set({ isKeyboardOpen: true, activeInput: inputElement }),
      closeKeyboard: () => set({ isKeyboardOpen: false, activeInput: null }),
      updateKeyboardTargetValue: (value) => {
        const { activeInput } = get();
        if (activeInput) {
          const currentValue = activeInput.value;
          let newValue;

          if (value === 'backspace') {
            newValue = currentValue.slice(0, -1);
          } else {
            newValue = currentValue + value;
          }

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(activeInput, newValue);
          const event = new Event('input', { bubbles: true });
          activeInput.dispatchEvent(event);
        }
      },
      setCurrentPage: (page) => set({ currentPage: page }),

      // Transaction operations
      completeTransaction: (paymentMethod, creditCustomerName) => {
        const state = get();
        if (!state.currentCashier) return;

        const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const tax = 0; // Assuming tax is handled elsewhere or is 0
        const total = subtotal + tax;

        const transaction: Transaction = {
          id: `TXN${Date.now()}`,
          timestamp: new Date().toISOString(),
          items: [...state.cart],
          subtotal,
          tax,
          total,
          paymentMethod,
          cashier: state.currentCashier.name,
          creditCustomer: creditCustomerName,
          status: 'completed'
        };

        state.saveTransaction(transaction);
        state.addToSyncQueue({ type: 'new-transaction', data: transaction });

        // Handle credit customer
        if (paymentMethod === 'credit' && creditCustomerName) {
            const existingCustomer = state.creditCustomers.find(c => c.name === creditCustomerName);

            if (existingCustomer) {
                const updatedCustomer: Partial<CreditCustomer> = {
                    totalCredit: (existingCustomer.totalCredit || 0) + total,
                    balance: (existingCustomer.balance || 0) + total,
                    transactions: [...(existingCustomer.transactions || []), transaction.id],
                    lastUpdated: new Date().toISOString(),
                };
                state.updateCreditCustomer(existingCustomer.id, updatedCustomer);
            } else {
                // If the customer does not exist, this function should ideally not be called.
                // A new customer should be created through a separate UI flow first.
                // However, to prevent data loss, we can create a new one.
                const newCustomer: CreditCustomer = {
                    id: `CUST${Date.now()}`,
                    name: creditCustomerName,
                    phone: '', // Phone should be added via an "Add Customer" form
                    totalCredit: total,
                    paidAmount: 0,
                    balance: total,
                    transactions: [transaction.id],
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                state.saveCreditCustomer(newCustomer);
            }
        }

        state.clearCart();
        state.closeCheckout();

        if (window.electron && state.businessSetup) {
          window.electron.printReceipt(transaction, state.businessSetup, false);
        }
      },

      reprintTransaction: (transactionId) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === transactionId);
        if (transaction && window.electron && state.businessSetup) {
          window.electron.printReceipt(transaction, state.businessSetup, true);
        }
      },

      saveTransaction: (transaction) => {
        set((state) => {
          const updatedTransactions = [transaction, ...state.transactions];
          saveDataToFile('transactions.json', updatedTransactions);
          return { transactions: updatedTransactions };
        });
      },

      saveCreditCustomer: (customer) => {
        set((state) => {
          const updatedCustomers = [...state.creditCustomers, customer];
          saveDataToFile('credit-customers.json', updatedCustomers);
          return { creditCustomers: updatedCustomers };
        });
      },

      updateCreditCustomer: (id, updates) => {
        set((state) => {
            const updatedCustomers = state.creditCustomers.map(customer =>
                customer.id === id ? { ...customer, ...updates, lastUpdated: new Date().toISOString() } : customer
            );
            saveDataToFile('credit-customers.json', updatedCustomers);
            return { creditCustomers: updatedCustomers };
        });
      },

      addCreditPayment: (customerId: string, amount: number) => {
        const state = get();
        const customer = state.creditCustomers.find(c => c.id === customerId);
        if (!customer) return;

        const newPaidAmount = (customer.paidAmount || 0) + amount;
        const newBalance = (customer.balance || 0) - amount;

        state.updateCreditCustomer(customerId, {
            paidAmount: newPaidAmount,
            balance: Math.max(0, newBalance), // Ensure balance doesn't go negative
        });
      },

      deleteCreditCustomer: (id) => {
        set((state) => {
          const updatedCustomers = state.creditCustomers.filter(customer => customer.id !== id);
          saveDataToFile('credit-customers.json', updatedCustomers);
          return { creditCustomers: updatedCustomers };
        });
      },

      saveExpense: (expense) => {
        set((state) => {
          const updatedExpenses = [expense, ...state.expenses];
          saveDataToFile('expenses.json', updatedExpenses);
          return { expenses: updatedExpenses };
        });
      },

      saveBusinessSetup: (setup) => {
        saveDataToFile('business-setup.json', setup);
        set({ businessSetup: setup });
      },

      // Sync operations
      addToSyncQueue: (operation) => {
        set((state) => ({
          syncQueue: [...state.syncQueue, operation]
        }));
      },

      processSyncQueue: async () => {
        const state = get();
        const apiUrl = state.businessSetup?.apiUrl?.replace(/\/$/, '');
        if (!state.isOnline || state.syncQueue.length === 0 || !apiUrl || !state.businessSetup?.apiKey) return;

        const queue = [...state.syncQueue];
        set({ syncQueue: [] });

        try {
          const response = await fetch(`${apiUrl}/api/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.businessSetup.apiKey}`
            },
            body: JSON.stringify(queue)
          });

          if (!response.ok) {
            throw new Error('Sync failed');
          }
          set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
          console.error('Sync failed:', error);
          set((state) => ({
            syncQueue: [...queue, ...state.syncQueue]
          }));
        }
      },

      syncFromServer: async () => {
        const state = get();
        const apiUrl = state.businessSetup?.apiUrl?.replace(/\/$/, '');
        if (!state.isOnline || !apiUrl || !state.businessSetup?.apiKey) return;

        try {
          const response = await fetch(`${apiUrl}/api/sync`, {
            headers: {
              'Authorization': `Bearer ${state.businessSetup.apiKey}`
            }
          });
          const serverData = await response.json();
          const lastSync = state.lastSyncTime ? new Date(state.lastSyncTime) : new Date(0);

          const mergeData = (local, server) => {
            const serverDataById = new Map(server.map(item => [item.id, item]));
            const localDataById = new Map(local.map(item => [item.id, item]));
            const merged = local.map(localItem => {
              const serverItem = serverDataById.get(localItem.id);
              if (serverItem) {
                const serverTimestamp = new Date(serverItem.updatedAt || serverItem.createdAt);
                const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt);
                if (serverTimestamp > localTimestamp && localTimestamp > lastSync) {
                  // Conflict: server is newer, but local has been changed since last sync.
                  // For now, we prioritize local changes. A better implementation
                  // would flag this for user resolution.
                  return localItem;
                }
                return serverItem; // Server is newer, no local changes.
              }
              return localItem; // Local only.
            });

            server.forEach(serverItem => {
              if (!localDataById.has(serverItem.id)) {
                merged.push(serverItem); // New from server.
              }
            });
            return merged;
          };

          const newProducts = mergeData(state.products, serverData.products || []);
          const newUsers = mergeData(state.users, serverData.users || []);
          const newExpenses = mergeData(state.expenses, serverData.expenses || []);
          const newCreditCustomers = mergeData(state.creditCustomers, serverData.creditCustomers || []);

          let newBusinessSetup = state.businessSetup;
          if (serverData.businessSetup) {
            const serverTimestamp = new Date(serverData.businessSetup.updatedAt || serverData.businessSetup.createdAt);
            const localTimestamp = state.businessSetup ? new Date(state.businessSetup.updatedAt || state.businessSetup.createdAt) : new Date(0);
            if (serverTimestamp > localTimestamp) {
              newBusinessSetup = serverData.businessSetup;
            }
          }

          set({
            products: newProducts,
            users: newUsers,
            expenses: newExpenses,
            creditCustomers: newCreditCustomers,
            businessSetup: newBusinessSetup,
          });

          saveDataToFile('products.json', newProducts);
          saveDataToFile('users.json', newUsers);
          saveDataToFile('expenses.json', newExpenses);
          saveDataToFile('credit-customers.json', newCreditCustomers);
          saveDataToFile('business-setup.json', newBusinessSetup);

        } catch (error) {
          console.error('Failed to sync from server:', error);
        }
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          get().processSyncQueue();
          get().syncFromServer(); // Also pull data when coming online
        }
      },

      // Reports
      getDailySales: (date) => {
        const state = get();
        const dayTransactions = state.transactions.filter(t =>
          t.timestamp.startsWith(date) && t.status === 'completed'
        );

        const cash = dayTransactions
          .filter(t => t.paymentMethod === 'cash')
          .reduce((sum, t) => sum + t.total, 0);

        const mpesa = dayTransactions
          .filter(t => t.paymentMethod === 'mpesa')
          .reduce((sum, t) => sum + t.total, 0);

        const credit = dayTransactions
          .filter(t => t.paymentMethod === 'credit')
          .reduce((sum, t) => sum + t.total, 0);

        return { cash, mpesa, credit, total: cash + mpesa + credit };
      },

      getDailyClosingReport: (date) => {
        const state = get();
        const dayTransactions = state.transactions.filter(t =>
          t.timestamp.startsWith(date) && t.status === 'completed'
        );

        const cashierNames = [...new Set(dayTransactions.map(t => t.cashier))];

        const cashiers: CashierReport[] = cashierNames.map(name => {
          const transactions = dayTransactions.filter(t => t.cashier === name);
          const cashTotal = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
          const mpesaTotal = transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.total, 0);
          const creditTotal = transactions.filter(t => t.paymentMethod === 'credit').reduce((sum, t) => sum + t.total, 0);

          const creditTransactions: CreditTransaction[] = transactions
            .filter(t => t.paymentMethod === 'credit' && t.creditCustomer)
            .map(t => {
              const customer = state.creditCustomers.find(c => c.name === t.creditCustomer);
              const creditSale = customer?.creditSales.find(cs => cs.transactionId === t.id);
              return {
                customerName: t.creditCustomer || 'N/A',
                amount: t.total,
                status: creditSale?.status || 'unpaid',
              };
            });

          return {
            cashierName: name,
            transactions,
            totalSales: cashTotal + mpesaTotal + creditTotal,
            cashTotal,
            mpesaTotal,
            creditTotal,
            creditTransactions,
          };
        });

        const totalCash = cashiers.reduce((sum, c) => sum + c.cashTotal, 0);
        const totalMpesa = cashiers.reduce((sum, c) => sum + c.mpesaTotal, 0);
        const totalCredit = cashiers.reduce((sum, c) => sum + c.creditTotal, 0);

        return {
          date,
          cashiers,
          grandTotal: totalCash + totalMpesa + totalCredit,
          totalCash,
          totalMpesa,
          totalCredit,
        };
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        const state = get();
        return state.transactions.filter(t => {
          const date = new Date(t.timestamp);
          return date >= new Date(startDate) && date <= new Date(endDate);
        });
      },

      getUnpaidCredits: () => {
        const state = get();
        return state.creditCustomers.filter(customer =>
          customer.creditSales.some(sale => sale.status !== 'paid')
        );
      },

      addUser: (user) => {
        set((state) => {
          const updatedUsers = [...state.users, user];
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'add-user', data: user });
          return { users: updatedUsers };
        });
      },

      addProduct: async (product) => {
        const state = get();
        if (product.image && !product.image.startsWith('http')) {
          try {
            const { path: localPath } = await window.electron.saveImage(product.image);
            product.localImage = localPath;

            if (state.isOnline) {
              const { imageUrl } = await window.electron.uploadImage(product.image, state.businessSetup.apiUrl, state.businessSetup.apiKey);
              product.image = imageUrl;
            } else {
              product.image = '';
              state.addToSyncQueue({ type: 'upload-image', data: { productId: product.id, path: product.image } });
            }
          } catch (error) {
            console.error('Image handling failed:', error);
            product.image = '';
          }
        }

        set((state) => {
          const updatedProducts = [...state.products, product];
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'add-product', data: product });
          return { products: updatedProducts };
        });
      },

      updateProduct: async (id, updates) => {
        const state = get();
        if (updates.image && !updates.image.startsWith('http')) {
          try {
            const { path: localPath } = await window.electron.saveImage(updates.image);
            updates.localImage = localPath;

            if (state.isOnline) {
              const { imageUrl } = await window.electron.uploadImage(updates.image, state.businessSetup.apiUrl, state.businessSetup.apiKey);
              updates.image = imageUrl;
            } else {
              updates.image = '';
              state.addToSyncQueue({ type: 'upload-image', data: { productId: id, path: updates.image } });
            }
          } catch (error) {
            console.error('Image handling failed:', error);
            updates.image = '';
          }
        }

        set((state) => {
          const updatedProducts = state.products.map(product =>
            product.id === id ? { ...product, ...updates } : product
          );
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'update-product', data: { id, updates } });
          return { products: updatedProducts };
        });
      },

      deleteProduct: (id) => {
        set((state) => {
          const updatedProducts = state.products.filter(product => product.id !== id);
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'delete-product', data: { id } });
          return { products: updatedProducts };
        });
      },

      updateUser: (id, updates) => {
        set((state) => {
          const updatedUsers = state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          );
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'update-user', data: { id, updates } });
          return { users: updatedUsers };
        });
      },

      deleteUser: (id) => {
        set((state) => {
          const updatedUsers = state.users.filter(user => user.id !== id);
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'delete-user', data: { id } });
          return { users: updatedUsers };
        });
      },

      loadInitialData: async () => {
        try {
          // Prioritize loading business setup first.
          const { data: businessSetupData } = await readDataFromFile('business-setup.json');
          let isSetup = false;
          if (businessSetupData && businessSetupData.isSetup) {
            set({ businessSetup: businessSetupData });
            isSetup = true;
          }

          const fileNames = ['products.json', 'users.json', 'transactions.json', 'credit-customers.json', 'expenses.json'];
          const dataMap = {
            'products.json': 'products',
            'users.json': 'users',
            'transactions.json': 'transactions',
            'credit-customers.json': 'creditCustomers',
            'expenses.json': 'expenses'
          };

          for (const fileName of fileNames) {
            const { data } = await readDataFromFile(fileName);
            if (data) {
              set({ [dataMap[fileName]]: data });
            }
          }

        } catch (error) {
          console.error("Failed to load initial data:", error);
          // Handle error appropriately, maybe set an error state
        } finally {
          set({ isDataLoaded: true });
        }
      },

      autoPrintClosingReport: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (state.lastClosingReportDate !== yesterday && state.lastClosingReportDate !== today) {
          const reportData = state.getDailyClosingReport(yesterday);
          if (reportData.grandTotal > 0 && window.electron && state.businessSetup) {
            window.electron.printClosingReport(reportData, state.businessSetup);
            set({ lastClosingReportDate: yesterday });
          }
        }
      },

      finishSetup: async (businessData, adminUser) => {
        const fullBusinessData: BusinessSetup = {
          ...businessData,
          receiptFooter: 'Developed and Managed by Whiz Tech\nContact: 0740-841-168',
          printerType: businessData.printerType || 'thermal', // Default to thermal
          createdAt: new Date().toISOString(),
        };

        const fullAdminUser: User = {
          ...adminUser,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        // 1. Save the business setup and the first admin user.
        await saveDataToFile('business-setup.json', fullBusinessData);
        await saveDataToFile('users.json', [fullAdminUser]);

        // 2. Update the store's state to reflect that setup is complete.
        set({
          businessSetup: fullBusinessData,
          users: [fullAdminUser],
          products: [],
          transactions: [],
          expenses: [],
          creditCustomers: [],
        });

        // 3. Trigger the business setup printout.
        const printWithRetry = (retries = 5) => {
          if (window.electron && window.electron.printBusinessSetup) {
            window.electron.printBusinessSetup(fullBusinessData, fullAdminUser);
          } else if (retries > 0) {
            setTimeout(() => printWithRetry(retries - 1), 500);
          } else {
            console.error("Failed to print business setup: Electron API not available.");
          }
        };
        printWithRetry();
      },
    }),
    {
      name: 'pos-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.businessSetup = { ...state.businessSetup, isLoggedIn: false };
        }
      },
      partialize: (state) => ({
        businessSetup: state.businessSetup,
        currentCashier: state.currentCashier,
        transactions: state.transactions ? state.transactions.slice(-100) : [],
        creditCustomers: state.creditCustomers,
        users: state.users,
        expenses: state.expenses ? state.expenses.slice(-50) : [],
        lastSyncTime: state.lastSyncTime,
        products: state.products ? state.products.slice(-100) : [],
        inventoryProducts: state.inventoryProducts,
        loyaltyCustomers: state.loyaltyCustomers,
        syncHistory: state.syncHistory ? state.syncHistory.slice(-50) : []
      })
    }
  )
);

// Initial data will be loaded in the main App component.

// Periodically process the sync queue (push)
setInterval(() => {
  usePosStore.getState().processSyncQueue();
}, 60000); // every 60 seconds

// Periodically sync from server (pull)
setInterval(() => {
  usePosStore.getState().syncFromServer();
}, 300000); // every 5 minutes
