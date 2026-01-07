import { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types/task';
import { getTasksByStatus, getSharedTasks, uncompleteTask } from '../../services/taskService';

export default function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [sharedTasks, setSharedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'completed' | 'shared'>('completed');

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasksByStatus = await getTasksByStatus(user.id);
      setCompletedTasks(tasksByStatus.completed);
      
      const shared = await getSharedTasks(user.id);
      setSharedTasks(shared);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTasks();
      }
    }, [user, loadTasks])
  );

  const handleUncomplete = async (taskId: string) => {
    try {
      await uncompleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error uncompleting task:', error);
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priorityColor =
      item.priority === 'high' ? '#FF8C00' : item.priority === 'medium' ? '#FFD700' : '#B0B0B0';

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push(`/task/${item.id}` as any)}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>
            {item.completed_at
              ? `Completed: ${new Date(item.completed_at).toLocaleDateString()}`
              : item.due_at
                ? `Due: ${new Date(item.due_at).toLocaleDateString()}`
                : 'No due date'}
          </Text>
          {activeTab === 'completed' && (
            <TouchableOpacity
              style={styles.uncompleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleUncomplete(item.id);
              }}
            >
              <Text style={styles.uncompleteButtonText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
        {activeTab === 'shared' && item.monitor_emails.length > 0 && (
          <Text style={styles.sharedWith}>
            Shared with: {item.monitor_emails.join(', ')}
          </Text>
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

  const displayTasks = activeTab === 'completed' ? completedTasks : sharedTasks;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
          onPress={() => setActiveTab('shared')}
        >
          <Text style={[styles.tabText, activeTab === 'shared' && styles.tabTextActive]}>
            Shared with Me ({sharedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'completed'
              ? 'No completed tasks yet'
              : 'No tasks shared with you'}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTasks();
            }}
          />
        }
      />
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
  },
  tabText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
  taskCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  uncompleteButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uncompleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sharedWith: {
    fontSize: 12,
    color: '#FF8C00',
    marginTop: 8,
  },
});
