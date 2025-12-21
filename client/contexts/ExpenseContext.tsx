import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  Expense,
  ExpenseCategory,
  ExpenseTag,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  SpendingSummary,
  AnalyticsData,
  TimePeriod,
} from '../types/expense';
import * as expenseService from '../services/expenseService';

type ExpenseContextType = {
  expenses: Expense[];
  categories: ExpenseCategory[];
  tags: ExpenseTag[];
  loading: boolean;
  filters: ExpenseFilters;
  setFilters: (filters: ExpenseFilters) => void;
  createExpense: (input: CreateExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, input: UpdateExpenseInput) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  createCategory: (name: string, color: string, icon?: string) => Promise<ExpenseCategory>;
  updateCategory: (id: string, name: string, color: string, icon?: string) => Promise<ExpenseCategory>;
  deleteCategory: (id: string) => Promise<void>;
  createTag: (name: string, color: string) => Promise<ExpenseTag>;
  updateTag: (id: string, name: string, color: string) => Promise<ExpenseTag>;
  deleteTag: (id: string) => Promise<void>;
  getSpendingSummary: (startDate: string, endDate: string) => Promise<SpendingSummary>;
  getAnalyticsData: (period: TimePeriod, customStartDate?: string, customEndDate?: string) => Promise<AnalyticsData>;
  refreshExpenses: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshTags: () => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [tags, setTags] = useState<ExpenseTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const loadExpenses = async () => {
    if (!user) return;
    try {
      const data = await expenseService.getExpenses(user.id, filters);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadCategories = async () => {
    if (!user) return;
    try {
      const data = await expenseService.getCategories(user.id);
      setCategories(data);
      
      if (data.length === 0) {
        await expenseService.createDefaultCategories(user.id);
        const newData = await expenseService.getCategories(user.id);
        setCategories(newData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    if (!user) return;
    try {
      const data = await expenseService.getTags(user.id);
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadExpenses(), loadCategories(), loadTags()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [filters]);

  const createExpense = async (input: CreateExpenseInput): Promise<Expense> => {
    if (!user) throw new Error('User not authenticated');
    const expense = await expenseService.createExpense(user.id, input);
    await loadExpenses();
    return expense;
  };

  const updateExpense = async (id: string, input: UpdateExpenseInput): Promise<Expense> => {
    const expense = await expenseService.updateExpense(id, input);
    await loadExpenses();
    return expense;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await expenseService.deleteExpense(id);
    await loadExpenses();
  };

  const createCategory = async (name: string, color: string, icon?: string): Promise<ExpenseCategory> => {
    if (!user) throw new Error('User not authenticated');
    const category = await expenseService.createCategory(user.id, name, color, icon);
    await loadCategories();
    return category;
  };

  const updateCategory = async (id: string, name: string, color: string, icon?: string): Promise<ExpenseCategory> => {
    const category = await expenseService.updateCategory(id, name, color, icon);
    await loadCategories();
    return category;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await expenseService.deleteCategory(id);
    await loadCategories();
  };

  const createTag = async (name: string, color: string): Promise<ExpenseTag> => {
    if (!user) throw new Error('User not authenticated');
    const tag = await expenseService.createTag(user.id, name, color);
    await loadTags();
    return tag;
  };

  const updateTag = async (id: string, name: string, color: string): Promise<ExpenseTag> => {
    const tag = await expenseService.updateTag(id, name, color);
    await loadTags();
    return tag;
  };

  const deleteTag = async (id: string): Promise<void> => {
    await expenseService.deleteTag(id);
    await loadTags();
  };

  const getSpendingSummary = async (startDate: string, endDate: string): Promise<SpendingSummary> => {
    if (!user) throw new Error('User not authenticated');
    return expenseService.getSpendingSummary(user.id, startDate, endDate);
  };

  const getAnalyticsData = async (
    period: TimePeriod,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<AnalyticsData> => {
    if (!user) throw new Error('User not authenticated');
    return expenseService.getAnalyticsData(user.id, period, customStartDate, customEndDate);
  };

  const value = {
    expenses,
    categories,
    tags,
    loading,
    filters,
    setFilters,
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
    getSpendingSummary,
    getAnalyticsData,
    refreshExpenses: loadExpenses,
    refreshCategories: loadCategories,
    refreshTags: loadTags,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
