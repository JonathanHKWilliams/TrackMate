import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ConnectivityProvider, useConnectivity } from '../contexts/ConnectivityContext';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import { BudgetProvider } from '../contexts/BudgetContext';
import { BudgetListProvider } from '../contexts/BudgetListContext';
import { EstimateProvider } from '../contexts/EstimateContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { requestNotificationPermissions } from '../services/notificationService';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  useFrameworkReady();
  const { online } = useConnectivity();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      requestNotificationPermissions();
    }
  }, [user]);

  return (
    <>
      {!online && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#000000', paddingVertical: 6, paddingHorizontal: 12, zIndex: 1000 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>Offline mode: changes will sync when you&apos;re back online</Text>
        </View>
      )}
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
        animation: 'fade',
        animationDuration: 150,
      }}>
        <Stack.Screen 
          name="auth/sign-in" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="task/[id]" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="project/[id]" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="note/[id]" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="expense/new" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="expense/[id]" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="settings/how-to" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="settings/documentation" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="settings/faq" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="settings/terms" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="settings/privacy" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="estimate-hub" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            contentStyle: { backgroundColor: '#000' },
          }} 
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#000" />
    </>
  );
}

export default function RootLayout() {
  return (
    <ConnectivityProvider>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <ExpenseProvider>
              <BudgetProvider>
                <BudgetListProvider>
                  <EstimateProvider>
                    <AuthGuard>
                      <RootLayoutNav />
                    </AuthGuard>
                  </EstimateProvider>
                </BudgetListProvider>
              </BudgetProvider>
            </ExpenseProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </ConnectivityProvider>
  );
}
