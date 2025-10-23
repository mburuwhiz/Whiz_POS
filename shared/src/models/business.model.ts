export interface Business {
  _id: string;
  name: string;
  region?: string;
  adminUserId: string;
  config: {
    currency: string;
    taxRate: number;
  };
  createdAt: string;
  updatedAt: string;
}
