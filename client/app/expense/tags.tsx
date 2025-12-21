import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpense } from '../../contexts/ExpenseContext';
import { ExpenseTag } from '../../types/expense';

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#A8E6CF',
  '#FF8B94', '#FF8C00', '#B4A7D6', '#6C5CE7', '#B0B0B0',
];

export default function TagsScreen() {
  const router = useRouter();
  const { tags, createTag, updateTag, deleteTag, refreshTags } = useExpense();
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<ExpenseTag | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleOpenModal = (tag?: ExpenseTag) => {
    if (tag) {
      setEditingTag(tag);
      setName(tag.name);
      setSelectedColor(tag.color);
    } else {
      setEditingTag(null);
      setName('');
      setSelectedColor(PRESET_COLORS[0]);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      if (editingTag) {
        await updateTag(editingTag.id, name.trim(), selectedColor);
      } else {
        await createTag(name.trim(), selectedColor);
      }
      setShowModal(false);
      await refreshTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      Alert.alert('Error', 'Failed to save tag');
    }
  };

  const handleDelete = (tag: ExpenseTag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tag.id);
              await refreshTags();
            } catch (error) {
              console.error('Error deleting tag:', error);
              Alert.alert('Error', 'Failed to delete tag');
            }
          },
        },
      ]
    );
  };

  const renderTag = ({ item }: { item: ExpenseTag }) => (
    <View style={[styles.tagCard, { backgroundColor: item.color + '20' }]}>
      <View style={styles.tagInfo}>
        <View style={[styles.tagDot, { backgroundColor: item.color }]} />
        <Text style={[styles.tagName, { color: item.color }]}>{item.name}</Text>
      </View>
      <View style={styles.tagActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleOpenModal(item)}
        >
          <Ionicons name="pencil" size={20} color={item.color} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTag ? 'Edit Tag' : 'New Tag'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Tag name"
              placeholderTextColor="#B0B0B0"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingTag ? 'Update' : 'Create'}
              </Text>
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
        <Text style={styles.title}>Tags</Text>
        <TouchableOpacity onPress={() => handleOpenModal()}>
          <Ionicons name="add" size={24} color="#FF8C00" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tags}
        renderItem={renderTag}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={64} color="#B0B0B0" />
            <Text style={styles.emptyText}>No tags yet</Text>
          </View>
        }
      />

      {renderModal()}
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
  listContent: {
    padding: 16,
  },
  tagCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tagActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 16,
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
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  saveButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
