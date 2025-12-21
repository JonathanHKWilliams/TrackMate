export interface Note {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  lock_password_hash?: string;
  security_question?: string;
  security_answer_hash?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  project_id?: string;
  task_id?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  lock_password_hash?: string;
  security_question?: string;
  security_answer_hash?: string;
  tags?: string[];
}

export interface NoteLockSettings {
  password: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface NoteUnlockAttempt {
  noteId: string;
  password?: string;
  securityAnswer?: string;
}

export type NoteAttachmentType = 'project' | 'task' | 'standalone';

export type NoteFormatType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'heading' | 'bullet' | 'number' | 'checkbox';

export interface NoteTable {
  rows: number;
  cols: number;
  data: string[][];
}
