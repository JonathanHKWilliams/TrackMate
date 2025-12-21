import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { NoteInput } from '../../types/note';
import { getNote, createNote, updateNote, deleteNote, togglePinNote } from '../../services/noteService';
import VerifyNoteLockPasswordModal from '../../components/VerifyNoteLockPasswordModal';
import NoteUnlockModal from '../../components/NoteUnlockModal';
import { hasNoteLockPassword } from '../../services/userProfileService';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const contentInputRef = useRef<TextInput>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  useEffect(() => {
    if (!isNew && id) {
      loadNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const note = await getNote(id as string);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setIsPinned(note.is_pinned);
        setProjectId(note.project_id);
        setTaskId(note.task_id);
        setIsLocked(note.is_locked || false);
        
        // If note is locked, show unlock modal
        if (note.is_locked && !isUnlocked) {
          setShowUnlockModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !title.trim()) {
      Alert.alert('Error', 'Note title is required');
      return;
    }

    setSaving(true);
    try {
      const noteInput: NoteInput = {
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
        tags: [],
        project_id: projectId,
        task_id: taskId,
      };

      if (isNew) {
        await createNote(user.id, noteInput);
      } else {
        await updateNote(id as string, noteInput);
      }

      router.back();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };



  const handleTogglePin = async () => {
    if (!isNew && id) {
      try {
        await togglePinNote(id as string, !isPinned);
        setIsPinned(!isPinned);
      } catch (error) {
        console.error('Error toggling pin:', error);
      }
    } else {
      setIsPinned(!isPinned);
    }
  };

  const applyFormat = (format: 'bold' | 'italic' | 'list' | 'checklist') => {
    const beforeText = content.substring(0, selectionStart);
    const selectedText = content.substring(selectionStart, selectionEnd);
    const afterText = content.substring(selectionEnd);

    let newContent = '';
    let newCursorPos = selectionStart;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newContent = beforeText + '**' + selectedText + '**' + afterText;
          newCursorPos = selectionEnd + 4;
        } else {
          newContent = beforeText + '****' + afterText;
          newCursorPos = selectionStart + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          newContent = beforeText + '*' + selectedText + '*' + afterText;
          newCursorPos = selectionEnd + 2;
        } else {
          newContent = beforeText + '**' + afterText;
          newCursorPos = selectionStart + 1;
        }
        break;
      case 'list':
        const listItem = selectedText || 'List item';
        newContent = beforeText + '\n• ' + listItem + afterText;
        newCursorPos = beforeText.length + 3 + listItem.length;
        break;
      case 'checklist':
        const checkItem = selectedText || 'Task item';
        newContent = beforeText + '\n☐ ' + checkItem + afterText;
        newCursorPos = beforeText.length + 3 + checkItem.length;
        break;
    }

    setContent(newContent);
    setShowFormatting(false);
    
    // Focus back to input
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 100);
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
        <Text style={styles.headerTitle}>{isNew ? 'New Note' : 'Edit Note'}</Text>
        <View style={styles.headerActions}>
          {!isNew && (
            <>
              <TouchableOpacity 
                onPress={async () => {
                  if (isLocked) {
                    setShowUnlockModal(true);
                  } else {
                    const hasPassword = await hasNoteLockPassword(user!.id);
                    if (!hasPassword) {
                      Alert.alert('No Password Set', 'Please set a note lock password in the Locked Notes tab first.');
                    } else {
                      setShowVerifyPasswordModal(true);
                    }
                  }
                }} 
                style={styles.iconButton}
              >
                <Ionicons 
                  name={isLocked ? "lock-closed" : "lock-open-outline"} 
                  size={22} 
                  color={isLocked ? "#FF8C00" : "#FFF"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTogglePin} style={styles.iconButton}>
                <Ionicons 
                  name={isPinned ? "pin" : "pin-outline"} 
                  size={22} 
                  color={isPinned ? "#FF8C00" : "#FFF"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Note Title"
            placeholderTextColor="#666"
            autoFocus={isNew}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.formattingToolbar}>
            <TouchableOpacity 
              style={styles.formatButton}
              onPress={() => setShowFormatting(!showFormatting)}
            >
              <Ionicons name="text" size={20} color="#FF8C00" />
              <Text style={styles.formatButtonText}>Format</Text>
            </TouchableOpacity>
            
            {showFormatting && (
              <View style={styles.formatOptions}>
                <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('bold')}>
                  <Ionicons name="text" size={18} color="#FFF" />
                  <Text style={styles.formatOptionText}>Bold</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('italic')}>
                  <Ionicons name="text" size={18} color="#FFF" />
                  <Text style={styles.formatOptionText}>Italic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('list')}>
                  <Ionicons name="list" size={18} color="#FFF" />
                  <Text style={styles.formatOptionText}>List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('checklist')}>
                  <Ionicons name="checkbox" size={18} color="#FFF" />
                  <Text style={styles.formatOptionText}>Checklist</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing your note..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            editable={!isLocked || isUnlocked}
            onSelectionChange={(event) => {
              setSelectionStart(event.nativeEvent.selection.start);
              setSelectionEnd(event.nativeEvent.selection.end);
            }}
          />
        </View>


        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={16} color="#B0B0B0" />
            <Text style={styles.infoText}>
              {isPinned ? 'This note is pinned' : 'Pin this note to keep it at the top'}
            </Text>
          </View>
          {projectId && (
            <View style={styles.infoRow}>
              <Ionicons name="folder" size={16} color="#FF8C00" />
              <Text style={styles.infoText}>Attached to project</Text>
            </View>
          )}
          {taskId && (
            <View style={styles.infoRow}>
              <Ionicons name="checkbox" size={16} color="#FF8C00" />
              <Text style={styles.infoText}>Attached to task</Text>
            </View>
          )}
        </View>


        <View style={{ height: 40 }} />
      </ScrollView>
      
      <VerifyNoteLockPasswordModal
        visible={showVerifyPasswordModal}
        noteId={id as string}
        onClose={() => setShowVerifyPasswordModal(false)}
        onSuccess={async () => {
          try {
            await updateNote(id as string, { ...{ title, content, is_pinned: isPinned, tags: [], project_id: projectId, task_id: taskId }, is_locked: true });
            setIsLocked(true);
            setShowVerifyPasswordModal(false);
            Alert.alert('Success', 'Note locked successfully');
          } catch (error) {
            console.error('Error locking note:', error);
            Alert.alert('Error', 'Failed to lock note');
          }
        }}
      />
      
      <NoteUnlockModal
        visible={showUnlockModal}
        noteId={id as string}
        onClose={() => {
          setShowUnlockModal(false);
          if (isLocked && !isUnlocked) {
            router.back();
          }
        }}
        onSuccess={() => {
          setShowUnlockModal(false);
          setIsUnlocked(true);
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  pinButton: {
    padding: 4,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  saveButtonDisabled: {
    color: '#666',
  },
  formattingToolbar: {
    marginBottom: 12,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignSelf: 'flex-start',
  },
  formatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  formatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  formatOptionText: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 24,
    minHeight: 300,
    padding: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
  },
  addTagButton: {
    backgroundColor: '#FF8C00',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#FF8C00',
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#B0B0B0',
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
