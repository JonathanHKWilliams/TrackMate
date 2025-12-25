import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getBudgetLists } from '../services/budgetListService';
import { BudgetListSummary } from '../types/budgetList';

interface BudgetListContextType {
  budgetLists: BudgetListSummary[];
  loading: boolean;
  refreshBudgetLists: () => Promise<void>;
}

const BudgetListContext = createContext<BudgetListContextType | undefined>(undefined);

export function BudgetListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [budgetLists, setBudgetLists] = useState<BudgetListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBudgetLists = async () => {
    if (!user) {
      setBudgetLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const lists = await getBudgetLists(user.id);
      setBudgetLists(lists);
    } catch (error) {
      console.error('Error loading budget lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetLists();
  }, [user]);

  const refreshBudgetLists = async () => {
    await loadBudgetLists();
  };

  return (
    <BudgetListContext.Provider value={{ budgetLists, loading, refreshBudgetLists }}>
      {children}
    </BudgetListContext.Provider>
  );
}

export function useBudgetList() {
  const context = useContext(BudgetListContext);
  if (context === undefined) {
    throw new Error('useBudgetList must be used within a BudgetListProvider');
  }
  return context;
}
