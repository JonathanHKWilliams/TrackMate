import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpense } from '../../contexts/ExpenseContext';
import { PaymentMethod } from '../../types/expense';
import { getCategoryIcon, CURRENCIES, getCurrencySymbol } from '../../constants/expenseCategories';

export default function NewExpenseScreen() {
  const router = useRouter();
  const { createExpense, categories, tags } = useExpense();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('LRD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'credit_card', label: 'Credit Card', icon: 'card' },
    { value: 'debit_card', label: 'Debit Card', icon: 'card-outline' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'swap-horizontal' },
    { value: 'digital_wallet', label: 'Orange Money', icon: 'phone-portrait' },
    { value: 'mobile_money', label: 'MTN MOMO', icon: 'phone-portrait' },
    { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        title: title.trim(),
        amount: amountNum,
        currency: currency,
        category_id: selectedCategoryId,
        expense_date: expenseDate.toISOString().split('T')[0],
        payment_method: paymentMethod,
        description: description.trim() || undefined,
        merchant: merchant.trim() || undefined,
        tag_ids: selectedTagIds,
      });

      router.back();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you spend on?"
            placeholderTextColor="#B0B0B0"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountRow}>
            <TouchableOpacity
              style={styles.currencyButton}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <Text style={styles.currencyButtonText}>{currency}</Text>
              <Ionicons name="chevron-down" size={16} color="#B0B0B0" />
            </TouchableOpacity>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#B0B0B0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#FF8C00" />
            <Text style={styles.dateButtonText}>
              {expenseDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={expenseDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setExpenseDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethodsGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === method.value && styles.paymentMethodButtonActive,
                ]}
                onPress={() => setPaymentMethod(method.value)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={paymentMethod === method.value ? '#FF8C00' : '#B0B0B0'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === method.value && styles.paymentMethodTextActive,
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategoryId && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategoryId(undefined)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategoryId && styles.categoryChipTextActive,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: category.color + '20' },
                  selectedCategoryId === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <Ionicons
                  name={getCategoryIcon(category.name) as any}
                  size={16}
                  color={selectedCategoryId === category.id ? '#FFF' : category.color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: category.color },
                    selectedCategoryId === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Merchant (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Where did you spend?"
            placeholderTextColor="#B0B0B0"
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes..."
            placeholderTextColor="#B0B0B0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tags (Optional)</Text>
          <View style={styles.tagsContainer}>
            {tags.length === 0 ? (
              <Text style={styles.noTagsText}>No tags available</Text>
            ) : (
              tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    { backgroundColor: tag.color + '20' },
                    selectedTagIds.includes(tag.id) && {
                      backgroundColor: tag.color,
                    },
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      { color: tag.color },
                      selectedTagIds.includes(tag.id) && { color: '#FFF' },
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={styles.currencyOption}
                  onPress={() => {
                    setCurrency(curr.code);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <View>
                    <Text style={styles.currencyOptionCode}>{curr.code}</Text>
                    <Text style={styles.currencyOptionName}>{curr.name}</Text>
                  </View>
                  <Text style={styles.currencyOptionSymbol}>{curr.symbol}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8C00',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    paddingVertical: 16,
    minHeight: 60,
    minWidth: 80,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    width: '48%',
  },
  paymentMethodButtonActive: {
    borderColor: '#FF8C00',
    backgroundColor: '#FF8C00' + '20',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  paymentMethodTextActive: {
    color: '#FF8C00',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 8,
  },
  categoryChipActive: {
    borderColor: '#FF8C00',
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  categoryChipTextActive: {
    color: '#FF8C00',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noTagsText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
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
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  currencyOptionCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  currencyOptionName: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  currencyOptionSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8C00',
  },
});
