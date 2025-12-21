import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense } from '../../types/expense';
import * as expenseService from '../../services/expenseService';
import { getCurrencySymbol } from '../../constants/expenseCategories';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { deleteExpense } = useExpense();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadExpense = async () => {
    try {
      const data = await expenseService.getExpenseById(id as string);
      setExpense(data);
    } catch (error) {
      console.error('Error loading expense:', error);
      Alert.alert('Error', 'Failed to load expense');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      bank_transfer: 'Bank Transfer',
      digital_wallet: 'Orange Money',
      mobile_money: 'MTN MOMO',
      other: 'Other',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!expense) {
    return null;
  }

  const formattedDate = new Date(expense.expense_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Expense Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>
            {getCurrencySymbol(expense.currency || 'LRD')}{Number(expense.amount).toFixed(2)}
          </Text>
          {expense.currency && (
            <Text style={styles.currencyCode}>{expense.currency}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag" size={20} color="#FF8C00" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Title</Text>
              <Text style={styles.detailValue}>{expense.title}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color="#FF8C00" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="wallet" size={20} color="#FF8C00" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {getPaymentMethodLabel(expense.payment_method)}
              </Text>
            </View>
          </View>

          {expense.category && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="folder" size={20} color="#FF8C00" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: expense.category.color + '20' },
                  ]}
                >
                  <View
                    style={[styles.categoryDot, { backgroundColor: expense.category.color }]}
                  />
                  <Text style={[styles.categoryText, { color: expense.category.color }]}>
                    {expense.category.name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {expense.merchant && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="storefront" size={20} color="#FF8C00" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Merchant</Text>
                <Text style={styles.detailValue}>{expense.merchant}</Text>
              </View>
            </View>
          )}

          {expense.description && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="document-text" size={20} color="#FF8C00" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{expense.description}</Text>
              </View>
            </View>
          )}

          {expense.tags && expense.tags.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="pricetags" size={20} color="#FF8C00" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {expense.tags.map((tag) => (
                    <View
                      key={tag.id}
                      style={[styles.tag, { backgroundColor: tag.color + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metadata</Text>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Created</Text>
            <Text style={styles.metadataValue}>
              {new Date(expense.created_at).toLocaleString()}
            </Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Last Updated</Text>
            <Text style={styles.metadataValue}>
              {new Date(expense.updated_at).toLocaleString()}
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
  deleteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  amountCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  amountLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF8C00',
  },
  currencyCode: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
    fontWeight: '600',
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
  detailRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C00' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  metadataValue: {
    fontSize: 14,
    color: '#FFF',
  },
});
