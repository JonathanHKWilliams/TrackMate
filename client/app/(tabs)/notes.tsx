import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Note } from '../../types/note';
import { getNotes, searchNotes } from '../../services/noteService';
import NoteUnlockModal from '../../components/NoteUnlockModal';
import SetNoteLockPasswordModal from '../../components/SetNoteLockPasswordModal';
import { hasNoteLockPassword } from '../../services/userProfileService';

export default function NotesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLockedNotes, setShowLockedNotes] = useState(false);
  const [selectedLockedNote, setSelectedLockedNote] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const loadNotes = async () => {
    if (!user) return;
    try {
      const allNotes = await getNotes(user.id);
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUnlockedNotes = () => {
    return notes.filter(note => !note.is_locked);
  };

  const getLockedNotes = () => {
    return notes.filter(note => note.is_locked);
  };

  const getDateLabel = (date: string | Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDay = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

    if (noteDay.getTime() === today.getTime()) {
      return 'Today';
    } else if (noteDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (noteDate.getFullYear() === now.getFullYear()) {
      return noteDate.toLocaleDateString('en-US', { month: 'long' });
    } else {
      return noteDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const groupNotesByDate = (notesList: Note[]) => {
    const grouped: { [key: string]: Note[] } = {};
    
    notesList.forEach(note => {
      const label = getDateLabel(note.updated_at);
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(note);
    });

    return Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key],
    }));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user) return;
    
    if (query.trim() === '') {
      loadNotes();
      return;
    }

    try {
      const results = await searchNotes(user.id, query);
      setNotes(results);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  useEffect(() => {
    loadNotes();
    checkPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadNotes();
      }
    }, [user, loadNotes])
  );

  const checkPassword = async () => {
    if (!user) return;
    try {
      const passwordExists = await hasNoteLockPassword(user.id);
      setHasPassword(passwordExists);
    } catch (error) {
      console.error('Error checking password:', error);
    }
  };

  const handleNotePress = (note: Note) => {
    if (note.is_locked) {
      setSelectedLockedNote(note.id);
      setShowUnlockModal(true);
    } else {
      router.push(`/note/${note.id}` as any);
    }
  };

  const renderNote = ({ item }: { item: Note }) => {
    const contentPreview = item.is_locked ? 'Note is locked. Tap to unlock.' : item.content.substring(0, 100);

    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => handleNotePress(item)}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteTitleRow}>
            {item.is_locked && (
              <Ionicons name="lock-closed" size={16} color="#FF8C00" />
            )}
            {item.is_pinned && (
              <Ionicons name="pin" size={16} color="#FF8C00" />
            )}
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.noteDate}>
            {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        </View>

        {!item.is_locked && (
          <Text style={styles.noteContent} numberOfLines={3}>
            {contentPreview}
          </Text>
        )}
        {item.is_locked && (
          <Text style={[styles.noteContent, styles.lockedContent]} numberOfLines={1}>
            {contentPreview}
          </Text>
        )}

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}

        {(item.project_id || item.task_id) && (
          <View style={styles.attachmentBadge}>
            <Ionicons 
              name={item.project_id ? 'folder' : 'checkbox'} 
              size={12} 
              color="#FF8C00" 
            />
            <Text style={styles.attachmentText}>
              {item.project_id ? 'Project Note' : 'Task Note'}
            </Text>
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
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/note/new' as any)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#B0B0B0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, !showLockedNotes && styles.tabActive]}
          onPress={() => setShowLockedNotes(false)}
        >
          <Ionicons name="document-text" size={20} color={!showLockedNotes ? "#FF8C00" : "#B0B0B0"} />
          <Text style={[styles.tabText, !showLockedNotes && styles.tabTextActive]}>
            Notes ({getUnlockedNotes().length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showLockedNotes && styles.tabActive]}
          onPress={() => setShowLockedNotes(true)}
        >
          <Ionicons name="lock-closed" size={20} color={showLockedNotes ? "#FF8C00" : "#B0B0B0"} />
          <Text style={[styles.tabText, showLockedNotes && styles.tabTextActive]}>
            Locked ({getLockedNotes().length})
          </Text>
        </TouchableOpacity>
      </View>

      {showLockedNotes && !hasPassword && (
        <View style={styles.passwordPrompt}>
          <Ionicons name="lock-closed-outline" size={48} color="#FF8C00" />
          <Text style={styles.passwordPromptTitle}>Set Up Note Lock Password</Text>
          <Text style={styles.passwordPromptText}>
            Set a password to protect your sensitive notes. This password will be used for all locked notes.
          </Text>
          <TouchableOpacity
            style={styles.setPasswordButton}
            onPress={() => setShowSetPasswordModal(true)}
          >
            <Ionicons name="key" size={20} color="#FFF" />
            <Text style={styles.setPasswordButtonText}>Set Password</Text>
          </TouchableOpacity>
        </View>
      )}

      <SectionList
        sections={groupNotesByDate(showLockedNotes ? getLockedNotes() : getUnlockedNotes())}
        renderItem={renderNote}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found' : showLockedNotes ? 'No locked notes yet.' : 'No notes yet. Create your first note!'}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotes();
            }}
          />
        }
      />
      
      {selectedLockedNote && (
        <NoteUnlockModal
          visible={showUnlockModal}
          noteId={selectedLockedNote}
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedLockedNote(null);
          }}
          onSuccess={() => {
            setShowUnlockModal(false);
            if (selectedLockedNote) {
              router.push(`/note/${selectedLockedNote}` as any);
              setSelectedLockedNote(null);
            }
          }}
        />
      )}

      <SetNoteLockPasswordModal
        visible={showSetPasswordModal}
        onClose={() => setShowSetPasswordModal(false)}
        onSuccess={() => {
          setHasPassword(true);
          setShowSetPasswordModal(false);
        }}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
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
  noteCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  noteContent: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    marginBottom: 12,
  },
  lockedContent: {
    fontStyle: 'italic',
    color: '#808080',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#FF8C00',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#B0B0B0',
    alignSelf: 'center',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: '#FF8C00',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  tabActive: {
    backgroundColor: '#FF8C00' + '20',
    borderColor: '#FF8C00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffffff',
  },
  tabTextActive: {
    color: '#FF8C00',
  },
  passwordPrompt: {
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 32,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#2A2A2A',
  },
  passwordPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  passwordPromptText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  setPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  setPasswordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionHeader: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderBottomColor: '#2A2A2A',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
