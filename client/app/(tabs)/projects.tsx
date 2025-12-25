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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Project, PROJECT_STATUS_OPTIONS, normalizeProjectIcon } from '../../types/project';
import { getProjects } from '../../services/projectService';

export default function ProjectsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadProjects = async () => {
    if (!user) return;
    try {
      const allProjects = await getProjects(user.id);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadProjects();
      }
    }, [user])
  );

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return p.status !== 'archived';
    return p.status === filter;
  });

  const renderProject = ({ item }: { item: Project }) => {
    const statusOption = PROJECT_STATUS_OPTIONS.find(s => s.value === item.status);

    return (
      <TouchableOpacity
        style={[styles.projectCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
        onPress={() => router.push(`/project/${item.id}` as any)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleRow}>
            <Ionicons name={normalizeProjectIcon(item.icon) as any} size={24} color={item.color} />
            <Text style={styles.projectName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusOption?.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusOption?.color }]}>
              {statusOption?.label}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        {(item.start_date || item.end_date) && (
          <View style={styles.datesRow}>
            {item.start_date && (
              <Text style={styles.dateText}>
                Start: {new Date(item.start_date).toLocaleDateString()}
              </Text>
            )}
            {item.end_date && (
              <Text style={styles.dateText}>
                Due: {new Date(item.end_date).toLocaleDateString()}
              </Text>
            )}
          </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/project/new' as any)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {PROJECT_STATUS_OPTIONS.filter(s => s.value !== 'archived').map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[styles.filterButton, filter === status.value && styles.filterButtonActive]}
            onPress={() => setFilter(status.value)}
          >
            <Text style={[styles.filterText, filter === status.value && styles.filterTextActive]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No projects yet. Create your first project!
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProjects();
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  filterButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  filterText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  filterTextActive: {
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
  projectCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#B0B0B0',
  },
});
