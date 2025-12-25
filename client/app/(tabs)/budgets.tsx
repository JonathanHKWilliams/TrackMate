import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../../contexts/BudgetContext';
import { useBudgetList } from '../../contexts/BudgetListContext';

export default function BudgetsScreen() {
  const router = useRouter();
  const { activeBudgetsWithSpending } = useBudget();
  const { budgetLists } = useBudgetList();

  const features = [
    {
      id: 'budget-lists',
      title: 'Budget Lists',
      description: 'Plan purchases and create shopping lists',
      icon: 'list-outline',
      color: '#4ECDC4',
      route: '/budget-list',
      count: budgetLists.length,
      stats: `${budgetLists.length} ${budgetLists.length === 1 ? 'list' : 'lists'}`,
    },
    {
      id: 'budget-tracking',
      title: 'Budget Tracking',
      description: 'Monitor spending against budget limits',
      icon: 'pie-chart-outline',
      color: '#FF8C00',
      route: '/budget',
      count: activeBudgetsWithSpending.length,
      stats: `${activeBudgetsWithSpending.length} active`,
    },
  ];

  const renderFeatureCard = (feature: typeof features[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => router.push(feature.route as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
        <Ionicons name={feature.icon as any} size={32} color={feature.color} />
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
        <Text style={styles.title}>Budgets</Text>
        <Text style={styles.subtitle}>Manage your budgets and spending</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Features</Text>
          {features.map(renderFeatureCard)}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#FF8C00" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Budget Management</Text>
            <Text style={styles.infoText}>
              Create budget lists to plan purchases, or set budget limits to track your spending.
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
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    borderRadius: 1,
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
    padding: 16,
    borderWidth: 0,
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
