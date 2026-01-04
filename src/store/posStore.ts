import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Electron API that will be exposed on the window object
declare global {
  interface Window {
    /**
     * The Electron interface exposed via `preload.js`.
     * Provides secure access to native functionality.
     */
    electron: {
      /**
       * Saves data to a local JSON file.
       */
      saveData: (fileName: string, data: any) => Promise<{ success: boolean; error?: any }>;

      /**
       * Reads data from a local JSON file.
       */
      readData: (fileName: string) => Promise<{ success: boolean; data?: any; error?: any }>;

      /**
       * Prints a transaction receipt.
       */
      printReceipt: (transaction: Transaction, businessSetup: BusinessSetup, isReprint: boolean) => void;

      /**
       * Saves a temporary image to the persistent local storage.
       */
      saveImage: (tempPath: string) => Promise<{ success: boolean; path?: string; fileName?: string; error?: any }>;

      /**
       * Prints the daily closing report.
       */
      printClosingReport: (reportData: ClosingReportData, businessSetup: BusinessSetup, detailed?: boolean) => void;

      /**
       * Prints the initial business setup sheet.
       */
      printBusinessSetup: (businessSetup: BusinessSetup, adminUser: User) => void;

      /**
       * Retrieves the local API configuration (URL, Key, QR).
       */
      getApiConfig: () => Promise<{ apiUrl: string, apiKey: string, qrCodeDataUrl: string }>;

      /**
       * Uploads an image to the remote Back Office server.
       */
      uploadImage: (filePath: string, apiUrl: string, apiKey: string) => Promise<{ imageUrl: string }>;

      /**
       * Gets list of printers.
       */
      getPrinters: () => Promise<any[]>;

      /**
       * Listen for sync updates from mobile.
       */
      onMobileDataSync: (callback: (event: any, payload: any) => void) => void;

      /**
       * Listen for new mobile receipt requests.
       */
      onNewMobileReceipt: (callback: (event: any, receipt: any) => void) => void;

      // Developer Tools
      getDeveloperConfig: () => Promise<{ developerPin: string | null; mongoUri: string; backOfficeUrl: string; backOfficeApiKey: string }>;
      saveDeveloperConfig: (config: { developerPin?: string; mongoUri?: string }) => Promise<{ success: boolean; error?: string }>;
      directDbPush: (mongoUri: string) => Promise<{ success: boolean; error?: string }>;
      directDbPull: (mongoUri: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      savePrinterSettings: (settings: { defaultPrinter: string }) => Promise<{ success: boolean }>;
      getPrinterSettings: () => Promise<{ defaultPrinter: string }>;
      getPrinters: () => Promise<any[]>;
      checkForUpdate: () => void;
      toggleFullscreen: () => void;
      getConnectedDevices: () => Promise<{ ip: string; name: string; lastSeen: string }[]>;
      backupData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
      restoreData: () => Promise<{ success: boolean; error?: string }>;
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

// New Interface for Payment History
export interface CreditPayment {
    id: string;
    customerId: string;
    amount: number;
    date: string;
    cashierId?: string;
    transactionId?: string; // Linked to specific transaction
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

export interface Salary {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  type: 'advance' | 'full';
  notes?: string;
}

export interface BusinessSetup {
  businessName: string;
  businessId?: string;
  apiUrl?: string;
  apiKey?: string;
  backOfficeUrl?: string;
  backOfficeApiKey?: string;
  mongoDbUri?: string;
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
  printerPaperWidth?: number; // Paper width in mm
  isSetup: boolean;
  isLoggedIn: boolean; // Added for login state
  createdAt: string;
  servedByLabel: string;
  mpesaPaybill: string;
  mpesaTill: string;
  mpesaAccountNumber: string;
  tax: number;
  subtotal: number;
  locationName?: string;
  autoLogoffEnabled?: boolean;
  autoLogoffMinutes?: number;
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

export interface ItemSales {
    name: string;
    quantity: number;
    total: number;
}

export interface ClosingReportData {
  date: string;
  cashiers: CashierReport[];
  itemSales: ItemSales[];
  grandTotal: number;
  totalCash: number;
  totalMpesa: number;
  totalCredit: number;
}

export interface InventoryLog {
    id: string;
    productId: number;
    productName: string;
    oldStock: number;
    newStock: number;
    variance: number;
    cashierName: string;
    timestamp: string;
    reason?: string;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  cashTotal: number;
  mpesaTotal: number;
  creditTotal: number;
  expenseTotal: number;
  transactionCount: number;
}

interface PosState {
  // Data
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  dailySummaries: Record<string, DailySummary>; // Archived data
  creditCustomers: CreditCustomer[];
  creditPayments: CreditPayment[];
  inventoryLogs: InventoryLog[];
  users: User[];
  expenses: Expense[];
  salaries: Salary[];
  businessSetup: BusinessSetup | null;
  mobileReceipts: any[];
  
  // UI State
  isDataLoaded: boolean;
  currentCashier: User | null;
  isCheckoutOpen: boolean;
  isSetupWizardOpen: boolean;
  isLoginOpen: boolean;
  isKeyboardOpen: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  keyboardInput: string;
  currentPage: 'pos' | 'reports' | 'customers' | 'settings' | 'closing' | 'dashboard' | 'inventory' | 'loyalty' | 'scanner' | 'sync' | 'register' | 'backoffice' | 'mobile-receipts';
  // Settings
  isOnline: boolean;
  syncQueue: any[];
  lastSyncTime: string | null;
  
  // Enhanced features state
  inventoryProducts: Product[];
  loyaltyCustomers: any[];
  syncHistory: any[];

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
  setKeyboardInput: (value: string) => void;
  setCurrentPage: (page: PosState['currentPage']) => void;

  completeTransaction: (paymentMethod: 'cash' | 'mpesa' | 'credit', creditCustomer?: string) => void;
  reprintTransaction: (transactionId: string) => void;
  reverseTransaction: (transactionId: string) => void;
  saveTransaction: (transaction: Transaction) => void;
  saveCreditCustomer: (customer: CreditCustomer) => void;
  updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => void;
  deleteCreditCustomer: (id: string) => void;
  saveExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addSalary: (salary: Salary) => void;
  deleteSalary: (id: string) => void;
  saveBusinessSetup: (setup: BusinessSetup) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Sync operations
  addToSyncQueue: (operation: any) => void;
  processSyncQueue: () => void;
  syncFromServer: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  handleMobileDataSync: (payload: any) => void;

  // Mobile Receipts
  loadMobileReceipts: () => Promise<void>;
  printMobileReceipt: (receipt: any) => void;
  deleteMobileReceipt: (receipt: any) => void;
  addMobileReceipt: (receipt: any) => void;

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
  finishSetup: (businessData: Omit<BusinessSetup, 'createdAt'>, adminUser: Omit<User, 'createdAt' | 'isActive'>) => Promise<void>;
  pushDataToServer: () => Promise<void>;
  addCreditPayment: (customerId: string, amount: number, transactionId?: string) => void;
  addInventoryLog: (log: InventoryLog) => void;
  archiveTransactions: (daysToKeep: number) => Promise<void>;
}

/**
 * Main Zustand store for the POS application.
 * Handles all state management including products, transactions, users, cart, and sync.
 * Persists data to local storage via 'zustand/middleware'.
 */
export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      cart: [],
      transactions: [],
      dailySummaries: {},
      creditCustomers: [],
      creditPayments: [],
      inventoryLogs: [],
      users: [],
      expenses: [],
      salaries: [],
      businessSetup: null,
      currentCashier: null,
      isDataLoaded: false,
      isCheckoutOpen: false,
      isSetupWizardOpen: true,
      isLoginOpen: true,
      isKeyboardOpen: false,
      activeInput: null,
      keyboardInput: '',
      currentPage: 'pos',
      isOnline: navigator.onLine,
      syncQueue: [],
      lastSyncTime: null,
      mobileReceipts: [],

      /**
       * Logs in a user and updates the session state.
       */
      login: (user) => {
        set((state) => ({
          currentCashier: user,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: true } : null,
        }));
      },

      /**
       * Logs out the current user.
       */
      logout: () => {
        set((state) => ({
          currentCashier: null,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: false } : null,
        }));
      },

      // Product operations
      setProducts: (products) => set({ products }),

      /**
       * Adds a product to the shopping cart.
       * Increments quantity if product already exists.
       */
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

      /**
       * Updates the value of the active input field based on on-screen keyboard input.
       * Dispatches a native 'input' event to ensure React state updates.
       */
      updateKeyboardTargetValue: (value) => {
        const { activeInput, closeKeyboard } = get();
        if (!activeInput) return;

        if (value === 'enter') {
          closeKeyboard();
          return;
        }

        const { selectionStart, selectionEnd, value: currentValue } = activeInput;
        const start = selectionStart || 0;
        const end = selectionEnd || 0;

        let newValue;
        let newCursorPos = start;

        if (value === 'backspace') {
          if (start === end && start > 0) {
            newValue = currentValue.slice(0, start - 1) + currentValue.slice(end);
            newCursorPos = start - 1;
          } else {
            newValue = currentValue.slice(0, start) + currentValue.slice(end);
            newCursorPos = start;
          }
        } else {
          newValue = currentValue.slice(0, start) + value + currentValue.slice(end);
          newCursorPos = start + value.length;
        }

        // Use the native value setter to ensure React detects the change
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;

        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (activeInput instanceof HTMLInputElement && nativeInputValueSetter) {
          nativeInputValueSetter.call(activeInput, newValue);
        } else if (activeInput instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(activeInput, newValue);
        } else {
          activeInput.value = newValue;
        }

        const event = new Event('input', { bubbles: true });
        activeInput.dispatchEvent(event);
        activeInput.selectionStart = activeInput.selectionEnd = newCursorPos;
      },
      setKeyboardInput: (value) => set({ keyboardInput: value }),
      setCurrentPage: (page) => set({ currentPage: page }),

      // Transaction operations
      /**
       * Completes a transaction, saves it, updates credit if needed, and prints receipt.
       */
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

        // Update Stock
        transaction.items.forEach(item => {
           if (item.product.id) {
               // Decrease local stock if managed
               const product = state.products.find(p => p.id === item.product.id);
               if (product && typeof product.stock === 'number') {
                   state.updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
               }
           }
        });

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

      reverseTransaction: (transactionId) => {
         set((state) => {
             const transaction = state.transactions.find(t => t.id === transactionId);
             if (!transaction) return {};

             // 1. Mark transaction as refunded or remove it? User said "reversed or deleted".
             // Refunded status preserves history but filters can hide it. Deleted removes it.
             // Let's go with "refunded" status update for audit trail, but filter out from reports if needed.
             // Actually, user said "sale can be fully reversed or deleted".
             // Let's implement Delete for simplicity to match "deleted" requirement.
             const updatedTransactions = state.transactions.filter(t => t.id !== transactionId);

             // 2. Restore Stock
             if (transaction.items) {
                 transaction.items.forEach(item => {
                     const product = state.products.find(p => p.id === item.product.id);
                     if (product && typeof product.stock === 'number') {
                         // We can't call state.updateProduct here easily because we are inside set()
                         // So we map products directly.
                         // But we should use the update logic to ensure consistency.
                         // Since we are in set(), we can update products array.
                     }
                 });
             }

             // Re-map products to restore stock
             const updatedProducts = state.products.map(p => {
                 const item = transaction.items.find(i => i.product.id === p.id);
                 if (item) {
                     return { ...p, stock: (p.stock || 0) + item.quantity };
                 }
                 return p;
             });

             // 3. Handle Credit Reversal if applicable
             let updatedCreditCustomers = state.creditCustomers;
             if (transaction.paymentMethod === 'credit' && transaction.creditCustomer) {
                 updatedCreditCustomers = state.creditCustomers.map(c => {
                     if (c.name === transaction.creditCustomer) {
                         return {
                             ...c,
                             totalCredit: Math.max(0, (c.totalCredit || 0) - transaction.total),
                             balance: Math.max(0, (c.balance || 0) - transaction.total),
                             transactions: c.transactions.filter(tid => tid !== transactionId),
                             lastUpdated: new Date().toISOString()
                         };
                     }
                     return c;
                 });
             }

             // Save changes
             saveDataToFile('transactions.json', updatedTransactions);
             saveDataToFile('products.json', updatedProducts);
             saveDataToFile('credit-customers.json', updatedCreditCustomers);

             // Sync deletion/updates
             state.addToSyncQueue({ type: 'delete-transaction', data: { id: transactionId } });
             // For products and customers, we queue updates
             // Ideally we should queue individual product updates but for bulk restore...
             // Let's just queue the delete-transaction and let backend handle logic?
             // No, offline first. We need to queue updates.
             transaction.items.forEach(item => {
                 state.addToSyncQueue({ type: 'update-product', data: { id: item.product.id, updates: { stock: (item.product.stock || 0) + item.quantity } } });
             });

             return {
                 transactions: updatedTransactions,
                 products: updatedProducts,
                 creditCustomers: updatedCreditCustomers
             };
         });
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
          state.addToSyncQueue({ type: 'add-credit-customer', data: customer });
          return { creditCustomers: updatedCustomers };
        });
      },

      updateCreditCustomer: (id, updates) => {
        set((state) => {
            const updatedCustomers = state.creditCustomers.map(customer =>
                customer.id === id ? { ...customer, ...updates, lastUpdated: new Date().toISOString() } : customer
            );
            saveDataToFile('credit-customers.json', updatedCustomers);
            state.addToSyncQueue({ type: 'update-credit-customer', data: { id, updates } });
            return { creditCustomers: updatedCustomers };
        });
      },

      addCreditPayment: (customerId: string, amount: number, transactionId?: string) => {
        set((state) => {
            const customer = state.creditCustomers.find(c => c.id === customerId);
            if (!customer) return {};

            const newPaidAmount = (customer.paidAmount || 0) + amount;
            const newBalance = (customer.balance || 0) - amount;

            const payment: CreditPayment = {
                id: `CP${Date.now()}`,
                customerId,
                amount,
                date: new Date().toISOString(),
                cashierId: state.currentCashier?.id,
                transactionId
            };

            const updatedPayments = [...state.creditPayments, payment];
            saveDataToFile('credit-payments.json', updatedPayments); // Assuming new file
            state.addToSyncQueue({ type: 'add-credit-payment', data: payment });

            const updatedCustomers = state.creditCustomers.map(c =>
                c.id === customerId
                ? { ...c, paidAmount: newPaidAmount, balance: Math.max(0, newBalance) }
                : c
            );
            saveDataToFile('credit-customers.json', updatedCustomers);
            state.addToSyncQueue({ type: 'update-credit-customer', data: { id: customerId, updates: { paidAmount: newPaidAmount, balance: newBalance } } });

            return {
                creditPayments: updatedPayments,
                creditCustomers: updatedCustomers
            };
        });
      },

      addInventoryLog: (log: InventoryLog) => {
          set((state) => {
              const updatedLogs = [log, ...state.inventoryLogs];
              saveDataToFile('inventory-logs.json', updatedLogs);
              state.addToSyncQueue({ type: 'add-inventory-log', data: log });
              return { inventoryLogs: updatedLogs };
          });
      },

      deleteCreditCustomer: (id) => {
        set((state) => {
          const updatedCustomers = state.creditCustomers.filter(customer => customer.id !== id);
          saveDataToFile('credit-customers.json', updatedCustomers);
          state.addToSyncQueue({ type: 'delete-credit-customer', data: { id } });
          return { creditCustomers: updatedCustomers };
        });
      },

      saveExpense: (expense) => {
        set((state) => {
          const updatedExpenses = [expense, ...state.expenses];
          saveDataToFile('expenses.json', updatedExpenses);
          state.addToSyncQueue({ type: 'add-expense', data: expense });
          return { expenses: updatedExpenses };
        });
      },

  updateExpense: (id, updates) => {
    set((state) => {
      const updatedExpenses = state.expenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      );
      saveDataToFile('expenses.json', updatedExpenses);
      // Ensure data has the ID for the backend to identify it
      state.addToSyncQueue({ type: 'update-expense', data: { id, updates } });
      return { expenses: updatedExpenses };
    });
  },

  deleteExpense: (id) => {
    set((state) => {
      const updatedExpenses = state.expenses.filter(expense => expense.id !== id);
      saveDataToFile('expenses.json', updatedExpenses);
      state.addToSyncQueue({ type: 'delete-expense', data: { id } });
      return { expenses: updatedExpenses };
    });
  },

      addSalary: (salary) => {
        set((state) => {
          const updatedSalaries = [salary, ...state.salaries];
          saveDataToFile('salaries.json', updatedSalaries);
          state.addToSyncQueue({ type: 'add-salary', data: salary });
          return { salaries: updatedSalaries };
        });
      },

      deleteSalary: (id) => {
        set((state) => {
          const updatedSalaries = state.salaries.filter(s => s.id !== id);
          saveDataToFile('salaries.json', updatedSalaries);
          state.addToSyncQueue({ type: 'delete-salary', data: { id } });
          return { salaries: updatedSalaries };
        });
      },

      saveBusinessSetup: (setup) => {
        saveDataToFile('business-setup.json', setup);
        set((state) => {
            state.addToSyncQueue({ type: 'update-business-setup', data: setup });
            return { businessSetup: setup };
        });
      },

      // Sync operations
      addToSyncQueue: (operation) => {
        set((state) => ({
          syncQueue: [...state.syncQueue, operation]
        }));
        // Trigger sync immediately for real-time updates
        get().processSyncQueue();
      },

      processSyncQueue: async () => {
        const state = get();
        const apiUrl = (state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;
        const mongoDbUri = state.businessSetup?.mongoDbUri;

        if (!state.isOnline || state.syncQueue.length === 0) return;

        // Use Direct DB Push if available (Preferred for robustness)
        if (mongoDbUri && window.electron && window.electron.directDbPush) {
             console.log("Auto-Sync: Triggering Direct DB Push...");
             // Note: directDbPush sends the ENTIRE state from JSON files, not just the queue.
             // This is safer and ensures consistency.
             // We can clear the queue optimistically since the DB push covers these changes.
             const queue = [...state.syncQueue];
             set({ syncQueue: [] });

             try {
                 const result = await window.electron.directDbPush(mongoDbUri);
                 if (result.success) {
                     console.log("Auto-Sync: Direct DB Push Successful");
                     set({ lastSyncTime: new Date().toISOString() });
                     get().syncFromServer(); // Pull updates
                     return;
                 } else {
                     console.error("Auto-Sync: Direct DB Push Failed, falling back to API...", result.error);
                     // Put items back in queue to try API or retry later
                     set((state) => ({ syncQueue: [...queue, ...state.syncQueue] }));
                 }
             } catch (e) {
                 console.error("Auto-Sync: Direct DB Push Exception", e);
                 set((state) => ({ syncQueue: [...queue, ...state.syncQueue] }));
             }
        }

        // Fallback to Legacy HTTP API Sync
        if (!apiUrl || !apiKey) return;

        const queue = [...state.syncQueue];
        set({ syncQueue: [] }); // Optimistically clear queue

        try {
          const response = await fetch(`${apiUrl}/api/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(queue)
          });

          if (!response.ok) {
            throw new Error(`Sync failed with status: ${response.status}`);
          }

          // Sync successful, update time and trigger a pull to get any updates
          set({ lastSyncTime: new Date().toISOString() });
          get().syncFromServer();

        } catch (error) {
          console.error('Sync failed:', error);
          // On total failure (network), put items back in queue
          set((state) => ({
            syncQueue: [...queue, ...state.syncQueue]
          }));
        }
      },

      syncFromServer: async () => {
        const state = get();
        const apiUrl = (state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;
        const mongoDbUri = state.businessSetup?.mongoDbUri;

        // Add debug logging for diagnosis
        if (!state.isOnline) { console.debug("Sync skipped: Offline"); return; }

        let serverData: any = null;

        // Direct MongoDB Pull (Preferred)
        if (mongoDbUri && window.electron && window.electron.directDbPull) {
            console.log("Initiating Direct MongoDB Pull...");
            try {
                const result = await window.electron.directDbPull(mongoDbUri);
                if (result.success && result.data) {
                    console.log("Direct MongoDB Pull Successful");
                    serverData = result.data;
                } else {
                    console.error("Direct MongoDB Pull Failed:", result.error);
                }
            } catch (e) {
                console.error("Direct MongoDB Pull Exception:", e);
            }
        }

        // Fallback to HTTP Sync
        if (!serverData) {
            if (!apiUrl) { console.debug("Sync skipped: No API URL"); return; }
            if (!apiKey) { console.debug("Sync skipped: No API Key"); return; }

            try {
              console.debug(`Syncing from server: ${apiUrl}/api/sync`);
              const response = await fetch(`${apiUrl}/api/sync`, {
                headers: {
                  'Authorization': `Bearer ${apiKey}`
                }
              });

              if (!response.ok) {
                 console.error(`Sync fetch failed: ${response.status} ${response.statusText}`);
                 return;
              }

              serverData = await response.json();
            } catch (error) {
              console.error('Failed to sync from server:', error);
              return;
            }
        }

        if (!serverData) return;

        try {
          const mergeData = (local: any[], server: any[]) => {
            const validServerItems = server.filter(item => item.id != null);
            const serverDataById = new Map(validServerItems.map(item => [item.id, item]));
            const localDataById = new Map(local.map(item => [item.id, item]));

            const merged = local.map(localItem => {
              const serverItem = serverDataById.get(localItem.id);
              if (serverItem) {
                const serverTimestamp = new Date(serverItem.updatedAt || serverItem.createdAt || 0);
                const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt || 0);
                if (serverTimestamp.getTime() > localTimestamp.getTime()) {
                     return serverItem;
                }
                return localItem;
              }
              return localItem;
            });

            validServerItems.forEach(serverItem => {
              if (!localDataById.has(serverItem.id)) {
                merged.push(serverItem);
              }
            });
            return merged;
          };

          const newProducts = mergeData(state.products, serverData.products || []);
          const newUsers = mergeData(state.users, serverData.users || []);
          const newExpenses = mergeData(state.expenses, serverData.expenses || []);
          const newSalaries = mergeData(state.salaries, serverData.salaries || []);
          const newCreditCustomers = mergeData(state.creditCustomers, serverData.creditCustomers || []);

          let newBusinessSetup = state.businessSetup;
          if (serverData.businessSetup) {
            const serverTimestamp = new Date(serverData.businessSetup.updatedAt || serverData.businessSetup.createdAt || 0);
            const localTimestamp = state.businessSetup ? new Date(state.businessSetup.updatedAt || state.businessSetup.createdAt || 0) : new Date(0);
            if (serverTimestamp > localTimestamp) {
              newBusinessSetup = { ...state.businessSetup, ...serverData.businessSetup };
            }
          }

          set({
            products: newProducts as Product[],
            users: newUsers as User[],
            expenses: newExpenses as Expense[],
            salaries: newSalaries as Salary[],
            creditCustomers: newCreditCustomers as CreditCustomer[],
            businessSetup: newBusinessSetup as BusinessSetup,
          });

          saveDataToFile('products.json', newProducts);
          saveDataToFile('users.json', newUsers);
          saveDataToFile('expenses.json', newExpenses);
          saveDataToFile('salaries.json', newSalaries);
          saveDataToFile('credit-customers.json', newCreditCustomers);
          saveDataToFile('business-setup.json', newBusinessSetup);

        } catch (error) {
          console.error('Failed to process sync data:', error);
        }
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          get().processSyncQueue();
          get().syncFromServer(); // Also pull data when coming online
        }
      },

      // Handle data synced from mobile (bridge)
      handleMobileDataSync: (payload: any) => {
        if (!Array.isArray(payload)) payload = [payload];

        payload.forEach(item => {
            const { type, data } = item;

            // Add to sync queue for Back Office propagation
            get().addToSyncQueue({ type, data });

            // Update local state immediately for UI responsiveness
            if (type === 'new-transaction' || type === 'transaction') {
               set(state => {
                   if (state.transactions.some(t => t.id === data.id)) return {};
                   return { transactions: [data, ...state.transactions] };
               });
            } else if (type === 'add-expense') {
               set(state => {
                   if (state.expenses.some(e => (e.id || (e as any).expenseId) === (data.id || data.expenseId))) return {};
                   return { expenses: [data, ...state.expenses] };
               });
            } else if (type === 'add-salary') {
               set(state => {
                   if (state.salaries.some(s => s.id === data.id)) return {};
                   return { salaries: [data, ...state.salaries] };
               });
            } else if (type === 'add-credit-customer') {
               set(state => {
                   if (state.creditCustomers.some(c => c.id === data.id)) return {};
                   return { creditCustomers: [...state.creditCustomers, data] };
               });
            } else if (type === 'update-credit-customer') {
               set(state => {
                   return {
                       creditCustomers: state.creditCustomers.map(c =>
                           c.id === data.id ? { ...c, ...data.updates } : c
                       )
                   };
               });
            }
        });
      },

      // Mobile Receipts Logic
      loadMobileReceipts: async () => {
        const { data } = await readDataFromFile('mobile-receipts.json');
        if (data) set({ mobileReceipts: data });
      },

      addMobileReceipt: (receipt) => {
        set(state => ({ mobileReceipts: [...state.mobileReceipts, receipt] }));
      },

      printMobileReceipt: (receipt) => {
        const state = get();
        if (window.electron) {
            window.electron.printReceipt(receipt, state.businessSetup, true);
            state.deleteMobileReceipt(receipt);
        }
      },

      deleteMobileReceipt: (receipt) => {
        set(state => {
            const newReceipts = state.mobileReceipts.filter(r => r._printId !== receipt._printId);
            saveDataToFile('mobile-receipts.json', newReceipts);
            return { mobileReceipts: newReceipts };
        });
      },

      // Reports
      getDailySales: (date: string) => {
        const state = get();

        // Check archived summaries first
        if (state.dailySummaries && state.dailySummaries[date]) {
            const s = state.dailySummaries[date];
            return { cash: s.cashTotal, mpesa: s.mpesaTotal, credit: s.creditTotal, total: s.totalSales };
        }

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

        // Group by Cashier first
        const cashierNames = [...new Set(dayTransactions.map(t => t.cashier || 'Unknown'))];

        const cashiers: any[] = cashierNames.map(name => {
          const transactions = dayTransactions.filter(t => (t.cashier || 'Unknown') === name);
          const cashTotal = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
          const mpesaTotal = transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.total, 0);
          const creditTotal = transactions.filter(t => t.paymentMethod === 'credit').reduce((sum, t) => sum + t.total, 0);

          // Items sold by this cashier
          const itemSalesMap = new Map<string, { name: string; quantity: number; total: number }>();
          transactions.forEach(t => {
              t.items.forEach(item => {
                  const name = item.product.name;
                  if (!itemSalesMap.has(name)) {
                      itemSalesMap.set(name, { name, quantity: 0, total: 0 });
                  }
                  const record = itemSalesMap.get(name)!;
                  record.quantity += item.quantity;
                  record.total += (item.quantity * item.product.price);
              });
          });
          const items = Array.from(itemSalesMap.values()).sort((a, b) => b.total - a.total);

          return {
            cashierName: name,
            items,
            transactions,
            totalSales: cashTotal + mpesaTotal + creditTotal,
            cashTotal,
            mpesaTotal,
            creditTotal,
          };
        });

        const totalCash = cashiers.reduce((sum, c) => sum + c.cashTotal, 0);
        const totalMpesa = cashiers.reduce((sum, c) => sum + c.mpesaTotal, 0);
        const totalCredit = cashiers.reduce((sum, c) => sum + c.creditTotal, 0);

        return {
          date,
          cashiers,
          itemSales: [], // Redundant for this report style but kept for type compat
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
        return state.creditCustomers.filter(customer => (customer.balance || 0) > 0);
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
            // Check if we have env vars to override/set defaults for Back Office
            const updatedBusinessSetup = { ...businessSetupData };
            if (!updatedBusinessSetup.backOfficeUrl && import.meta.env.VITE_BACK_OFFICE_URL) {
                updatedBusinessSetup.backOfficeUrl = import.meta.env.VITE_BACK_OFFICE_URL;
            }
            if (!updatedBusinessSetup.backOfficeApiKey && import.meta.env.VITE_BACK_OFFICE_API_KEY) {
                updatedBusinessSetup.backOfficeApiKey = import.meta.env.VITE_BACK_OFFICE_API_KEY;
            }

            set({ businessSetup: updatedBusinessSetup });
            isSetup = true;
          } else if (businessSetupData && !businessSetupData.isSetup) {
             // Pre-fill setup data if available from env, even if not setup
              const prefillSetup = { ...businessSetupData };
              if (import.meta.env.VITE_BACK_OFFICE_URL) prefillSetup.backOfficeUrl = import.meta.env.VITE_BACK_OFFICE_URL;
              if (import.meta.env.VITE_BACK_OFFICE_API_KEY) prefillSetup.backOfficeApiKey = import.meta.env.VITE_BACK_OFFICE_API_KEY;
              set({ businessSetup: prefillSetup });
          }

          const fileNames = ['products.json', 'users.json', 'transactions.json', 'credit-customers.json', 'expenses.json', 'salaries.json', 'credit-payments.json', 'inventory-logs.json', 'daily-summaries.json'];
          const dataMap = {
            'products.json': 'products',
            'users.json': 'users',
            'transactions.json': 'transactions',
            'credit-customers.json': 'creditCustomers',
            'expenses.json': 'expenses',
            'salaries.json': 'salaries',
            'credit-payments.json': 'creditPayments',
            'inventory-logs.json': 'inventoryLogs',
            'daily-summaries.json': 'dailySummaries'
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
          salaries: [],
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

      archiveTransactions: async (daysToKeep) => {
          const state = get();
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
          cutoffDate.setHours(0, 0, 0, 0);

          const toKeep: Transaction[] = [];
          const toArchive: Transaction[] = [];

          state.transactions.forEach(t => {
              const tDate = new Date(t.timestamp);
              if (tDate < cutoffDate) {
                  toArchive.push(t);
              } else {
                  toKeep.push(t);
              }
          });

          if (toArchive.length === 0) return;

          const newSummaries = { ...(state.dailySummaries || {}) };

          toArchive.forEach(t => {
              // Use local date string YYYY-MM-DD
              const date = new Date(t.timestamp).toLocaleDateString('en-CA');

              if (!newSummaries[date]) {
                  newSummaries[date] = {
                      date,
                      totalSales: 0,
                      cashTotal: 0,
                      mpesaTotal: 0,
                      creditTotal: 0,
                      expenseTotal: 0,
                      transactionCount: 0
                  };
              }
              const s = newSummaries[date];
              s.totalSales += t.total;
              s.transactionCount += 1;
              if (t.paymentMethod === 'cash') s.cashTotal += t.total;
              if (t.paymentMethod === 'mpesa') s.mpesaTotal += t.total;
              if (t.paymentMethod === 'credit') s.creditTotal += t.total;
          });

          set({ transactions: toKeep, dailySummaries: newSummaries });
          await saveDataToFile('transactions.json', toKeep);
          await saveDataToFile('daily-summaries.json', newSummaries);
      },

      pushDataToServer: async () => {
        const state = get();
        // Use backOfficeUrl if available, fallback to apiUrl (legacy)
        const rawUrl = state.businessSetup?.backOfficeUrl || state.businessSetup?.apiUrl;
        const apiKey = state.businessSetup?.backOfficeApiKey || state.businessSetup?.apiKey;
        const mongoDbUri = state.businessSetup?.mongoDbUri;

        if (!state.isOnline) {
            console.error("Cannot push data: App is offline");
            return;
        }

        // Direct MongoDB Push (Preferred)
        if (mongoDbUri && window.electron && window.electron.directDbPush) {
            console.log("Initiating Direct MongoDB Sync...");
            try {
                const result = await window.electron.directDbPush(mongoDbUri);
                if (result.success) {
                    console.log("Direct MongoDB Sync Successful");
                    set({ lastSyncTime: new Date().toISOString() });
                    return;
                } else {
                    console.error("Direct MongoDB Sync Failed:", result.error);
                    // Fallback to HTTP if failed? Or just stop. User says "this method will work 100%".
                    // We can try fallback.
                }
            } catch (e) {
                console.error("Direct MongoDB Sync Exception:", e);
            }
        }

        const apiUrl = rawUrl?.replace(/\/$/, '');

        if (!apiUrl) {
            console.error("Cannot push data: No Back Office URL configured");
            return;
        }
        if (!apiKey) {
            console.error("Cannot push data: No Back Office API Key configured");
            return;
        }

        try {
            const payload = {
                products: state.products,
                users: state.users,
                expenses: state.expenses,
                salaries: state.salaries,
                customers: state.creditCustomers,
                transactions: state.transactions,
                businessSetup: state.businessSetup
            };

            const response = await fetch(`${apiUrl}/api/sync/full`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-API-KEY': apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Full sync failed');
            }
            console.log("Full sync successful");
            set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
            console.error('Full sync error:', error);
        }
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
        dailySummaries: state.dailySummaries,
        creditCustomers: state.creditCustomers,
        creditPayments: state.creditPayments,
        inventoryLogs: state.inventoryLogs, // Persist inventory logs
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

// Sync intervals are now managed in App.tsx to ensure proper lifecycle and state access
