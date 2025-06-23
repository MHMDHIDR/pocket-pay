export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  password?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id?: string;
  id?: string;
  type: 'send' | 'receive' | 'charge';
  amount: number;
  senderEmail?: string;
  recipientEmail?: string;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string;
  id?: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info';
  read: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}