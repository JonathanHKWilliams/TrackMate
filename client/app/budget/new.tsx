import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';
import { useBudget } from '../../contexts/BudgetContext';
import { createBudget, calculateBudgetDates } from '../../services/budgetService';
import { BUDGET_PERIODS } from '../../types/budget';

export default function NewBudgetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories } = useExpense();
  const { refreshBudgets } = useBudget();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const dates = calculateBudgetDates(period);
    setStartDate(dates.start_date);
    setEndDate(dates.end_date);
  }, [period]);

  const handleSave = async () => {
    if (!user || !name.trim() || !amount) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const thresholdNum = parseInt(alertThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 100) {
      Alert.alert('Invalid Threshold', 'Alert threshold must be between 0 and 100');
      return;
    }

    try {
      setSaving(true);
      await createBudget(user.id, {
        name: name.trim(),
        amount: amountNum,
        period,
        category_id: categoryId,
        start_date: startDate,
        end_date: endDate,
        alert_threshold: thresholdNum,
      });
      await refreshBudgets();
      router.back();
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Budget</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Budget Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Monthly Groceries"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>LRD</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Period *</Text>
          <View style={styles.optionsGrid}>
            {BUDGET_PERIODS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  period === option.value && styles.optionButtonActive,
                ]}
                onPress={() => setPeriod(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    period === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category (Optional)</Text>
          <Text style={styles.helperText}>
            Leave empty to track all expenses, or select a category to track specific spending
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !categoryId && styles.categoryChipActive,
              ]}
              onPress={() => setCategoryId(undefined)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !categoryId && styles.categoryChipTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { borderColor: cat.color },
                  categoryId === cat.id && { backgroundColor: cat.color + '30' },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    categoryId === cat.id && { color: cat.color },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Alert Threshold (%)</Text>
          <Text style={styles.helperText}>
            Get notified when you reach this percentage of your budget
          </Text>
          <TextInput
            style={styles.input}
            value={alertThreshold}
            onChangeText={setAlertThreshold}
            placeholder="80"
            placeholderTextColor="#666"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Budget Period</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {new Date(startDate).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#B0B0B0" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>
                {new Date(endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  saveButton: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF8C00',
  },
  saveButtonDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
    borderBottomColor: '#2A2A2A',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8C00',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    paddingVertical: 16,
    minHeight: 60,
    minWidth: 100,
    textAlign: 'right',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonActive: {
    borderBottomWidth: 2,
    backgroundColor: '#FF8C00' + '20',
    borderColor: '#FF8C00',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  optionTextActive: {
    color: '#FF8C00',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF8C00' + '20',
    borderColor: '#FF8C00',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  categoryChipTextActive: {
    color: '#FF8C00',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
