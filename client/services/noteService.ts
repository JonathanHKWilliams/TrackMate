import { supabase } from '../lib/supabase';
import { Note, NoteInput, NoteLockSettings, NoteUnlockAttempt } from '../types/note';
import { getCache, setCache, CacheKeys } from '../lib/cache';
import { isOnline, isNetworkError } from '../lib/network';
import { optimisticInsert, optimisticUpdate, optimisticDelete } from '../lib/offlineQueue';
import * as Crypto from 'expo-crypto';

// Simple hash function for passwords and security answers
async function hashString(input: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  return digest;
}

export const getNotes = async (userId: string): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    await setCache<Note[]>(CacheKeys.notes(userId), data || []);
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) {
      return (await getCache<Note[]>(CacheKeys.notes(userId))) || [];
    }
    throw e;
  }
};

export const getNote = async (noteId: string): Promise<Note | null> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    if (isNetworkError(e)) {
      // Fallback: scanning per-user caches isn't available here; return null.
      return null;
    }
    throw e;
  }
};

export const getNotesByProject = async (projectId: string): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) {
      // best-effort: rely on caller to have cached list and filter in UI
      return [];
    }
    throw e;
  }
};

export const getNotesByTask = async (taskId: string): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('task_id', taskId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) return [];
    throw e;
  }
};

export const getStandaloneNotes = async (userId: string): Promise<Note[]> => {
  const notes = await getNotes(userId);
  return notes.filter((n) => !n.project_id && !n.task_id);
};

export const searchNotes = async (userId: string, searchTerm: string): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) {
      const notes = (await getCache<Note[]>(CacheKeys.notes(userId))) || [];
      const term = searchTerm.toLowerCase();
      return notes.filter((n) =>
        (n.title || '').toLowerCase().includes(term) || (n.content || '').toLowerCase().includes(term)
      );
    }
    throw e;
  }
};

export const createNote = async (userId: string, noteInput: NoteInput): Promise<Note> => {
  const base = {
    title: noteInput.title,
    content: noteInput.content,
    project_id: noteInput.project_id,
    task_id: noteInput.task_id,
    is_pinned: noteInput.is_pinned || false,
    is_locked: noteInput.is_locked || false,
    lock_password_hash: noteInput.lock_password_hash,
    security_question: noteInput.security_question,
    security_answer_hash: noteInput.security_answer_hash,
    tags: noteInput.tags || [],
  } as any;
  if (!isOnline()) {
    return optimisticInsert<Note>('notes', userId, base, CacheKeys.notes(userId));
  }
  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: userId, ...base })
    .select()
    .single();
  if (error) throw error;
  const cacheKey = CacheKeys.notes(userId);
  const list = (await getCache<Note[]>(cacheKey)) || [];
  await setCache(cacheKey, [data, ...list]);
  return data;
};

export const updateNote = async (
  noteId: string,
  updates: Partial<NoteInput>
): Promise<Note> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id as string;
  if (!userId) throw new Error('Not authenticated');
  if (!isOnline()) {
    return optimisticUpdate<Note>('notes', userId, noteId, updates, CacheKeys.notes(userId));
  }
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();
  if (error) throw error;
  const cacheKey = CacheKeys.notes(userId);
  const list = (await getCache<Note[]>(cacheKey)) || [];
  await setCache(cacheKey, list.map((n) => (n.id === noteId ? { ...n, ...data } : n)));
  return data;
};

export const togglePinNote = async (noteId: string, isPinned: boolean): Promise<Note> => {
  return updateNote(noteId, { is_pinned: isPinned });
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id as string;
  if (!userId) throw new Error('Not authenticated');
  if (!isOnline()) {
    await optimisticDelete('notes', userId, noteId, CacheKeys.notes(userId));
    return;
  }
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  if (error) throw error;
  const cacheKey = CacheKeys.notes(userId);
  const list = (await getCache<Note[]>(cacheKey)) || [];
  await setCache(cacheKey, list.filter((n) => n.id !== noteId));
};

export const subscribeToNotes = (
  userId: string,
  onNotesUpdate: (notes: Note[]) => void
) => {
  const channel = supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getNotes(userId).then(onNotesUpdate);
      }
    )
    .subscribe();

  getNotes(userId).then(onNotesUpdate);

  return () => {
    supabase.removeChannel(channel);
  };
};

export const lockNote = async (
  noteId: string,
  lockSettings: NoteLockSettings
): Promise<Note> => {
  const passwordHash = await hashString(lockSettings.password);
  const answerHash = await hashString(lockSettings.securityAnswer.toLowerCase().trim());

  return updateNote(noteId, {
    is_locked: true,
    lock_password_hash: passwordHash,
    security_question: lockSettings.securityQuestion,
    security_answer_hash: answerHash,
  });
};

export const unlockNote = async (
  noteId: string,
  password: string
): Promise<boolean> => {
  const note = await getNote(noteId);
  if (!note || !note.is_locked || !note.lock_password_hash) {
    return false;
  }

  const passwordHash = await hashString(password);
  return passwordHash === note.lock_password_hash;
};

export const unlockNoteWithSecurityAnswer = async (
  noteId: string,
  securityAnswer: string
): Promise<boolean> => {
  const note = await getNote(noteId);
  if (!note || !note.is_locked || !note.security_answer_hash) {
    return false;
  }

  const answerHash = await hashString(securityAnswer.toLowerCase().trim());
  return answerHash === note.security_answer_hash;
};

export const removeLock = async (noteId: string): Promise<Note> => {
  return updateNote(noteId, {
    is_locked: false,
    lock_password_hash: undefined,
    security_question: undefined,
    security_answer_hash: undefined,
  });
};

export const changeNoteLockPassword = async (
  noteId: string,
  newPassword: string
): Promise<Note> => {
  const passwordHash = await hashString(newPassword);
  return updateNote(noteId, {
    lock_password_hash: passwordHash,
  });
};
