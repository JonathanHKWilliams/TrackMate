export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'digital_wallet' 
  | 'mobile_money'
  | 'other';

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency?: string;
  category_id?: string;
  expense_date: string;
  payment_method: PaymentMethod;
  description?: string;
  merchant?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  tags?: ExpenseTag[];
}

export interface ExpenseTagRelation {
  id: string;
  expense_id: string;
  tag_id: string;
  created_at: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency?: string;
  category_id?: string;
  expense_date: string;
  payment_method: PaymentMethod;
  description?: string;
  merchant?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  tag_ids?: string[];
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  currency?: string;
  category_id?: string;
  expense_date?: string;
  payment_method?: PaymentMethod;
  description?: string;
  merchant?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  tag_ids?: string[];
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  tagIds?: string[];
  paymentMethods?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface SpendingSummary {
  total: number;
  count: number;
  average: number;
  byCategory: CategorySpending[];
  byPaymentMethod: PaymentMethodSpending[];
  topExpenses: Expense[];
}

export interface CategorySpending {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface PaymentMethodSpending {
  method: PaymentMethod;
  total: number;
  count: number;
  percentage: number;
}

export interface PeriodComparison {
  current: SpendingSummary;
  previous: SpendingSummary;
  change: number;
  changePercentage: number;
}

export type TimePeriod = 'week' | 'month' | 'year' | 'custom';

export interface AnalyticsData {
  period: TimePeriod;
  summary: SpendingSummary;
  comparison?: PeriodComparison;
  trends: TrendData[];
}

export interface TrendData {
  date: string;
  amount: number;
  count: number;
}
