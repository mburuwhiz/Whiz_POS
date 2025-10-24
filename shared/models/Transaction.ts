export interface TransactionItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Payment {
  method: 'cash' | 'card' | 'mpesa' | 'credit';
  amount: number;
}

export type TransactionStatus = 'COMPLETED' | 'VOIDED' | 'PENDING';

export interface Transaction {
  _id: string;
  businessId: string;
  deviceId: string;
  items: TransactionItem[];
  total: number;
  payments: Payment[];
  status: TransactionStatus;
  isPaid?: boolean;
  createdAt: Date;
}
