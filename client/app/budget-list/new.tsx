import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { createBudgetList, createBudgetItem } from '../../services/budgetListService';
import { useBudgetList } from '../../contexts/BudgetListContext';
import { CURRENCIES } from '../../constants/expenseCategories';

interface BudgetItemLocal {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function NewBudgetListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshBudgetLists } = useBudgetList();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [currency, setCurrency] = useState('LRD');
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [items, setItems] = useState<BudgetItemLocal[]>([]);
  
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPrice, setItemPrice] = useState('');

  const handleAddItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!itemPrice || parseFloat(itemPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newItem: BudgetItemLocal = {
      id: Date.now().toString(),
      name: itemName.trim(),
      quantity: parseInt(itemQuantity) || 1,
      price: parseFloat(itemPrice),
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemQuantity('1');
    setItemPrice('');
    setShowItemForm(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotalEstimated = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!totalBudget || parseFloat(totalBudget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      setLoading(true);
      const budgetList = await createBudgetList(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        total_budget: parseFloat(totalBudget),
        currency: currency,
        purpose: purpose.trim() || undefined,
        recipient: recipient.trim() || undefined,
      });

      if (items.length > 0) {
        for (const item of items) {
          await createBudgetItem({
            budget_list_id: budgetList.id,
            item_name: item.name,
            quantity: item.quantity,
            estimated_price: item.price,
          });
        }
      }

      await refreshBudgetLists();
      Alert.alert('Success', 'Budget list created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating budget list:', error);
      Alert.alert('Error', 'Failed to create budget list');
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);
  const totalEstimated = getTotalEstimated();
  const remaining = parseFloat(totalBudget || '0') - totalEstimated;
  const isOverBudget = remaining < 0;

  const renderItem = ({ item }: { item: BudgetItemLocal }) => {
    const total = item.quantity * item.price;
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemDetails}>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>
              {selectedCurrency?.symbol}{item.price.toFixed(2)} each
            </Text>
          </View>
          <Text style={styles.itemTotal}>
            Total: {selectedCurrency?.symbol}{total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleRemoveItem(item.id)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrencyPicker = () => (
    <Modal visible={showCurrencyPicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.currencyOption,
                  currency === item.code && styles.currencyOptionActive,
                ]}
                onPress={() => {
                  setCurrency(item.code);
                  setShowCurrencyPicker(false);
                }}
              >
                <Text style={styles.currencySymbol}>{item.symbol}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                  <Text style={styles.currencyName}>{item.name}</Text>
                </View>
                {currency === item.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#FF8C00" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderItemForm = () => (
    <Modal visible={showItemForm} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={() => setShowItemForm(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Item Name</Text>
              <TextInput
                style={styles.formInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g., School Bag, Notebook"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.formSection, { flex: 2, marginLeft: 12 }]}>
                <Text style={styles.formLabel}>Price (per item)</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currencyLabel}>{selectedCurrency?.symbol}</Text>
                  <TextInput
                    style={styles.priceValue}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {itemName && itemPrice && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Text style={styles.previewText}>
                  {itemQuantity || '1'} × {itemName} = {selectedCurrency?.symbol}
                  {(parseFloat(itemPrice || '0') * parseInt(itemQuantity || '1')).toFixed(2)}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Budget List</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., School Supplies"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this budget for?"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Budget Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency</Text>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <View style={styles.currencySelectorContent}>
                <Text style={styles.currencySelectorSymbol}>{selectedCurrency?.symbol}</Text>
                <Text style={styles.currencySelectorText}>{selectedCurrency?.code}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Budget</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbolLarge}>{selectedCurrency?.symbol}</Text>
              <TextInput
                style={styles.amountInput}
                value={totalBudget}
                onChangeText={setTotalBudget}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purpose (optional)</Text>
            <TextInput
              style={styles.input}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g., Back to School"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient (optional)</Text>
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="e.g., Mom, Sponsor"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items (optional)</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowItemForm(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FF8C00" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Add items to plan your spending</Text>

          {items.length > 0 ? (
            <>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.itemsList}
              />
              
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items:</Text>
                  <Text style={styles.summaryValue}>{items.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated:</Text>
                  <Text style={styles.summaryValue}>
                    {selectedCurrency?.symbol}{totalEstimated.toFixed(2)}
                  </Text>
                </View>
                {totalBudget && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, styles.summaryLabelBold]}>
                        {isOverBudget ? 'Over Budget:' : 'Remaining:'}
                      </Text>
                      <Text style={[styles.summaryValue, styles.summaryValueBold, isOverBudget && styles.overBudget]}>
                        {selectedCurrency?.symbol}{Math.abs(remaining).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyItems}>
              <Ionicons name="cart-outline" size={48} color="#666" />
              <Text style={styles.emptyItemsText}>No items yet</Text>
              <Text style={styles.emptyItemsSubtext}>Tap + to add items</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Create Budget List</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderCurrencyPicker()}
      {renderItemForm()}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
  },
  currencySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySelectorSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
  },
  currencySelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySymbolLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addItemButton: {
    padding: 4,
  },
  itemsList: {
    marginTop: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  itemPrice: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8C00',
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  summaryLabelBold: {
    fontWeight: '700',
    color: '#FFF',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 8,
  },
  overBudget: {
    color: '#FF4444',
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  createButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
  modalBody: {
    padding: 20,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  currencyOptionActive: {
    backgroundColor: '#FF8C0020',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8C00',
    width: 40,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  currencyName: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFF',
  },
  formRow: {
    flexDirection: 'row',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
    marginRight: 8,
  },
  priceValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    paddingVertical: 14,
  },
  previewCard: {
    backgroundColor: '#FF8C0020',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF8C00',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  addButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
