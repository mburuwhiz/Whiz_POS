export interface ApiKey {
  key: string;
  active: boolean;
  issuedAt: Date;
}

export interface BusinessConfig {
  currency: string;
  taxRate: number;
}

export interface Business {
  _id: string;
  name: string;
  region: string;
  apiKeys: ApiKey[];
  adminUserId: string;
  config: BusinessConfig;
}
