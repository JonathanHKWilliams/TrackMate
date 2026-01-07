import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Estimate } from '../types/estimate';
import { 
  getEstimates, 
  createEstimate as createEstimateService, 
  updateEstimate as updateEstimateService, 
  deleteEstimate as deleteEstimateService 
} from '../services/estimateService';

interface EstimateContextType {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  createEstimate: (estimateData: Partial<Estimate>) => Promise<void>;
  updateEstimate: (id: string, estimateData: Partial<Estimate>) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
  refreshEstimates: () => Promise<void>;
  getEstimateById: (id: string) => Estimate | undefined;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
};

interface EstimateProviderProps {
  children: ReactNode;
}

export const EstimateProvider: React.FC<EstimateProviderProps> = ({ children }) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEstimates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEstimates();
      setEstimates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: Partial<Estimate>) => {
    try {
      setError(null);
      const newEstimate = await createEstimateService(estimateData);
      setEstimates(prev => [newEstimate, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create estimate');
      throw err;
    }
  };

  const updateEstimate = async (id: string, estimateData: Partial<Estimate>) => {
    try {
      setError(null);
      const updatedEstimate = await updateEstimateService(id, estimateData);
      setEstimates(prev => prev.map(estimate => 
        estimate.id === id ? updatedEstimate : estimate
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update estimate');
      throw err;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      setError(null);
      await deleteEstimateService(id);
      setEstimates(prev => prev.filter(estimate => estimate.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete estimate');
      throw err;
    }
  };

  const getEstimateById = (id: string) => {
    return estimates.find(estimate => estimate.id === id);
  };

  useEffect(() => {
    refreshEstimates();
  }, []);

  return (
    <EstimateContext.Provider
      value={{
        estimates,
        loading,
        error,
        createEstimate,
        updateEstimate,
        deleteEstimate,
        refreshEstimates,
        getEstimateById,
      }}
    >
      {children}
    </EstimateContext.Provider>
  );
};
