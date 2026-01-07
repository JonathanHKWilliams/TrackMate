import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../contexts/AuthContext';
import {
  getBudgetListWithItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  toggleItemPurchased,
  updateBudgetList,
  deleteBudgetList,
  generateBudgetListPDF,
  calculateBudgetProgress,
} from '../../services/budgetListService';
import { BudgetListWithItems, BudgetItem, ITEM_CATEGORIES, ITEM_PRIORITIES } from '../../types/budgetList';
import { useBudgetList } from '../../contexts/BudgetListContext';

export default function BudgetListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { refreshBudgetLists } = useBudgetList();

  const [budgetList, setBudgetList] = useState<BudgetListWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const loadBudgetList = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      const data = await getBudgetListWithItems(id);
      setBudgetList(data);
    } catch (error) {
      console.error('Error loading budget list:', error);
      Alert.alert('Error', 'Failed to load budget list');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgetList();
    }, [loadBudgetList])
  );

  const resetForm = () => {
    setItemName('');
    setItemDescription('');
    setQuantity('1');
    setEstimatedPrice('');
    setCategory('');
    setPriority('medium');
    setNotes('');
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!budgetList || !user) return;

    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (!estimatedPrice || parseFloat(estimatedPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      await createBudgetItem({
        budget_list_id: budgetList.id,
        item_name: itemName.trim(),
        description: itemDescription.trim() || undefined,
        quantity: parseInt(quantity) || 1,
        estimated_price: parseFloat(estimatedPrice),
        category: category || undefined,
        priority,
        notes: notes.trim() || undefined,
      });

      await loadBudgetList();
      await refreshBudgetLists();
      resetForm();
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateBudgetItem(editingItem.id, {
        item_name: itemName.trim(),
        description: itemDescription.trim() || undefined,
        quantity: parseInt(quantity) || 1,
        estimated_price: parseFloat(estimatedPrice),
        category: category || undefined,
        priority,
        notes: notes.trim() || undefined,
      });

      await loadBudgetList();
      await refreshBudgetLists();
      resetForm();
      setShowAddItem(false);
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (item: BudgetItem) => {
    Alert.alert('Delete Item', `Delete "${item.item_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudgetItem(item.id);
            await loadBudgetList();
            await refreshBudgetLists();
          } catch (error) {
            console.error('Error deleting item:', error);
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const handleTogglePurchased = async (item: BudgetItem) => {
    try {
      await toggleItemPurchased(item.id, !item.is_purchased);
      await loadBudgetList();
    } catch (error) {
      console.error('Error toggling purchased:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setItemName(item.item_name);
    setItemDescription(item.description || '');
    setQuantity(item.quantity.toString());
    setEstimatedPrice(item.estimated_price.toString());
    setCategory(item.category || '');
    setPriority(item.priority);
    setNotes(item.notes || '');
    setShowAddItem(true);
  };

  const handleShare = async () => {
    if (!budgetList) return;

    try {
      const htmlContent = generateBudgetListPDF(budgetList);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${budgetList.title}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing budget list:', error);
      Alert.alert('Error', 'Failed to generate and share PDF');
    }
  };

  const handleMarkAsSent = async () => {
    if (!budgetList) return;

    try {
      await updateBudgetList(budgetList.id, { status: 'sent' });
      await loadBudgetList();
      await refreshBudgetLists();
      Alert.alert('Success', 'Budget list marked as sent');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDeleteList = () => {
    if (!budgetList) return;

    Alert.alert('Delete Budget List', `Delete "${budgetList.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudgetList(budgetList.id);
            await refreshBudgetLists();
            router.back();
          } catch (error) {
            console.error('Error deleting list:', error);
            Alert.alert('Error', 'Failed to delete list');
          }
        },
      },
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF4444';
      case 'medium':
        return '#FF8C00';
      case 'low':
        return '#4ECDC4';
      default:
        return '#B0B0B0';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'star';
      case 'medium':
        return 'star-half';
      case 'low':
        return 'star-outline';
      default:
        return 'star-outline';
    }
  };

  const renderItem = ({ item }: { item: BudgetItem }) => {
    const total = item.estimated_price * item.quantity;

    return (
      <View style={[styles.itemCard, item.is_purchased && styles.itemCardPurchased]}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleTogglePurchased(item)}
        >
          <Ionicons
            name={item.is_purchased ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.is_purchased ? '#4CAF50' : '#B0B0B0'}
          />
        </TouchableOpacity>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, item.is_purchased && styles.itemNamePurchased]}>
              {item.item_name}
            </Text>
            <Ionicons
              name={getPriorityIcon(item.priority) as any}
              size={16}
              color={getPriorityColor(item.priority)}
            />
          </View>

          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}

          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}

          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>
              {item.quantity} × LRD {item.estimated_price.toFixed(2)} = LRD {total.toFixed(2)}
            </Text>
          </View>

          {item.notes && (
            <Text style={styles.itemNotes}>📝 {item.notes}</Text>
          )}
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.actionButton}>
            <Ionicons name="pencil" size={20} color="#FF8C00" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteItem(item)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddItemModal = () => (
    <Modal visible={showAddItem} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddItem(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>
                Item Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.formInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g., School Bag, Notebook"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={itemDescription}
                onChangeText={setItemDescription}
                placeholder="Additional details..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.formSection, { flex: 2, marginLeft: 12 }]}>
                <Text style={styles.formLabel}>
                  Price <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currency}>LRD</Text>
                  <TextInput
                    style={styles.priceValue}
                    value={estimatedPrice}
                    onChangeText={setEstimatedPrice}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryOptions}>
                  {ITEM_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        category === cat && styles.categoryOptionActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          category === cat && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityOptions}>
                {ITEM_PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      priority === p && styles.priorityOptionActive,
                      { borderColor: getPriorityColor(p) },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Ionicons
                      name={getPriorityIcon(p) as any}
                      size={20}
                      color={priority === p ? getPriorityColor(p) : '#666'}
                    />
                    <Text
                      style={[
                        styles.priorityOptionText,
                        priority === p && { color: getPriorityColor(p) },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingItem ? handleUpdateItem : handleAddItem}
            >
              <Text style={styles.saveButtonText}>
                {editingItem ? 'Update Item' : 'Add Item'}
              </Text>
            </TouchableOpacity>
          </View>
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

  if (!budgetList) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Budget list not found</Text>
      </View>
    );
  }

  const progress = calculateBudgetProgress(budgetList);
  const progressColor = progress.percentage >= 100 ? '#FF4444' : progress.percentage >= 80 ? '#FFD93D' : '#4ECDC4';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {budgetList.title}
        </Text>
        <TouchableOpacity onPress={handleDeleteList} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryAmount}>
              {budgetList.currency} {budgetList.total_budget.toFixed(2)}
            </Text>
          </View>
          {budgetList.recipient && (
            <View style={styles.recipientBadge}>
              <Ionicons name="person" size={14} color="#FF8C00" />
              <Text style={styles.recipientText}>{budgetList.recipient}</Text>
            </View>
          )}
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

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Estimated</Text>
            <Text style={[styles.summaryItemValue, progress.isOverBudget && styles.overBudget]}>
              {budgetList.currency} {budgetList.total_estimated.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Remaining</Text>
            <Text style={[styles.summaryItemValue, progress.isOverBudget && styles.overBudget]}>
              {budgetList.currency} {progress.remaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Items</Text>
            <Text style={styles.summaryItemValue}>
              {budgetList.purchased_count}/{budgetList.item_count}
            </Text>
          </View>
        </View>

        {progress.isOverBudget && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color="#FF4444" />
            <Text style={styles.warningText}>
              Over budget by {budgetList.currency} {Math.abs(progress.remaining).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FF8C00" />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
          {budgetList.status === 'draft' && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleMarkAsSent}>
              <Ionicons name="send" size={20} color="#4ECDC4" />
              <Text style={styles.actionBtnText}>Mark as Sent</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={budgetList.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#B0B0B0" />
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Add items to your list</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddItem(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderAddItemModal()}
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
  errorText: {
    fontSize: 16,
    color: '#FF4444',
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginHorizontal: 12,
  },
  deleteButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF8C0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipientText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  overBudget: {
    color: '#FF4444',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FF444420',
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  itemCardPurchased: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: '#B0B0B0',
  },
  itemDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  itemFooter: {
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  itemNotes: {
    fontSize: 12,
    color: '#B0B0B0',
    fontStyle: 'italic',
    marginTop: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  required: {
    color: '#FF4444',
  },
  formInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currency: {
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
    paddingVertical: 12,
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#FF8C00',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#FFF',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityOptionActive: {
    backgroundColor: 'transparent',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF0',
  },
});
