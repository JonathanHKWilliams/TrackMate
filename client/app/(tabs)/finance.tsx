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

export default function MyHubScreen() {
  const router = useRouter();
  const { expenses } = useExpense();
  const { activeBudgetsWithSpending } = useBudget();
  const { budgetLists } = useBudgetList();

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  };

  const features = [
    {
      id: 'expenses',
      title: 'Expenses',
      description: 'Track your spending and manage expenses',
      imageSource: require('../../assets/images/Expense.png'),
      color: '#FF8C00',
      route: '/expense-hub',
      count: expenses.length,
      stats: `LRD ${getTotalExpenses().toFixed(2)}`,
    },
    {
      id: 'budgets',
      title: 'Budgets',
      description: 'Budget tracking and shopping lists',
      imageSource: require('../../assets/images/Budget.png'),
      color: '#4ECDC4',
      route: '/budget-hub',
      count: activeBudgetsWithSpending.length + budgetLists.length,
      stats: `${activeBudgetsWithSpending.length} tracking, ${budgetLists.length} lists`,
    },
  ];

  const renderFeatureCard = (feature: typeof features[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => router.push(feature.route as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
        <Image 
          source={feature.imageSource} 
          style={styles.featureImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {feature.count > 0 && (
            <View style={[styles.badge, { backgroundColor: feature.color }]}>
              <Text style={styles.badgeText}>{feature.count}</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
        <Text style={styles.featureStats}>{feature.stats}</Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#B0B0B0" />
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
          <Text style={styles.sectionTitle}>Financial Tools</Text>
          {features.map(renderFeatureCard)}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#FF8C00" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Finance</Text>
            <Text style={styles.infoText}>
              Track expenses, set budget limits, and create shopping lists all in one place.
            </Text>
          </View>
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
    color: '#FFF',
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureImage: {
    width: 70,
    height: 200,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 6,
  },
  featureStats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#000000ff',
    borderRadius: 0,
    borderTopColor: '#747474ff',
    padding: 16,
    borderTopWidth: 0,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
});
