import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { checkOnline, isOnline as getIsOnline, onOnlineChange, setOnline } from '../lib/network';
import { flushOfflineQueue } from '../lib/offlineQueue';

type ConnectivityContextType = {
  online: boolean;
  syncNow: () => Promise<{ success: number; failed: number }>;
};

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnlineState] = useState<boolean>(getIsOnline());

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try {
          const s = await Network.getNetworkStateAsync();
          const reachable = s.isConnected && (s.isInternetReachable ?? true);
          setOnline(reachable ? true : false);
          setOnlineState(reachable ? true : false);
        } catch {
          const reachable = await checkOnline();
          setOnline(reachable);
          setOnlineState(reachable);
        }
      }
    });

    const init = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const reachable = state.isConnected && (state.isInternetReachable ?? true);
        setOnline(reachable ? true : false);
        setOnlineState(reachable ? true : false);
        if (reachable) {
          await flushOfflineQueue();
        }
      } catch {
        // fall back to active fetch-based probe
        const reachable = await checkOnline();
        setOnline(reachable);
        setOnlineState(reachable);
        if (reachable) {
          await flushOfflineQueue();
        }
      }

      intervalId = setInterval(async () => {
        try {
          const s = await Network.getNetworkStateAsync();
          const reachable = s.isConnected && (s.isInternetReachable ?? true);
          setOnline(reachable ? true : false);
          setOnlineState(reachable ? true : false);
        } catch {
          const reachable = await checkOnline();
          setOnline(reachable);
          setOnlineState(reachable);
        }
      }, 5000);
    };

    init();

    const un = onOnlineChange(async (nowOnline) => {
      setOnlineState(nowOnline);
      if (nowOnline) {
        await flushOfflineQueue();
      }
    });

    return () => {
      un();
      if (intervalId) clearInterval(intervalId);
      appStateSub.remove();
    };
  }, []);

  const value = useMemo(() => ({
    online,
    syncNow: flushOfflineQueue,
  }), [online]);

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): ConnectivityContextType {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used within a ConnectivityProvider');
  return ctx;
}
