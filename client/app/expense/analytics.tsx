import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpense } from '../../contexts/ExpenseContext';
import { AnalyticsData, TimePeriod } from '../../types/expense';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();
  const { getAnalyticsData } = useExpense();
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsData(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
        <TouchableOpacity
          key={p}
          style={[styles.periodButton, period === p && styles.periodButtonActive]}
          onPress={() => setPeriod(p)}
        >
          <Text
            style={[
              styles.periodButtonText,
              period === p && styles.periodButtonTextActive,
            ]}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCard = () => {
    if (!analytics) return null;

    const { summary, comparison } = analytics;
    const changeColor = comparison && comparison.change >= 0 ? '#FF6B6B' : '#4CAF50';
    const changeIcon = comparison && comparison.change >= 0 ? 'trending-up' : 'trending-down';

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Total Spending</Text>
        <Text style={styles.totalAmount}>${summary.total.toFixed(2)}</Text>

        {comparison && (
          <View style={styles.comparisonRow}>
            <Ionicons name={changeIcon} size={16} color={changeColor} />
            <Text style={[styles.comparisonText, { color: changeColor }]}>
              {Math.abs(comparison.changePercentage).toFixed(1)}% vs previous period
            </Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.count}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${summary.average.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!analytics || analytics.summary.byCategory.length === 0) return null;

    const maxTotal = Math.max(...analytics.summary.byCategory.map((c) => c.total));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {analytics.summary.byCategory.map((item) => {
          const barWidth = (item.total / maxTotal) * 100;
          return (
            <View key={item.category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: item.category.color }]}
                  />
                  <Text style={styles.categoryName}>{item.category.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>${item.total.toFixed(2)}</Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${barWidth}%`, backgroundColor: item.category.color },
                  ]}
                />
              </View>
              <View style={styles.categoryFooter}>
                <Text style={styles.categoryCount}>{item.count} expenses</Text>
                <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPaymentMethodBreakdown = () => {
    if (!analytics || analytics.summary.byPaymentMethod.length === 0) return null;

    const getPaymentMethodLabel = (method: string) => {
      const labels: Record<string, string> = {
        cash: 'Cash',
        credit_card: 'Credit Card',
        debit_card: 'Debit Card',
        bank_transfer: 'Bank Transfer',
        digital_wallet: 'Digital Wallet',
        other: 'Other',
      };
      return labels[method] || method;
    };

    const getPaymentMethodIcon = (method: string) => {
      const icons: Record<string, string> = {
        cash: 'cash',
        credit_card: 'card',
        debit_card: 'card-outline',
        bank_transfer: 'swap-horizontal',
        digital_wallet: 'wallet',
        other: 'ellipsis-horizontal',
      };
      return icons[method] || 'help-circle';
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentMethodsGrid}>
          {analytics.summary.byPaymentMethod.map((item) => (
            <View key={item.method} style={styles.paymentMethodCard}>
              <Ionicons
                name={getPaymentMethodIcon(item.method) as any}
                size={24}
                color="#FF8C00"
              />
              <Text style={styles.paymentMethodLabel}>
                {getPaymentMethodLabel(item.method)}
              </Text>
              <Text style={styles.paymentMethodAmount}>${item.total.toFixed(2)}</Text>
              <Text style={styles.paymentMethodPercentage}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTopExpenses = () => {
    if (!analytics || analytics.summary.topExpenses.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Expenses</Text>
        {analytics.summary.topExpenses.map((expense, index) => (
          <TouchableOpacity
            key={expense.id}
            style={styles.topExpenseItem}
            onPress={() => router.push(`/expense/${expense.id}` as any)}
          >
            <View style={styles.topExpenseRank}>
              <Text style={styles.topExpenseRankText}>{index + 1}</Text>
            </View>
            <View style={styles.topExpenseInfo}>
              <Text style={styles.topExpenseTitle} numberOfLines={1}>
                {expense.title}
              </Text>
              <Text style={styles.topExpenseDate}>
                {new Date(expense.expense_date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.topExpenseAmount}>${Number(expense.amount).toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        {renderSummaryCard()}
        {renderCategoryBreakdown()}
        {renderPaymentMethodBreakdown()}
        {renderTopExpenses()}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#000000ff',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  periodButtonTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: '#000000ff',
    borderRadius: 1,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardTitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 50,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
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
  categoryItem: {
    backgroundColor: '#767070ff',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 0,
    marginBottom: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCount: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentMethodCard: {
    width: (width - 56) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 16,
    borderWidth: 0,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentMethodAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
    marginTop: 4,
  },
  paymentMethodPercentage: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },
  topExpenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  topExpenseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topExpenseRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  topExpenseInfo: {
    flex: 1,
  },
  topExpenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  topExpenseDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  topExpenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
  },
  legendLine: {
    width: 16,
    height: 2,
    backgroundColor: '#FF8C00',
    borderRadius: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  chartContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  lineChart: {
    height: 200,
    position: 'relative',
    marginBottom: 12,
  },
  lineSegment: {
    height: 2,
    backgroundColor: '#FF8C00',
    transformOrigin: 'left center',
  },
  dataPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  valueLabel: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  valueLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF8C00',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  chartLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    textAlign: 'center',
    flex: 1,
  },
});
