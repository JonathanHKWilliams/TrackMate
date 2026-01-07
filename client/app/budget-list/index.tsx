import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetList } from '../../contexts/BudgetListContext';
import { BudgetListSummary } from '../../types/budgetList';
import { calculateBudgetProgress } from '../../services/budgetListService';

export default function BudgetListScreen() {
  const router = useRouter();
  const { budgetLists, loading, refreshBudgetLists } = useBudgetList();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshBudgetLists();
    }, [refreshBudgetLists])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBudgetLists();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#B0B0B0';
      case 'sent':
        return '#4ECDC4';
      case 'approved':
        return '#4CAF50';
      case 'completed':
        return '#FF8C00';
      default:
        return '#B0B0B0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return 'document-text-outline';
      case 'sent':
        return 'send-outline';
      case 'approved':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-circle-outline';
      default:
        return 'document-text-outline';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#FF4444';
    if (percentage >= 80) return '#FFD93D';
    return '#4ECDC4';
  };

  const renderBudgetListCard = ({ item }: { item: BudgetListSummary }) => {
    const progress = calculateBudgetProgress(item);
    const progressColor = getProgressColor(progress.percentage);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/budget-list/${item.list_id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.list_title}
            </Text>
            {item.purpose && (
              <Text style={styles.purpose} numberOfLines={1}>
                {item.purpose}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {item.recipient && (
          <View style={styles.recipientContainer}>
            <Ionicons name="person-outline" size={14} color="#B0B0B0" />
            <Text style={styles.recipientText}>For: {item.recipient}</Text>
          </View>
        )}

        <View style={styles.budgetInfo}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetAmount}>
              {item.currency} {item.total_budget.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Estimated</Text>
            <Text style={[styles.budgetAmount, progress.isOverBudget && styles.overBudget]}>
              {item.currency} {item.total_estimated.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetAmount, progress.isOverBudget && styles.overBudget]}>
              {item.currency} {progress.remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress.percentage, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: progressColor }]}>
            {progress.percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.itemCount}>
            <Ionicons name="list-outline" size={16} color="#B0B0B0" />
            <Text style={styles.itemCountText}>
              {item.item_count} {item.item_count === 1 ? 'item' : 'items'}
            </Text>
          </View>
          {item.purchased_count > 0 && (
            <View style={styles.purchasedCount}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.purchasedCountText}>
                {item.purchased_count} purchased
              </Text>
            </View>
          )}
        </View>

        {progress.isOverBudget && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color="#FF4444" />
            <Text style={styles.warningText}>
              Over budget by {item.currency} {Math.abs(progress.remaining).toFixed(2)}
            </Text>
          </View>
        )}
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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Budget Lists</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={budgetLists}
        renderItem={renderBudgetListCard}
        keyExtractor={(item) => item.list_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#B0B0B0" />
            <Text style={styles.emptyText}>No budget lists yet</Text>
            <Text style={styles.emptySubtext}>
              Create a list to plan your purchases
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/budget-list/new' as any)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  purpose: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  recipientText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  budgetInfo: {
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  overBudget: {
    color: '#FF4444',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCountText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  purchasedCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purchasedCountText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FF444420',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
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
});
