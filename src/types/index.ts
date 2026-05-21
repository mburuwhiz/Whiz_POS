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
  amountTendered?: number;
  change?: number;
  mpesaCode?: string;
  phoneNumber?: string;
  outletId?: string; // Multi-outlet tracking
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  paidAmount: number;
  balance: number;
  transactions: string[];
  createdAt: string;
  lastUpdated: string;
  outletId?: string; // Multi-outlet tracking
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
  outletId?: string; // Multi-outlet tracking
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: string;
  cashier: string;
  receipt?: string;
  supplierId?: string;
  supplierName?: string;
  recordedBy?: string;
  outletId?: string; // Multi-outlet tracking
}

export interface BusinessSetup {
  businessName: string;
  businessId?: string;
  appMode?: 'SERVER' | 'OUTLET';
  outletName?: string;
  outletId?: string;
  serverIp?: string;
  serverPort?: number;
  printMode?: 'single' | 'double';
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
  printerPaperWidth?: number;
  isSetup: boolean;
  isLoggedIn: boolean;
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
  showDeveloperFooter?: boolean;
  developerPin?: string;
  disableReceiptPrinting?: boolean;
  mpesaConfig?: {
    enabled: boolean;
    backendUrl: string;
    apiKey: string;
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
    partyB: string;
    callbackUrl: string;
    type: 'Paybill' | 'Till';
    environment: 'Sandbox' | 'Production';
  };
}

export interface SyncQueueItem {
  id: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  location: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  outletId?: string;
}

export interface Salary {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  type: 'advance' | 'full';
  notes?: string;
  outletId?: string;
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

export interface CashierReport {
  cashierName: string;
  transactions: Transaction[];
  totalSales: number;
  cashTotal: number;
  mpesaTotal: number;
  creditTotal: number;
  items: ItemSales[];
}

export interface ItemSales {
  name: string;
  quantity: number;
  total: number;
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
  outletId?: string;
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

export interface SavedDocument {
  id: string;
  type: string;
  name: string;
  date: string;
  data: any;
}
