// Type definitions for the application

/**
 * Represents a product in the inventory.
 */
export interface Product {
  /** Unique identifier for the product */
  id: number;
  /** Name of the product */
  name: string;
  /** Price of the product */
  price: number;
  /** Category the product belongs to */
  category: string;
  /** URL or path to the product image */
  image: string;
  /** Whether the product is available for sale */
  available: boolean;
  /** Current stock level (optional) */
  stock?: number;
}

/**
 * Represents an item in the shopping cart.
 */
export interface CartItem {
  /** The product object */
  product: Product;
  /** The quantity of the product in the cart */
  quantity: number;
}

/**
 * Represents a completed transaction.
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Timestamp of when the transaction occurred (ISO string) */
  timestamp: string;
  /** List of items purchased */
  items: CartItem[];
  /** Subtotal amount before tax */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Total amount paid */
  total: number;
  /** Payment method used */
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  /** Name of the cashier who processed the transaction */
  cashier: string;
  /** Name of the credit customer (if payment method is credit) */
  creditCustomer?: string;
  /** Status of the transaction */
  status: 'completed' | 'pending' | 'refunded';
}

/**
 * Represents a customer who can make purchases on credit.
 */
export interface CreditCustomer {
  /** Unique identifier for the customer */
  id: string;
  /** Name of the customer */
  name: string;
  /** Phone number of the customer */
  phone: string;
  /** Total credit amount accumulated */
  totalCredit: number;
  /** Total amount paid back */
  paidAmount: number;
  /** Current outstanding balance */
  balance: number;
  /** List of transaction IDs associated with this customer */
  transactions: string[];
  /** Timestamp when the customer was created */
  createdAt: string;
  /** Timestamp when the customer record was last updated */
  lastUpdated: string;
}

/**
 * Represents a user of the system (e.g., cashier, manager, admin).
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Name of the user */
  name: string;
  /** PIN used for login */
  pin: string;
  /** Role of the user */
  role: 'admin' | 'manager' | 'cashier';
  /** Whether the user account is active */
  isActive: boolean;
  /** Timestamp when the user was created */
  createdAt: string;
}

/**
 * Represents an expense record.
 */
export interface Expense {
  /** Unique identifier for the expense */
  id: string;
  /** Description of the expense */
  description: string;
  /** Amount of the expense */
  amount: number;
  /** Category of the expense */
  category: string;
  /** Timestamp when the expense was recorded */
  timestamp: string;
  /** Name of the cashier who recorded the expense */
  cashier: string;
  /** Optional receipt identifier or image path */
  receipt?: string;
}

/**
 * Represents the business configuration settings.
 */
export interface BusinessSetup {
  /** Name of the business */
  businessName: string;
  /** Unique identifier for the business */
  businessId: string;
  /** API Key for backend synchronization */
  apiKey: string;
  /** Physical address of the business */
  address: string;
  /** Contact phone number */
  phone: string;
  /** Contact email address */
  email: string;
  /** Tax rate percentage */
  taxRate: number;
  /** Currency symbol */
  currency: string;
  /** Custom header text for receipts */
  receiptHeader: string;
  /** Custom footer text for receipts */
  receiptFooter: string;
  /** Type of printer being used */
  printerType: string;
  /** Whether the initial setup has been completed */
  isSetup: boolean;
  /** Timestamp when the setup was created */
  createdAt: string;
}
