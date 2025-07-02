export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  date: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  user: string;
}

export interface Tag {
  _id: string;
  name: string;
  user: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ExpenseFilters {
  category?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface StatisticsData {
  totalExpenses: number;
  totalAmount: number;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
  }>;
}
