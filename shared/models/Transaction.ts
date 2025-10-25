export interface TransactionItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Payment {
  method: 'cash' | 'card' | 'mobile_money';
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
  createdAt: Date;
}
