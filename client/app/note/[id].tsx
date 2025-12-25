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
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
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
  const [lastEnterTime, setLastEnterTime] = useState(0);
  const [activeFormat, setActiveFormat] = useState<'list' | 'checklist' | null>(null);

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
        
        // Don't auto-show unlock modal - let user trigger it by clicking lock icon or trying to edit
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
          // Wrap selected text with bold markers
          newContent = beforeText + '**' + selectedText + '**' + afterText;
          newCursorPos = selectionEnd + 4;
        } else {
          // Insert bold markers and place cursor between them
          newContent = beforeText + '****' + afterText;
          newCursorPos = selectionStart + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          // Wrap selected text with italic markers
          newContent = beforeText + '*' + selectedText + '*' + afterText;
          newCursorPos = selectionEnd + 2;
        } else {
          // Insert italic markers and place cursor between them
          newContent = beforeText + '**' + afterText;
          newCursorPos = selectionStart + 1;
        }
        break;
      case 'list':
        const listItem = selectedText || '';
        // Check if we're at the start or after a newline
        const needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n');
        newContent = beforeText + (needsNewline ? '\n' : '') + '• ' + listItem + afterText;
        newCursorPos = beforeText.length + (needsNewline ? 1 : 0) + 2 + listItem.length;
        setActiveFormat('list');
        break;
      case 'checklist':
        const checkItem = selectedText || '';
        // Check if we're at the start or after a newline
        const needsNewlineCheck = beforeText.length > 0 && !beforeText.endsWith('\n');
        newContent = beforeText + (needsNewlineCheck ? '\n' : '') + '☐ ' + checkItem + afterText;
        newCursorPos = beforeText.length + (needsNewlineCheck ? 1 : 0) + 2 + checkItem.length;
        setActiveFormat('checklist');
        break;
    }

    setContent(newContent);
    setShowFormatting(false);
    
    // Focus back to input
    setTimeout(() => {
      contentInputRef.current?.focus();
      // Set cursor position
      contentInputRef.current?.setNativeProps({
        selection: { start: newCursorPos, end: newCursorPos }
      });
    }, 100);
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      const currentTime = Date.now();
      const timeSinceLastEnter = currentTime - lastEnterTime;
      
      // Get the current line
      const beforeCursor = content.substring(0, selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Check if current line is a list item
      const isListItem = currentLine.trim().startsWith('•');
      const isChecklistItem = currentLine.trim().startsWith('☐') || currentLine.trim().startsWith('☑');
      
      if ((isListItem || isChecklistItem) && timeSinceLastEnter < 500) {
        // Double Enter - exit list mode
        e.preventDefault();
        const beforeText = content.substring(0, selectionStart);
        const afterText = content.substring(selectionStart);
        
        // Remove the empty list item and add a regular newline
        const lastNewlineIndex = beforeText.lastIndexOf('\n');
        const textBeforeListItem = beforeText.substring(0, lastNewlineIndex);
        const newContent = textBeforeListItem + '\n\n' + afterText;
        
        setContent(newContent);
        setActiveFormat(null);
        
        setTimeout(() => {
          const newPos = textBeforeListItem.length + 2;
          contentInputRef.current?.setNativeProps({
            selection: { start: newPos, end: newPos }
          });
        }, 10);
        
        setLastEnterTime(0);
        return;
      }
      
      if (isListItem) {
        // Single Enter on list item - create new list item
        e.preventDefault();
        const beforeText = content.substring(0, selectionStart);
        const afterText = content.substring(selectionStart);
        
        // Get text after the bullet on current line
        const bulletIndex = currentLine.indexOf('•');
        const textAfterBullet = currentLine.substring(bulletIndex + 1).trim();
        
        if (textAfterBullet === '') {
          // Empty list item - this will be caught by double-enter on next press
          setLastEnterTime(currentTime);
        } else {
          const newContent = beforeText + '\n• ' + afterText;
          setContent(newContent);
          
          setTimeout(() => {
            const newPos = beforeText.length + 3;
            contentInputRef.current?.setNativeProps({
              selection: { start: newPos, end: newPos }
            });
          }, 10);
          
          setLastEnterTime(currentTime);
        }
        return;
      }
      
      if (isChecklistItem) {
        // Single Enter on checklist item - create new checklist item
        e.preventDefault();
        const beforeText = content.substring(0, selectionStart);
        const afterText = content.substring(selectionStart);
        
        // Get text after the checkbox on current line
        const checkboxMatch = currentLine.match(/[☐☑]/);
        if (checkboxMatch) {
          const checkboxIndex = currentLine.indexOf(checkboxMatch[0]);
          const textAfterCheckbox = currentLine.substring(checkboxIndex + 1).trim();
          
          if (textAfterCheckbox === '') {
            // Empty checklist item - this will be caught by double-enter on next press
            setLastEnterTime(currentTime);
          } else {
            const newContent = beforeText + '\n☐ ' + afterText;
            setContent(newContent);
            
            setTimeout(() => {
              const newPos = beforeText.length + 3;
              contentInputRef.current?.setNativeProps({
                selection: { start: newPos, end: newPos }
              });
            }, 10);
            
            setLastEnterTime(currentTime);
          }
        }
        return;
      }
      
      setLastEnterTime(currentTime);
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
              <>
                <View style={styles.formatOptions}>
                  <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('bold')}>
                    <Text style={[styles.formatOptionText, { fontWeight: 'bold' }]}>Bold</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formatOption} onPress={() => applyFormat('italic')}>
                    <Text style={[styles.formatOptionText, { fontStyle: 'italic' }]}>Italic</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.formatOption, activeFormat === 'list' && styles.formatOptionActive]} onPress={() => applyFormat('list')}>
                    <Ionicons name="list" size={18} color="#FFF" />
                    <Text style={styles.formatOptionText}>List</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.formatOption, activeFormat === 'checklist' && styles.formatOptionActive]} onPress={() => applyFormat('checklist')}>
                    <Ionicons name="checkbox" size={18} color="#FFF" />
                    <Text style={styles.formatOptionText}>☐ Checklist</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.formatHint}>
                  {activeFormat === 'list' ? 'Press Enter to add items, double Enter to exit' : 
                   activeFormat === 'checklist' ? 'Press Enter to add items, double Enter to exit' :
                   'Use **text** for bold, *text* for italic'}
                </Text>
              </>
            )}
          </View>
          
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              // Check if user deleted all content or moved away from list
              const lines = text.split('\n');
              const hasListItems = lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('☐') || line.trim().startsWith('☑'));
              if (!hasListItems) {
                setActiveFormat(null);
              }
            }}
            placeholder="Start writing your note..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            editable={!isLocked || isUnlocked}
            onSelectionChange={(event) => {
              setSelectionStart(event.nativeEvent.selection.start);
              setSelectionEnd(event.nativeEvent.selection.end);
            }}
            onKeyPress={handleKeyPress}
          />
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
  formatOptionActive: {
    backgroundColor: '#2A2A2A',
    borderColor: '#FF8C00',
  },
  formatOptionText: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  formatHint: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
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
