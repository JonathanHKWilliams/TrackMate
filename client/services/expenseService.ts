import { supabase } from '../lib/supabase';
import {
  Expense,
  ExpenseCategory,
  ExpenseTag,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  SpendingSummary,
  CategorySpending,
  PaymentMethodSpending,
  AnalyticsData,
  TimePeriod,
  TrendData,
  PeriodComparison,
} from '../types/expense';

export const createExpense = async (
  userId: string,
  input: CreateExpenseInput
): Promise<Expense> => {
  const { tag_ids, ...expenseData } = input;

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      ...expenseData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  if (tag_ids && tag_ids.length > 0) {
    const tagRelations = tag_ids.map((tag_id) => ({
      expense_id: expense.id,
      tag_id,
    }));

    const { error: tagError } = await supabase
      .from('expense_tag_relations')
      .insert(tagRelations);

    if (tagError) console.error('Error adding tags:', tagError);
  }

  return getExpenseById(expense.id);
};

export const updateExpense = async (
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Expense> => {
  const { tag_ids, ...expenseData } = input;

  const { error } = await supabase
    .from('expenses')
    .update(expenseData)
    .eq('id', expenseId);

  if (error) throw error;

  if (tag_ids !== undefined) {
    await supabase
      .from('expense_tag_relations')
      .delete()
      .eq('expense_id', expenseId);

    if (tag_ids.length > 0) {
      const tagRelations = tag_ids.map((tag_id) => ({
        expense_id: expenseId,
        tag_id,
      }));

      const { error: tagError } = await supabase
        .from('expense_tag_relations')
        .insert(tagRelations);

      if (tagError) console.error('Error updating tags:', tagError);
    }
  }

  return getExpenseById(expenseId);
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw error;
};

export const getExpenseById = async (expenseId: string): Promise<Expense> => {
  const { data: expense, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      category:expense_categories(*),
      expense_tag_relations(
        tag:expense_tags(*)
      )
    `
    )
    .eq('id', expenseId)
    .single();

  if (error) throw error;

  const tags = expense.expense_tag_relations?.map((rel: any) => rel.tag) || [];
  const { expense_tag_relations, ...rest } = expense;

  return {
    ...rest,
    tags,
  };
};

export const getExpenses = async (
  userId: string,
  filters?: ExpenseFilters
): Promise<Expense[]> => {
  let query = supabase
    .from('expenses')
    .select(
      `
      *,
      category:expense_categories(*),
      expense_tag_relations(
        tag:expense_tags(*)
      )
    `
    )
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }

  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds);
  }

  if (filters?.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.in('payment_method', filters.paymentMethods);
  }

  if (filters?.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }

  if (filters?.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }

  if (filters?.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,merchant.ilike.%${filters.searchQuery}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  let expenses = data.map((expense: any) => {
    const tags = expense.expense_tag_relations?.map((rel: any) => rel.tag) || [];
    const { expense_tag_relations, ...rest } = expense;
    return {
      ...rest,
      tags,
    };
  });

  if (filters?.tagIds && filters.tagIds.length > 0) {
    expenses = expenses.filter((expense) =>
      expense.tags?.some((tag: ExpenseTag) => filters.tagIds!.includes(tag.id))
    );
  }

  return expenses;
};

export const getRecentExpenses = async (
  userId: string,
  limit: number = 10
): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      category:expense_categories(*),
      expense_tag_relations(
        tag:expense_tags(*)
      )
    `
    )
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((expense: any) => {
    const tags = expense.expense_tag_relations?.map((rel: any) => rel.tag) || [];
    const { expense_tag_relations, ...rest } = expense;
    return {
      ...rest,
      tags,
    };
  });
};

export const getSpendingSummary = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<SpendingSummary> => {
  const expenses = await getExpenses(userId, { startDate, endDate });

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;

  const categoryMap = new Map<string, { category: ExpenseCategory; total: number; count: number }>();
  const paymentMethodMap = new Map<string, { total: number; count: number }>();

  expenses.forEach((expense) => {
    if (expense.category) {
      const existing = categoryMap.get(expense.category.id) || {
        category: expense.category,
        total: 0,
        count: 0,
      };
      categoryMap.set(expense.category.id, {
        category: expense.category,
        total: existing.total + Number(expense.amount),
        count: existing.count + 1,
      });
    }

    const existing = paymentMethodMap.get(expense.payment_method) || { total: 0, count: 0 };
    paymentMethodMap.set(expense.payment_method, {
      total: existing.total + Number(expense.amount),
      count: existing.count + 1,
    });
  });

  const byCategory: CategorySpending[] = Array.from(categoryMap.values()).map((item) => ({
    category: item.category,
    total: item.total,
    count: item.count,
    percentage: total > 0 ? (item.total / total) * 100 : 0,
  }));

  const byPaymentMethod: PaymentMethodSpending[] = Array.from(paymentMethodMap.entries()).map(
    ([method, data]) => ({
      method: method as any,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    })
  );

  const topExpenses = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

  return {
    total,
    count,
    average,
    byCategory: byCategory.sort((a, b) => b.total - a.total),
    byPaymentMethod: byPaymentMethod.sort((a, b) => b.total - a.total),
    topExpenses,
  };
};

export const getAnalyticsData = async (
  userId: string,
  period: TimePeriod,
  customStartDate?: string,
  customEndDate?: string
): Promise<AnalyticsData> => {
  const { startDate, endDate } = getPeriodDates(period, customStartDate, customEndDate);
  const summary = await getSpendingSummary(userId, startDate, endDate);

  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodDates(
    period,
    startDate,
    endDate
  );
  const previousSummary = await getSpendingSummary(userId, prevStartDate, prevEndDate);

  const change = summary.total - previousSummary.total;
  const changePercentage =
    previousSummary.total > 0 ? (change / previousSummary.total) * 100 : 0;

  const comparison: PeriodComparison = {
    current: summary,
    previous: previousSummary,
    change,
    changePercentage,
  };

  const trends = await getTrendData(userId, startDate, endDate, period);

  return {
    period,
    summary,
    comparison,
    trends,
  };
};

const getTrendData = async (
  userId: string,
  startDate: string,
  endDate: string,
  period: TimePeriod
): Promise<TrendData[]> => {
  const expenses = await getExpenses(userId, { startDate, endDate });

  const trendMap = new Map<string, { amount: number; count: number }>();

  expenses.forEach((expense) => {
    const date = new Date(expense.expense_date);
    let key: string;

    if (period === 'week') {
      key = expense.expense_date;
    } else if (period === 'month') {
      key = expense.expense_date;
    } else if (period === 'year') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = expense.expense_date;
    }

    const existing = trendMap.get(key) || { amount: 0, count: 0 };
    trendMap.set(key, {
      amount: existing.amount + Number(expense.amount),
      count: existing.count + 1,
    });
  });

  return Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getPeriodDates = (
  period: TimePeriod,
  customStartDate?: string,
  customEndDate?: string
): { startDate: string; endDate: string } => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === 'custom' && customStartDate && customEndDate) {
    return { startDate: customStartDate, endDate: customEndDate };
  }

  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === 'year') {
    startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

const getPreviousPeriodDates = (
  period: TimePeriod,
  currentStartDate: string,
  currentEndDate: string
): { startDate: string; endDate: string } => {
  const start = new Date(currentStartDate);
  const end = new Date(currentEndDate);
  const diff = end.getTime() - start.getTime();

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd.getTime() - diff);

  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
  };
};

export const createCategory = async (
  userId: string,
  name: string,
  color: string,
  icon?: string
): Promise<ExpenseCategory> => {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      user_id: userId,
      name,
      color,
      icon,
      is_default: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (
  categoryId: string,
  name: string,
  color: string,
  icon?: string
): Promise<ExpenseCategory> => {
  const { data, error } = await supabase
    .from('expense_categories')
    .update({ name, color, icon })
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase.from('expense_categories').delete().eq('id', categoryId);
  if (error) throw error;
};

export const getCategories = async (userId: string): Promise<ExpenseCategory[]> => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  return data;
};

export const createDefaultCategories = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc('create_default_expense_categories', {
    p_user_id: userId,
  });

  if (error) console.error('Error creating default categories:', error);
};

export const createTag = async (
  userId: string,
  name: string,
  color: string
): Promise<ExpenseTag> => {
  const { data, error } = await supabase
    .from('expense_tags')
    .insert({
      user_id: userId,
      name,
      color,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTag = async (
  tagId: string,
  name: string,
  color: string
): Promise<ExpenseTag> => {
  const { data, error } = await supabase
    .from('expense_tags')
    .update({ name, color })
    .eq('id', tagId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTag = async (tagId: string): Promise<void> => {
  const { error } = await supabase.from('expense_tags').delete().eq('id', tagId);
  if (error) throw error;
};

export const getTags = async (userId: string): Promise<ExpenseTag[]> => {
  const { data, error } = await supabase
    .from('expense_tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  return data;
};
