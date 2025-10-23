interface TransactionItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

interface Payment {
  method: 'cash' | 'card' | 'mobile_money';
  amount: number;
}

export interface Transaction {
  _id: string;
  businessId: string;
  deviceId: string;
  userId: string;
  items: TransactionItem[];
  total: number;
  payments: Payment[];
  status: 'COMPLETED' | 'VOIDED' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}
