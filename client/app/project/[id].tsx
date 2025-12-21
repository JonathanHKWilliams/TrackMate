import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectInput, PROJECT_STATUS_OPTIONS, PROJECT_COLORS, PROJECT_ICONS, normalizeProjectIcon } from '../../types/project';
import { getProject, createProject, updateProject, deleteProject } from '../../services/projectService';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'completed' | 'archived'>('active');
  const [color, setColor] = useState('#FF8C00');
  const [icon, setIcon] = useState('folder');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadProject = async () => {
    try {
      const project = await getProject(id as string);
      if (project) {
        setName(project.name);
        setDescription(project.description || '');
        setStatus(project.status);
        setColor(project.color);
        setIcon(normalizeProjectIcon(project.icon));
        setStartDate(project.start_date ? new Date(project.start_date) : undefined);
        setEndDate(project.end_date ? new Date(project.end_date) : undefined);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    setSaving(true);
    try {
      const projectInput: ProjectInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        color,
        icon,
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
      };

      if (isNew) {
        await createProject(user.id, projectInput);
      } else {
        await updateProject(id as string, projectInput);
      }

      router.back();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure? This will also delete all tasks in this project.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
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
        <Text style={styles.headerTitle}>{isNew ? 'New Project' : 'Edit Project'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter project name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter project description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.optionsGrid}>
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  status === option.value && { backgroundColor: option.color + '30', borderColor: option.color },
                ]}
                onPress={() => setStatus(option.value)}
              >
                <Text style={[styles.optionText, status === option.value && { color: option.color }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {PROJECT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorButton, { backgroundColor: c }, color === c && styles.colorButtonSelected]}
                onPress={() => setColor(c)}
              >
                {color === c && <Ionicons name="checkmark" size={20} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {PROJECT_ICONS.map((i) => (
              <TouchableOpacity
                key={i}
                style={[styles.iconButton, icon === i && { backgroundColor: color + '30', borderColor: color }]}
                onPress={() => setIcon(i)}
              >
                <Ionicons name={i as any} size={24} color={icon === i ? color : '#B0B0B0'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
            <Ionicons name="calendar" size={20} color="#FF8C00" />
            <Text style={styles.dateText}>
              {startDate ? startDate.toLocaleDateString() : 'Select start date'}
            </Text>
            {startDate && (
              <TouchableOpacity onPress={() => setStartDate(undefined)}>
                <Ionicons name="close-circle" size={20} color="#B0B0B0" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
            <Ionicons name="calendar" size={20} color="#FF8C00" />
            <Text style={styles.dateText}>
              {endDate ? endDate.toLocaleDateString() : 'Select end date'}
            </Text>
            {endDate && (
              <TouchableOpacity onPress={() => setEndDate(undefined)}>
                <Ionicons name="close-circle" size={20} color="#B0B0B0" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
        </View>

        {!isNew && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete Project</Text>
          </TouchableOpacity>
        )}

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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  saveButtonDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  optionText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#FFF',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 32,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF4444',
  },
});
