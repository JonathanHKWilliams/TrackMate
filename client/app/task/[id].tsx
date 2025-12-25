import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { TaskInput, REMINDER_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, Priority, ReminderOffset, TaskStatus } from '../../types/task';
import { createTask, updateTask, deleteTask, getTasks } from '../../services/taskService';
import { getProjects } from '../../services/projectService';
import { Project } from '../../types/project';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderOffset, setReminderOffset] = useState<ReminderOffset>(0);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [projectId, setProjectId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
      if (!isNew) {
        loadTask();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, isNew]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      const allProjects = await getProjects(user.id);
      setProjects(allProjects.filter(p => p.status !== 'archived'));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTask = async () => {
    try {
      const tasks = await getTasks(user!.id);
      const task = tasks.find(t => t.id === id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.due_at ? new Date(task.due_at) : undefined);
        setReminderOffset(task.reminder_offset_minutes);
        setPriority(task.priority);
        setStatus(task.status);
        setProjectId(task.project_id);
        setTags(task.tags || []);
      }
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('No Title', 'Please enter a task title');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const taskInput: TaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_at: dueDate?.toISOString(),
        reminder_offset_minutes: reminderOffset,
        priority,
        status,
        project_id: projectId,
        tags,
      };

      if (isNew) {
        await createTask(user.id, taskInput);
      } else {
        await updateTask(id as string, taskInput);
      }

      router.back();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? 'New Task' : 'Edit Task'}</Text>
        <View style={styles.headerActions}>
          {!isNew && (
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={22} color="#FF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description (optional)"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Project (Optional)</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              !projectId && styles.optionButtonActive,
            ]}
            onPress={() => setProjectId(undefined)}
          >
            <Text
              style={[
                styles.optionButtonText,
                !projectId && styles.optionButtonTextActive,
              ]}
            >
              No Project
            </Text>
          </TouchableOpacity>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.optionButton,
                projectId === project.id && styles.optionButtonActive,
              ]}
              onPress={() => setProjectId(project.id)}
            >
              <View style={[styles.priorityDot, { backgroundColor: project.color }]} />
              <Text
                style={[
                  styles.optionButtonText,
                  projectId === project.id && styles.optionButtonTextActive,
                ]}
              >
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.optionsContainer}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                status === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setStatus(option.value)}
            >
              <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
              <Text
                style={[
                  styles.optionButtonText,
                  status === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Due Date & Time (Optional)</Text>
        <View style={styles.dueDateContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { flex: 1 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {dueDate ? dueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }) : 'No due date'}
            </Text>
          </TouchableOpacity>
          {dueDate && (
            <>
              <TouchableOpacity
                style={[styles.dateButton, { flex: 1 }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {dueDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setDueDate(undefined)}
              >
                <Text style={styles.clearDateText}>Clear</Text>
              </TouchableOpacity>
            </>
          )}
          {!dueDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setDueDate(new Date())}
            >
              <Text style={styles.clearDateText}>Set Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && dueDate && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && dueDate && (
          <DateTimePicker
            value={dueDate}
            mode="time"
            display="default"
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add tag"
            placeholderTextColor="#666"
            onSubmitEditing={() => {
              const tag = tagInput.trim().toLowerCase();
              if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setTagInput('');
              }
            }}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => {
              const tag = tagInput.trim().toLowerCase();
              if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setTagInput('');
              }
            }}
          >
            <Text style={styles.addTagButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => setTags(tags.filter((t) => t !== tag))}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>Reminder</Text>
        <View style={styles.optionsContainer}>
          {REMINDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                reminderOffset === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setReminderOffset(option.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  reminderOffset === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.optionsContainer}>
          {PRIORITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                priority === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setPriority(option.value)}
            >
              <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
              <Text
                style={[
                  styles.optionButtonText,
                  priority === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
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
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    marginTop: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dueDateContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  clearDateButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clearDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  addTagButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  addTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#FF8C00',
  },
  tagRemove: {
    fontSize: 18,
    color: '#FF8C00',
    fontWeight: '600',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000ff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  optionButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
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
