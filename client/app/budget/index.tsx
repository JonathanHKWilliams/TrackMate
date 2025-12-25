import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../../contexts/BudgetContext';
import { BudgetWithSpending } from '../../types/budget';
import { getCurrencySymbol } from '../../constants/expenseCategories';
import { checkBudgetAlert } from '../../services/budgetService';

export default function BudgetScreen() {
  const router = useRouter();
  const { activeBudgetsWithSpending, loading, refreshBudgets } = useBudget();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBudgets();
    setRefreshing(false);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#FF4444';
    if (percentage >= 80) return '#FFD93D';
    return '#4ECDC4';
  };

  const renderBudgetCard = ({ item }: { item: BudgetWithSpending }) => {
    const progressColor = getProgressColor(item.percentage_used);
    const alert = checkBudgetAlert(item);
    const currency = getCurrencySymbol('LRD');

    return (
      <TouchableOpacity
        style={styles.budgetCard}
        onPress={() => router.push(`/budget/${item.id}` as any)}
      >
        {alert.shouldAlert && (
          <View style={[styles.alertBanner, { backgroundColor: progressColor + '20' }]}>
            <Ionicons name="warning" size={16} color={progressColor} />
            <Text style={[styles.alertText, { color: progressColor }]}>{alert.message}</Text>
          </View>
        )}

        <View style={styles.budgetHeader}>
          <View style={styles.budgetTitleRow}>
            <Text style={styles.budgetName}>{item.name}</Text>
            {item.category_name && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category_name}</Text>
              </View>
            )}
          </View>
          <Text style={styles.budgetPeriod}>{item.period}</Text>
        </View>

        <View style={styles.amountRow}>
          <View>
            <Text style={styles.spentLabel}>Spent</Text>
            <Text style={[styles.spentAmount, { color: progressColor }]}>
              {currency}{item.total_spent.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetAmount}>
              {currency}{item.amount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.remainingLabel}>Remaining</Text>
            <Text style={[styles.remainingAmount, { color: item.remaining >= 0 ? '#4ECDC4' : '#FF4444' }]}>
              {currency}{Math.abs(item.remaining).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(item.percentage_used, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.percentage_used.toFixed(0)}%</Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#B0B0B0" />
          <Text style={styles.dateText}>
            {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/budget/new' as any)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeBudgetsWithSpending}
        renderItem={renderBudgetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#2A2A2A" />
            <Text style={styles.emptyTitle}>No Active Budgets</Text>
            <Text style={styles.emptyText}>
              Create a budget to track your spending and stay on target
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/budget/new' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  categoryBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#FF8C00',
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#B0B0B0',
    textTransform: 'capitalize',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#2A2A2A',
  },
  spentLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  remainingLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    minWidth: 40,
    textAlign: 'right',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 1,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
