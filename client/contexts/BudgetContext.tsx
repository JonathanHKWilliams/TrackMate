import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Budget, BudgetWithSpending } from '../types/budget';
import { getBudgets, getActiveBudgetsWithSpending } from '../services/budgetService';

interface BudgetContextType {
  budgets: Budget[];
  activeBudgetsWithSpending: BudgetWithSpending[];
  loading: boolean;
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeBudgetsWithSpending, setActiveBudgetsWithSpending] = useState<BudgetWithSpending[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setActiveBudgetsWithSpending([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allBudgets, activeBudgets] = await Promise.all([
        getBudgets(user.id),
        getActiveBudgetsWithSpending(user.id),
      ]);
      setBudgets(allBudgets);
      setActiveBudgetsWithSpending(activeBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBudgets();
  }, [user]);

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        activeBudgetsWithSpending,
        loading,
        refreshBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
