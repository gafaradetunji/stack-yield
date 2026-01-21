// Common type definitions for the application

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserAccount {
  id: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

export interface YieldRecord {
  id: string;
  userId: string;
  amount: string;
  distributedAt: Date;
}
