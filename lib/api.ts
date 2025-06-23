import { AuthResponse, ApiResponse, User, Transaction } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/api/users/profile');
  }

  async updateBalance(amount: number): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/users/balance', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async searchUser(email: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/api/users/search?email=${encodeURIComponent(email)}`);
  }

  // Transaction endpoints
  async createTransaction(transactionData: {
    type: 'send' | 'charge';
    amount: number;
    recipientEmail?: string;
    description?: string;
  }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/transactions/create', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactionHistory(): Promise<ApiResponse<Transaction[]>> {
    return this.request<ApiResponse<Transaction[]>>('/api/transactions/history');
  }
}

export const apiClient = new ApiClient();