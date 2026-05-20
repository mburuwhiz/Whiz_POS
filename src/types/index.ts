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
}

export interface SyncQueueItem {
  id: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  synced: boolean;
}
