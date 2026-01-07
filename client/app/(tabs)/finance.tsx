import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpense } from '../../contexts/ExpenseContext';
import { useBudget } from '../../contexts/BudgetContext';
import { useBudgetList } from '../../contexts/BudgetListContext';
import { useEstimate } from '../../contexts/EstimateContext';

export default function MyHubScreen() {
  const router = useRouter();
  const { expenses } = useExpense();
  const { activeBudgetsWithSpending } = useBudget();
  const { budgetLists } = useBudgetList();
  const { estimates } = useEstimate();

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  };

  const getTotalEstimates = () => {
    return estimates.reduce((sum, est) => sum + Number(est.total_cost || 0), 0);
  };

  const features = [
    {
      id: 'expenses',
      title: 'Know Your Expenses',
      description: 'Track your spending and manage expenses',
      icon: 'wallet',
      color: '#FF8C00',
      route: '/expense-hub',
      count: expenses.length,
      stats: `LRD ${getTotalExpenses().toFixed(2)}`,
    },
    {
      id: 'budgets',
      title: 'Create Budgets',
      description: 'Budget tracking and shopping lists',
      icon: 'calculator',
      color: '#4ECDC4',
      route: '/budget-hub',
      count: activeBudgetsWithSpending.length + budgetLists.length,
      stats: `${activeBudgetsWithSpending.length} tracking, ${budgetLists.length} lists`,
    },
    {
      id: 'estimates',
      title: 'Create Estimates',
      description: 'Create professional estimates for clients',
      icon: 'document-text',
      color: '#4CAF50',
      route: '/estimate-hub',
      count: estimates.length,
      stats: `LRD ${getTotalEstimates().toFixed(2)}`,
    },
  ];
  
  const renderFeatureCard = (feature: typeof features[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => router.push(feature.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
        <Ionicons name={feature.icon as any} size={32} color="#FFF" />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance</Text>
        <Text style={styles.subtitle}>Manage your money</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          {features.map(renderFeatureCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF8C00',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 24,
    borderWidth: 0,
    borderColor: '#2A2A2A',
    flex: 1,
    minWidth: '40%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});
