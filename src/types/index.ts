export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: Category | string;
  tags: Tag[] | string[];
  date: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

// Version populated pour les opérations côté client
export interface PopulatedExpense {
  _id: string;
  amount: number;
  description: string;
  category?: Category;
  tags?: Tag[];
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
  search?: string;
  sort?: string;
}

// Types pour l'assistant IA
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  response: string;
  sessionId: string;
  sources: {
    userDataCount: number;
    tipsCount: number;
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
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
