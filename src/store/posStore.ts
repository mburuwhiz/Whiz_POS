import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Product, CartItem, Transaction, CreditCustomer, User, Supplier, Expense, Salary, BusinessSetup, ClosingReportData, InventoryLog, DailySummary, SavedDocument
} from '../types/index';

export interface PosState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  dailySummaries: Record<string, DailySummary>;
  creditCustomers: CreditCustomer[];
  creditPayments: any[];
  inventoryLogs: InventoryLog[];
  users: User[];
  suppliers: Supplier[];
  expenses: Expense[];
  salaries: Salary[];
  documents: SavedDocument[];
  businessSetup: BusinessSetup | null;
  mobileReceipts: any[];
  loyaltyCustomers: any[];
  isDataLoaded: boolean;
  currentCashier: User | null;
  isCheckoutOpen: boolean;
  isSetupWizardOpen: boolean;
  isLoginOpen: boolean;
  isKeyboardOpen: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  keyboardInput: string;
  currentPage: 'pos' | 'reports' | 'customers' | 'settings' | 'closing' | 'dashboard' | 'inventory' | 'loyalty' | 'scanner' | 'sync' | 'register' | 'backoffice' | 'mobile-receipts';
  isOnline: boolean;
  syncQueue: any[];
  lastSyncTime: string | null;
  isSidebarCollapsed: boolean;
  sessionToken: string | null;
  isTransactionSuccessPopupOpen: boolean;
  lastCompletedTransaction: Transaction | null;
  inventoryProducts: Product[];
  syncHistory: any[];
  categories: string[];

  login: (user: User) => void;
  setSession: (user: User, token: string) => void;
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
  setCurrentPage: (page: any) => void;
  openTransactionSuccessPopup: (transaction: Transaction) => void;
  closeTransactionSuccessPopup: () => void;
  completeTransaction: (paymentMethod: any, creditCustomer?: string, additionalData?: any) => void;
  reprintTransaction: (transactionId: string) => void;
  reverseTransaction: (transactionId: string) => void;
  saveTransaction: (transaction: Transaction) => void;
  saveCreditCustomer: (customer: CreditCustomer) => void;
  updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => void;
  deleteCreditCustomer: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addLoyaltyCustomer: (customer: any) => void;
  updateLoyaltyCustomer: (id: string, updates: Partial<any>) => void;
  deleteTransactions: (ids: string[]) => void;
  addSalary: (salary: Salary) => void;
  deleteSalary: (id: string) => void;
  saveBusinessSetup: (setup: BusinessSetup) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  migrateLegacyExpenses: () => Promise<void>;
  saveDocument: (doc: SavedDocument) => void;
  deleteDocument: (id: string) => void;
  addToSyncQueue: (operation: any) => void;
  processSyncQueue: () => void;
  syncFromServer: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  handleMobileDataSync: (payload: any) => void;
  loadMobileReceipts: () => Promise<void>;
  printMobileReceipt: (receipt: any) => void;
  deleteMobileReceipt: (receipt: any) => void;
  addMobileReceipt: (receipt: any) => void;
  getDailySales: (date: string) => { cash: number; mpesa: number; credit: number; total: number };
  getDailyClosingReport: (date: string) => ClosingReportData;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getUnpaidCredits: () => CreditCustomer[];
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  setCategories: (categories: string[]) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  loadInitialData: () => void;
  finishSetup: (businessData: any, adminUser: any) => Promise<void>;
  pushDataToServer: () => Promise<void>;
  addCreditPayment: (customerId: string, amount: number, transactionId?: string) => void;
  addInventoryLog: (log: InventoryLog) => void;
  archiveTransactions: (daysToKeep: number) => Promise<void>;
  loadUsers: () => Promise<void>;
  toggleSidebar: () => void;
  addSyncHistoryItem: (item: any) => void;
}

const saveDataToFile = async (fileName: string, data: any) => {
  if ((window as any).electron && (window as any).electron.saveData) {
    try {
      return await (window as any).electron.saveData(fileName, data);
    } catch (e) {
      return { success: false, error: e };
    }
  }
  return { success: true };
};

const readDataFromFile = async (fileName: string) => {
  if ((window as any).electron && (window as any).electron.readData) {
    return await (window as any).electron.readData(fileName);
  }
  return { success: false, error: 'Electron API not available' };
};

export const usePosStore = create<PosState>()(
  persist(
    (set: any, get: any): any => ({
      products: [],
      cart: [],
      transactions: [],
      dailySummaries: {},
      creditCustomers: [],
      creditPayments: [],
      inventoryLogs: [],
      users: [],
      suppliers: [],
      expenses: [],
      salaries: [],
      documents: [],
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
      sessionToken: null,
      isSidebarCollapsed: false,
      categories: ['Coffee', 'Tea', 'Pastries', 'Sandwiches', 'Cold Drinks', 'Others'],
      isTransactionSuccessPopupOpen: false,
      lastCompletedTransaction: null,
      inventoryProducts: [],
      syncHistory: [],

      login: async (user: User) => {},
      setSession: (user: User, token: string) => {
          set((state: any) => ({
              currentCashier: user,
              businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: true } : null,
              sessionToken: token
          }));
      },
      logout: async () => {
        const state = get();
        if (state.sessionToken && (window as any).electron && (window as any).electron.auth) {
             await (window as any).electron.auth.logout(state.sessionToken);
        }
        set((state: any) => ({
          currentCashier: null,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: false } : null,
          sessionToken: null
        }));
      },
      setProducts: (products: Product[]) => set({ products }),
      addToCart: (product: Product) => {
        set((state: any) => {
          const existingItem = state.cart.find((item: any) => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item: any) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        });
      },
      removeFromCart: (productId: number) => set((state: any) => ({ cart: state.cart.filter((item: any) => item.product.id !== productId) })),
      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) { get().removeFromCart(productId); return; }
        set((state: any) => ({
          cart: state.cart.map((item: any) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }));
      },
      clearCart: () => set({ cart: [] }),
      setCurrentCashier: (user: User | null) => set({ currentCashier: user }),
      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openSetupWizard: () => set({ isSetupWizardOpen: true }),
      closeSetupWizard: () => set({ isSetupWizardOpen: false }),
      openLogin: () => set({ isLoginOpen: true }),
      closeLogin: () => set({ isLoginOpen: false }),
      openKeyboard: (inputElement: HTMLInputElement | HTMLTextAreaElement) => set({ isKeyboardOpen: true, activeInput: inputElement }),
      closeKeyboard: () => set({ isKeyboardOpen: false, activeInput: null }),
      updateKeyboardTargetValue: (value: string) => {
        const { activeInput, closeKeyboard } = get();
        if (!activeInput) return;
        if (value === 'enter') { closeKeyboard(); return; }
        const { selectionStart, selectionEnd, value: currentValue } = activeInput;
        const start = selectionStart || 0;
        const end = selectionEnd || 0;
        let newValue: string;
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
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
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
      setKeyboardInput: (value: string) => set({ keyboardInput: value }),
      setCurrentPage: (page: any) => set({ currentPage: page }),
      openTransactionSuccessPopup: (transaction: Transaction) => set({ isTransactionSuccessPopupOpen: true, lastCompletedTransaction: transaction }),
      closeTransactionSuccessPopup: () => set({ isTransactionSuccessPopupOpen: false, lastCompletedTransaction: null }),
      completeTransaction: (paymentMethod: any, creditCustomerName: any, additionalData: any) => {
        const state = get();
        if (!state.currentCashier) return;
        const subtotal = state.cart.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        const total = subtotal;
        const transaction: any = {
          id: `TXN${Date.now()}`,
          timestamp: new Date().toISOString(),
          items: [...state.cart],
          subtotal,
          tax: 0,
          total,
          paymentMethod,
          cashier: state.currentCashier.name,
          creditCustomer: creditCustomerName,
          status: 'completed' as const,
          ...additionalData
        };
        if ((state.businessSetup as any)?.disableReceiptPrinting) {
            state.openTransactionSuccessPopup(transaction);
        }
        state.clearCart();
        state.closeCheckout();
        state.saveTransaction(transaction);
        state.addToSyncQueue({ type: 'new-transaction', data: transaction });
        transaction.items.forEach((item: any) => {
           if (item.product.id) {
               const product = state.products.find((p: any) => p.id === item.product.id);
               if (product && typeof product.stock === 'number') {
                   state.updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
               }
           }
        });
        if (paymentMethod === 'credit' && creditCustomerName) {
            const existingCustomer = state.creditCustomers.find((c: any) => c.name === creditCustomerName);
            if (existingCustomer) {
                state.updateCreditCustomer(existingCustomer.id, {
                    totalCredit: (existingCustomer.totalCredit || 0) + total,
                    balance: (existingCustomer.balance || 0) + total,
                    transactions: [...(existingCustomer.transactions || []), transaction.id],
                    lastUpdated: new Date().toISOString(),
                });
            } else {
                state.saveCreditCustomer({
                    id: `CUST${Date.now()}`,
                    name: creditCustomerName,
                    phone: '',
                    totalCredit: total,
                    paidAmount: 0,
                    balance: total,
                    transactions: [transaction.id],
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            }
        }
        if (!((state.businessSetup as any)?.disableReceiptPrinting) && (window as any).electron && state.businessSetup) {
            (window as any).electron.printReceipt(transaction, state.businessSetup, false);
        }
      },
      reprintTransaction: (transactionId: string) => {
        const state = get();
        const transaction = state.transactions.find((t: any) => t.id === transactionId);
        if (transaction && (window as any).electron && state.businessSetup) {
          (window as any).electron.printReceipt(transaction, state.businessSetup, true);
        }
      },
      reverseTransaction: (transactionId: string) => {
         set((state: any) => {
             const transaction = state.transactions.find((t: any) => t.id === transactionId);
             if (!transaction) return state;
             const updatedTransactions = state.transactions.map((t: any) =>
                 t.id === transactionId ? { ...t, status: 'refunded' as const } : t
             );
             const updatedProducts = state.products.map((p: any) => {
                 const item = transaction.items.find((i: any) => i.product.id === p.id);
                 if (item && typeof p.stock === 'number') {
                     return { ...p, stock: p.stock + item.quantity };
                 }
                 return p;
             });
             saveDataToFile('transactions.json', updatedTransactions);
             saveDataToFile('products.json', updatedProducts);
             state.addToSyncQueue({ type: 'update-transaction', data: { id: transactionId, updates: { status: 'refunded' } } });
             return { transactions: updatedTransactions, products: updatedProducts };
         });
      },
      saveTransaction: (transaction: Transaction) => {
        set((state: any) => {
          const updatedTransactions = [transaction, ...state.transactions];
          saveDataToFile('transactions.json', updatedTransactions);
          return { transactions: updatedTransactions };
        });
      },
      saveCreditCustomer: (customer: CreditCustomer) => {
        set((state: any) => {
          const updatedCustomers = [...state.creditCustomers, customer];
          saveDataToFile('credit-customers.json', updatedCustomers);
          state.addToSyncQueue({ type: 'add-credit-customer', data: customer });
          return { creditCustomers: updatedCustomers };
        });
      },
      updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => {
        set((state: any) => {
            const updatedCustomers = state.creditCustomers.map((customer: any) =>
                customer.id === id ? { ...customer, ...updates, lastUpdated: new Date().toISOString() } : customer
            );
            saveDataToFile('credit-customers.json', updatedCustomers);
            state.addToSyncQueue({ type: 'update-credit-customer', data: { id, updates } });
            return { creditCustomers: updatedCustomers };
        });
      },
      deleteCreditCustomer: (id: string) => {
        set((state: any) => {
          const updatedCustomers = state.creditCustomers.filter((customer: any) => customer.id !== id);
          saveDataToFile('credit-customers.json', updatedCustomers);
          state.addToSyncQueue({ type: 'delete-credit-customer', data: { id } });
          return { creditCustomers: updatedCustomers };
        });
      },
      addExpense: (expense: Expense) => {
        set((state: any) => {
          const updatedExpenses = [expense, ...state.expenses];
          saveDataToFile('expenses.json', updatedExpenses);
          state.addToSyncQueue({ type: 'add-expense', data: expense });
          return { expenses: updatedExpenses };
        });
      },
      updateExpense: (id: string, updates: Partial<Expense>) => {
        set((state: any) => {
          const updatedExpenses = state.expenses.map((expense: any) =>
            expense.id === id ? { ...expense, ...updates } : expense
          );
          saveDataToFile('expenses.json', updatedExpenses);
          state.addToSyncQueue({ type: 'update-expense', data: { id, updates } });
          return { expenses: updatedExpenses };
        });
      },
      deleteExpense: (id: string) => {
        set((state: any) => {
          const updatedExpenses = state.expenses.filter((expense: any) => expense.id !== id);
          saveDataToFile('expenses.json', updatedExpenses);
          state.addToSyncQueue({ type: 'delete-expense', data: { id } });
          return { expenses: updatedExpenses };
        });
      },
      addSalary: (salary: Salary) => {
        set((state: any) => {
          const updatedSalaries = [salary, ...state.salaries];
          saveDataToFile('salaries.json', updatedSalaries);
          state.addToSyncQueue({ type: 'add-salary', data: salary });
          return { salaries: updatedSalaries };
        });
      },
      deleteSalary: (id: string) => {
        set((state: any) => {
          const updatedSalaries = state.salaries.filter((s: any) => s.id !== id);
          saveDataToFile('salaries.json', updatedSalaries);
          state.addToSyncQueue({ type: 'delete-salary', data: { id } });
          return { salaries: updatedSalaries };
        });
      },
      addSupplier: (supplier: Supplier) => {
        set((state: any) => {
          const updatedanys = [...state.suppliers, supplier];
          saveDataToFile('suppliers.json', updatedanys);
          state.addToSyncQueue({ type: 'add-supplier', data: supplier });
          return { suppliers: updatedanys };
        });
      },
      updateSupplier: (id: string, updates: Partial<Supplier>) => {
        set((state: any) => {
          const updatedanys = state.suppliers.map((s: any) =>
            s.id === id ? { ...s, ...updates } : s
          );
          saveDataToFile('suppliers.json', updatedanys);
          state.addToSyncQueue({ type: 'update-supplier', data: { id, updates } });
          return { suppliers: updatedanys };
        });
      },
      deleteSupplier: (id: string) => {
        set((state: any) => {
          const updatedanys = state.suppliers.filter((s: any) => s.id !== id);
          saveDataToFile('suppliers.json', updatedanys);
          state.addToSyncQueue({ type: 'delete-supplier', data: { id } });
          return { suppliers: updatedanys };
        });
      },
      migrateLegacyExpenses: async () => {
        const state = get();
        let othersSupplier = state.suppliers.find((s: any) => s.name === 'Others');
        let updatedSuppliers = [...state.suppliers];
        if (!othersSupplier) {
            othersSupplier = { id: `SUP${Date.now()}`, name: 'Others', contact: 'support@whizpoint.app', location: 'N/A', active: true, createdAt: new Date().toISOString() };
            updatedSuppliers.push(othersSupplier);
            state.addToSyncQueue({ type: 'add-supplier', data: othersSupplier });
        }
        const updatedExpenses = state.expenses.map((e: any) => {
            if (!e.supplierId) {
                const updates = { supplierId: othersSupplier!.id, supplierName: 'Others' };
                state.addToSyncQueue({ type: 'update-expense', data: { id: e.id, updates } });
                return { ...e, ...updates };
            }
            return e;
        });
        set({ suppliers: updatedSuppliers, expenses: updatedExpenses });
        await saveDataToFile('suppliers.json', updatedSuppliers);
        await saveDataToFile('expenses.json', updatedExpenses);
      },
      saveDocument: (doc: SavedDocument) => {
        set((state: any) => {
          const updatedDocs = [doc, ...state.documents.filter((d: any) => d.id !== doc.id)];
          saveDataToFile('documents.json', updatedDocs);
          return { documents: updatedDocs };
        });
      },
      deleteDocument: (id: string) => {
        set((state: any) => {
          const updatedDocs = state.documents.filter((d: any) => d.id !== id);
          saveDataToFile('documents.json', updatedDocs);
          return { documents: updatedDocs };
        });
      },
      saveBusinessSetup: (setup: BusinessSetup) => {
        saveDataToFile('business-setup.json', setup);
        set((state: any) => {
            state.addToSyncQueue({ type: 'update-business-setup', data: setup });
            return { businessSetup: setup };
        });
      },
      addToSyncQueue: (operation: any) => {
        set((state: any) => ({ syncQueue: [...state.syncQueue, operation] }));
        setTimeout(() => get().processSyncQueue(), 0);
      },
      processSyncQueue: async () => {
        const state = get();
        let apiUrl = (state.businessSetup?.serverIp || state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        apiUrl = apiUrl?.replace(/\/api$/, '') || '';
        const apiKey = state.businessSetup?.apiKey;
        if (!state.isOnline || state.syncQueue.length === 0 || !apiUrl || !apiKey) return;
        const queue = [...state.syncQueue];
        set({ syncQueue: [] });
        try {
          const response = await fetch(`${apiUrl}/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ operations: queue, metadata: { pendingSales: get().syncQueue.length, shiftId: "SHIFT-001" } })
          });
          if (!response.ok) throw new Error(`Sync failed`);
          set({ lastSyncTime: new Date().toISOString() });
          get().syncFromServer();
        } catch (error) {
          set((state: any) => ({ syncQueue: [...queue, ...state.syncQueue] }));
        }
      },
      syncFromServer: async () => {
        const state = get();
        let apiUrl = (state.businessSetup?.serverIp || state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        apiUrl = apiUrl?.replace(/\/api$/, '') || '';
        const apiKey = state.businessSetup?.apiKey;
        if (!state.isOnline || !apiUrl || !apiKey) return;
        try {
          const response = await fetch(`${apiUrl}/api/sync`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
          if (!response.ok) return;
          const serverData = await response.json();
          set({
            products: serverData.products || state.products,
            users: serverData.users || state.users,
            categories: serverData.categories || state.categories,
            businessSetup: { ...state.businessSetup, ...serverData.businessSetup }
          });
        } catch (error) {}
      },
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        if (isOnline) { get().processSyncQueue(); get().syncFromServer(); }
      },
      handleMobileDataSync: (payload: any) => {
        const ops = Array.isArray(payload) ? payload : [payload];
        ops.forEach((op: any) => {
            get().addToSyncQueue(op);
        });
      },
      loadMobileReceipts: async () => {
        const res = await readDataFromFile('mobile-receipts.json');
        if (res.data) set({ mobileReceipts: res.data });
      },
      addMobileReceipt: (receipt: any) => set((state: any) => ({ mobileReceipts: [...state.mobileReceipts, receipt] })),
      printMobileReceipt: (receipt: any) => {
        const state = get();
        if ((window as any).electron) {
            (window as any).electron.printReceipt(receipt, state.businessSetup, false);
            if (!state.transactions.some((t: any) => t.id === receipt.id)) state.saveTransaction(receipt);
            get().deleteMobileReceipt(receipt);
        }
      },
      deleteMobileReceipt: (receipt: any) => {
        set((state: any) => {
            const newReceipts = state.mobileReceipts.filter((r: any) => r._printId !== receipt._printId);
            saveDataToFile('mobile-receipts.json', newReceipts);
            return { mobileReceipts: newReceipts };
        });
      },
      getDailySales: (date: string) => {
        const state = get();
        const dayanys = state.transactions.filter((t: any) => t.timestamp.startsWith(date) && t.status === 'completed');
        const cash = dayanys.filter((t: any) => t.paymentMethod === 'cash').reduce((sum: number, t: any) => sum + t.total, 0);
        const mpesa = dayanys.filter((t: any) => t.paymentMethod === 'mpesa').reduce((sum: number, t: any) => sum + t.total, 0);
        const credit = dayanys.filter((t: any) => t.paymentMethod === 'credit').reduce((sum: number, t: any) => sum + t.total, 0);
        return { cash, mpesa, credit, total: cash + mpesa + credit };
      },
      getDailyClosingReport: (date: string) => {
          return {} as any;
      },
      getTransactionsByDateRange: (start: string, end: string) => {
          return get().transactions.filter((t: any) => t.timestamp >= start && t.timestamp <= end);
      },
      getUnpaidCredits: () => get().creditCustomers.filter((c: any) => c.balance > 0),
      addProduct: (p: Product) => {
          set((state: any) => ({ products: [...state.products, p] }));
          get().addToSyncQueue({ type: 'add-product', data: p });
      },
      updateProduct: (id: number, updates: Partial<Product>) => {
          set((state: any) => ({ products: state.products.map((p: any) => p.id === id ? { ...p, ...updates } : p) }));
          get().addToSyncQueue({ type: 'update-product', data: { id, updates } });
      },
      deleteProduct: (id: number) => {
          set((state: any) => ({ products: state.products.filter((p: any) => p.id !== id) }));
          get().addToSyncQueue({ type: 'delete-product', data: { id } });
      },
      setCategories: (c: string[]) => set({ categories: c }),
      addCategory: (c: string) => set((state: any) => ({ categories: [...state.categories, c] })),
      deleteCategory: (c: string) => set((state: any) => ({ categories: state.categories.filter((cat: any) => cat !== c) })),
      loadInitialData: async () => {
        const setupRes = await readDataFromFile('business-setup.json');
        if (setupRes.data) set({ businessSetup: setupRes.data });
        const prodRes = await readDataFromFile('products.json');
        if (prodRes.data) set({ products: prodRes.data });
        const userRes = await readDataFromFile('users.json');
        if (userRes.data) set({ users: userRes.data });
        set({ isDataLoaded: true });
      },
      finishSetup: async (data: any, admin: any) => {
        const setup = { ...data, isSetup: true, createdAt: new Date().toISOString() };
        set({ businessSetup: setup });
        await saveDataToFile('business-setup.json', setup);
        if ((window as any).electron && (window as any).electron.userManagement) await (window as any).electron.userManagement.addUser(admin);
      },
      pushDataToServer: async () => {},
      addCreditPayment: (cId: string, amt: number) => {},
      addInventoryLog: (l: InventoryLog) => {},
      archiveTransactions: async (d: number) => {},
      loadUsers: async () => {
          const res = await readDataFromFile('users.json');
          if (res.data) set({ users: res.data });
      },
      toggleSidebar: () => set((state: any) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      addSyncHistoryItem: (i: any) => set((state: any) => ({ syncHistory: [i, ...state.syncHistory].slice(0, 50) })),
    }),
    {
      name: 'pos-storage',
      partialize: (state: any) => ({
        businessSetup: state.businessSetup,
        users: state.users,
        products: state.products,
        transactions: state.transactions?.slice(-100),
      })
    }
  )
);
