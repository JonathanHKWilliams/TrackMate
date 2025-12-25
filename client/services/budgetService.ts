import { supabase } from '../lib/supabase';
import { Budget, BudgetWithSpending, CreateBudgetInput, UpdateBudgetInput } from '../types/budget';

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getActiveBudgets = async (userId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getActiveBudgetsWithSpending = async (userId: string): Promise<BudgetWithSpending[]> => {
  const { data, error } = await supabase.rpc('get_active_budgets_with_spending', {
    p_user_id: userId,
  });

  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    id: item.budget_id,
    user_id: userId,
    name: item.budget_name,
    amount: Number(item.budget_amount),
    period: item.period,
    category_id: item.category_id,
    category_name: item.category_name,
    start_date: item.start_date,
    end_date: item.end_date,
    alert_threshold: item.alert_threshold,
    is_active: true,
    total_spent: Number(item.total_spent),
    percentage_used: Number(item.percentage_used),
    remaining: Number(item.budget_amount) - Number(item.total_spent),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

export const getBudgetById = async (budgetId: string): Promise<Budget | null> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', budgetId)
    .single();

  if (error) throw error;
  return data;
};

export const createBudget = async (userId: string, input: CreateBudgetInput): Promise<Budget> => {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      name: input.name,
      amount: input.amount,
      period: input.period,
      category_id: input.category_id || null,
      start_date: input.start_date,
      end_date: input.end_date,
      alert_threshold: input.alert_threshold || 80,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBudget = async (budgetId: string, input: UpdateBudgetInput): Promise<Budget> => {
  const { data, error } = await supabase
    .from('budgets')
    .update(input)
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId);

  if (error) throw error;
};

export const getBudgetSpending = async (
  budgetId: string,
  startDate: string,
  endDate: string,
  categoryId?: string
): Promise<number> => {
  const { data, error } = await supabase.rpc('get_budget_spending', {
    p_budget_id: budgetId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_category_id: categoryId || null,
  });

  if (error) throw error;
  return Number(data || 0);
};

export const calculateBudgetDates = (
  period: 'weekly' | 'monthly' | 'yearly',
  startFrom?: Date
): { start_date: string; end_date: string } => {
  const start = startFrom || new Date();
  const end = new Date(start);

  switch (period) {
    case 'weekly':
      end.setDate(end.getDate() + 6);
      break;
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
  }

  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  };
};

export const checkBudgetAlert = (budget: BudgetWithSpending): {
  shouldAlert: boolean;
  alertType: 'threshold' | 'exceeded' | 'near_end' | null;
  message: string;
} => {
  const { percentage_used, alert_threshold, end_date } = budget;
  const daysRemaining = Math.ceil(
    (new Date(end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (percentage_used >= 100) {
    return {
      shouldAlert: true,
      alertType: 'exceeded',
      message: `Budget exceeded! You've spent ${percentage_used.toFixed(0)}% of your budget.`,
    };
  }

  if (percentage_used >= alert_threshold) {
    return {
      shouldAlert: true,
      alertType: 'threshold',
      message: `Budget alert! You've used ${percentage_used.toFixed(0)}% of your budget.`,
    };
  }

  if (daysRemaining <= 3 && percentage_used >= 50) {
    return {
      shouldAlert: true,
      alertType: 'near_end',
      message: `Budget ending soon! ${daysRemaining} day(s) remaining.`,
    };
  }

  return {
    shouldAlert: false,
    alertType: null,
    message: '',
  };
};
