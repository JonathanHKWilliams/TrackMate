export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  category_id?: string;
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithSpending extends Budget {
  category_name?: string;
  total_spent: number;
  percentage_used: number;
  remaining: number;
}

export interface BudgetAlert {
  id: string;
  budget_id: string;
  alert_type: 'threshold' | 'exceeded' | 'near_end';
  percentage_used: number;
  created_at: string;
}

export interface CreateBudgetInput {
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  category_id?: string;
  start_date: string;
  end_date: string;
  alert_threshold?: number;
}

export interface UpdateBudgetInput {
  name?: string;
  amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  category_id?: string;
  start_date?: string;
  end_date?: string;
  alert_threshold?: number;
  is_active?: boolean;
}

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;
