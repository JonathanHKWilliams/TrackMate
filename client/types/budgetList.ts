// Budget List Types - For planning purchases and creating shopping lists

export interface BudgetList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  total_budget: number;
  currency: string;
  purpose?: string;
  recipient?: string;
  status: 'draft' | 'sent' | 'approved' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_list_id: string;
  item_name: string;
  description?: string;
  quantity: number;
  estimated_price: number;
  actual_price?: number;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  is_purchased: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  total_estimated?: number;
  total_actual?: number;
}

export interface BudgetListWithItems extends BudgetList {
  total_estimated: number;
  total_actual: number;
  remaining_budget: number;
  item_count: number;
  purchased_count: number;
  items: BudgetItem[];
}

export interface BudgetListSummary {
  list_id: string;
  list_title: string;
  list_description?: string;
  total_budget: number;
  currency: string;
  purpose?: string;
  recipient?: string;
  status: 'draft' | 'sent' | 'approved' | 'completed';
  total_estimated: number;
  remaining_budget: number;
  item_count: number;
  purchased_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetListInput {
  title: string;
  description?: string;
  total_budget: number;
  currency?: string;
  purpose?: string;
  recipient?: string;
}

export interface UpdateBudgetListInput {
  title?: string;
  description?: string;
  total_budget?: number;
  currency?: string;
  purpose?: string;
  recipient?: string;
  status?: 'draft' | 'sent' | 'approved' | 'completed';
}

export interface CreateBudgetItemInput {
  budget_list_id: string;
  item_name: string;
  description?: string;
  quantity?: number;
  estimated_price: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateBudgetItemInput {
  item_name?: string;
  description?: string;
  quantity?: number;
  estimated_price?: number;
  actual_price?: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  is_purchased?: boolean;
  notes?: string;
}

export const BUDGET_LIST_STATUSES = ['draft', 'sent', 'approved', 'completed'] as const;
export const ITEM_PRIORITIES = ['low', 'medium', 'high'] as const;
export const ITEM_CATEGORIES = [
  'Clothing',
  'Books & Supplies',
  'Electronics',
  'Food & Groceries',
  'Transportation',
  'Health & Medicine',
  'Personal Care',
  'Entertainment',
  'Other',
] as const;
