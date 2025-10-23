export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'Cashier' | 'Stock Clerk';

export interface User {
  _id: string;
  businessId: string;
  name: string;
  roles: UserRole[];
  pinHash: string;
  email: string;
  createdAt: Date;
}
