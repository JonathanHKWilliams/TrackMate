import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Task } from '../../types/task';
import { getTasksByStatus, getTaskDisplayStatus, completeTask } from '../../services/taskService';
import { playTaskCompleteSound } from '../../utils/soundUtils';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [tasks, setTasks] = useState<{
    today: Task[];
    upcoming: Task[];
  }>({ today: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const tasksByStatus = await getTasksByStatus(user.id);
      setTasks(tasksByStatus);
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

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      await playTaskCompleteSound(settings?.sound_enabled ?? true);
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const displayStatus = getTaskDisplayStatus(item);
    const priorityColor =
      item.priority === 'high' ? '#FF8C00' : item.priority === 'medium' ? '#FFD700' : '#B0B0B0';
    const statusColor =
      item.status === 'completed' ? '#4CAF50' : item.status === 'in_progress' ? '#2196F3' : '#B0B0B0';

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          displayStatus === 'overdue' && styles.taskCardOverdue,
        ]}
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
          <View style={styles.taskFooterLeft}>
            {item.due_at && (
              <Text style={styles.taskDueDate}>
                {new Date(item.due_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            )}
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCompleteTask(item.id);
            }}
          >
            <Text style={styles.completeButtonText}>✓ Complete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getTotalTasks = () => {
    return tasks.today.length + tasks.upcoming.length;
  };

  const renderBanner = () => {
    const totalTasks = getTotalTasks();
    const todayCount = tasks.today.length;
    
    if (totalTasks === 0) {
      return (
        <View style={styles.banner}>
          <Image source={require('../../assets/images/taskk.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>All Caught Up!</Text>
          <Text style={styles.bannerSubtitle}>You have no pending tasks tasks</Text>
        </View>
      );
    }

    if (todayCount > 0) {
      return (
        <Animated.View style={[styles.banner, styles.bannerActive, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={require('../../assets/images/taskk.jpg')} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>{todayCount} Task{todayCount > 1 ? 's' : ''} Due Today</Text>
          <Text style={styles.bannerSubtitle}>Stay focused and get them done done</Text>
        </Animated.View>
      );
    }

    return (
      <View style={styles.banner}>
        <Image source={require('../../assets/images/taskk.jpg')} style={styles.bannerImage} />
        <Text style={styles.bannerTitle}>{totalTasks} Upcoming Task{totalTasks > 1 ? 's' : ''}</Text>
        <Text style={styles.bannerSubtitle}>Plan ahead and stay organized</Text>
      </View>
    );
  };

  const renderSection = (title: string, data: Task[], emptyMessage: string, icon: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color="#FF8C00" />
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.length}</Text>
          </View>
        )}
      </View>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );

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
        <Text style={styles.title}>Tasks</Text>
      </View>
      <FlatList
        data={[1]}
        renderItem={() => (
          <View>
            {renderBanner()}
            {renderSection('Today', tasks.today, 'No tasks due today', 'today')}
            {renderSection('Upcoming', tasks.upcoming, 'No upcoming tasks', 'calendar')}
          </View>
        )}
        keyExtractor={() => 'dashboard'}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              loadTasks();
            }}
            tintColor="#FF8C00"
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/task/new' as any)}
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  banner: {
    paddingTop: 1,
    margin: 1,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  bannerActive: {
    borderColor: '#4a4a4aff',
    borderWidth: 0,
  },
  bannerImage: {
    width: 400,
    height: 150,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8C00',
    marginTop: 12,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#B0B0B0',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  taskCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskCardOverdue: {
    // borderColor: '#FF8C00',
    // borderWidth: 1,
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
  taskFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  completeButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
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
