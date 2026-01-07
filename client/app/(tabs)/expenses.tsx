import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpense } from '../../contexts/ExpenseContext';
import { useBudget } from '../../contexts/BudgetContext';
import { Expense } from '../../types/expense';
import { getCurrencySymbol } from '../../constants/expenseCategories';
import { BudgetWithSpending } from '../../types/budget';

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, categories, loading, refreshExpenses } = useExpense();
  const { activeBudgetsWithSpending, refreshBudgets } = useBudget();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshExpenses(), refreshBudgets()]);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refreshExpenses();
      refreshBudgets();
    }, [refreshExpenses, refreshBudgets])
  );

  const getTotalSpending = () => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  };

  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => {
    const categoryColor = item.category?.color || '#B0B0B0';
    const formattedDate = new Date(item.expense_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => router.push(`/expense/${item.id}` as any)}
      >
        <View style={styles.expenseHeader}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.merchant && (
              <Text style={styles.expenseMerchant} numberOfLines={1}>
                {item.merchant}
              </Text>
            )}
          </View>
          <Text style={styles.expenseAmount}>
            {getCurrencySymbol(item.currency || 'LRD')}{Number(item.amount).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.expenseFooter}>
          <Text style={styles.expenseDate}>{formattedDate}</Text>
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                {item.category.name}
              </Text>
            </View>
          )}
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag) => (
              <View
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color + '20' }]}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#FF4444';
    if (percentage >= 80) return '#FFD93D';
    return '#4ECDC4';
  };

  const renderBudgetOverview = () => {
    if (activeBudgetsWithSpending.length === 0) return null;

    return (
      <View style={styles.budgetOverview}>
        <View style={styles.budgetOverviewHeader}>
          <Text style={styles.budgetOverviewTitle}>Active Budgets</Text>
          <TouchableOpacity onPress={() => router.push('/budget' as any)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeBudgetsWithSpending.map((budget: BudgetWithSpending) => {
            const progressColor = getProgressColor(budget.percentage_used);
            return (
              <TouchableOpacity
                key={budget.id}
                style={styles.budgetCard}
                onPress={() => router.push(`/budget/${budget.id}` as any)}
              >
                <Text style={styles.budgetCardName} numberOfLines={1}>
                  {budget.name}
                </Text>
                {budget.category_name && (
                  <Text style={styles.budgetCardCategory} numberOfLines={1}>
                    {budget.category_name}
                  </Text>
                )}
                <View style={styles.budgetCardProgress}>
                  <View style={styles.budgetProgressBar}>
                    <View
                      style={[
                        styles.budgetProgressFill,
                        {
                          width: `${Math.min(budget.percentage_used, 100)}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.budgetCardPercentage, { color: progressColor }]}>
                    {budget.percentage_used.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.budgetCardAmounts}>
                  <Text style={styles.budgetCardSpent}>
                    {getCurrencySymbol('LRD')}{budget.total_spent.toFixed(0)}
                  </Text>
                  <Text style={styles.budgetCardTotal}>
                    / {getCurrencySymbol('LRD')}{budget.amount.toFixed(0)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.addBudgetCard}
            onPress={() => router.push('/budget/new' as any)}
          >
            <Ionicons name="add-circle" size={32} color="#FF8C00" />
            <Text style={styles.addBudgetText}>Add Budget</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderSummaryCard = () => {
    const total = getTotalSpending();
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Total Spending</Text>
          <TouchableOpacity
            onPress={() => router.push('/expense/analytics' as any)}
            style={styles.analyticsButton}
          >
            <Ionicons name="stats-chart" size={20} color="#FF8C00" />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.totalAmount}>
          {getCurrencySymbol(expenses[0]?.currency || 'LRD')}{total.toFixed(2)}
        </Text>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{count}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>
              {getCurrencySymbol(expenses[0]?.currency || 'LRD')}{average.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            <Text style={styles.filterSectionTitle}>Time Period</Text>
            <View style={styles.periodButtons}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.categoryFilters}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryFilterChip,
                    { backgroundColor: category.color + '20' },
                  ]}
                >
                  <Text style={[styles.categoryFilterText, { color: category.color }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  const filteredExpenses = getFilteredExpenses();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/budget-list' as any)}
          >
            <Ionicons name="list-outline" size={24} color="#FF8C00" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="#FF8C00" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#B0B0B0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderBudgetOverview()}
            {renderSummaryCard()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#B0B0B0" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/expense/new' as any)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderFilterModal()}
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 55,
    borderColor: '#2A2A2A',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#000000ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#FF8C00',
    borderBottomWidth: 1,
    gap: 4,
  },
  analyticsButtonText: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1aff',
  },
  expenseCard: {
    backgroundColor: '#141414ff',
    // borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  expenseMerchant: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  expenseDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#B0B0B0',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  filterOptions: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
    marginTop: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FF8C00',
  },
  periodButtonText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFF',
  },
  categoryFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 1,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  budgetOverview: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  budgetOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetOverviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '600',
  },
  budgetCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  budgetCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  budgetCardCategory: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 12,
  },
  budgetCardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  budgetProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetCardPercentage: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  budgetCardAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  budgetCardSpent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  budgetCardTotal: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  addBudgetCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    width: 150,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
});
