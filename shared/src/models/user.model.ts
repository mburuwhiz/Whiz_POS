export interface User {
  _id: string;
  businessId?: string;
  name: string;
  roles: ('SuperAdmin' | 'Admin' | 'Manager' | 'Cashier' | 'Stock Clerk')[];
  email: string;
  createdAt: string;
  updatedAt: string;
}
