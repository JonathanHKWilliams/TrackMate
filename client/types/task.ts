export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskDisplayStatus = 'overdue' | 'today' | 'upcoming' | 'completed';
export type ReminderOffset = 0 | 5 | 30 | 60 | 1440;

export interface Task {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_at?: string;
  reminder_offset_minutes: ReminderOffset;
  completed_at?: string;
  tags: string[];
  position: number;
  parent_task_id?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  monitor_emails: string[];
  monitor_uids: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  project_id?: string;
  status?: TaskStatus;
  priority?: Priority;
  due_at?: string;
  reminder_offset_minutes?: ReminderOffset;
  tags?: string[];
  position?: number;
  parent_task_id?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export const REMINDER_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
] as const;

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' as Priority, color: '#B0B0B0' },
  { label: 'Medium', value: 'medium' as Priority, color: '#FFD700' },
  { label: 'High', value: 'high' as Priority, color: '#FF8C00' },
] as const;

export const STATUS_OPTIONS = [
  { label: 'To Do', value: 'todo' as TaskStatus, color: '#B0B0B0' },
  { label: 'In Progress', value: 'in_progress' as TaskStatus, color: '#2196F3' },
  { label: 'Completed', value: 'completed' as TaskStatus, color: '#4CAF50' },
] as const;
