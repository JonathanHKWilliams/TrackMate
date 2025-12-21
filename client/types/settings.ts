export interface UserSettings {
  user_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  theme: 'dark' | 'light';
  default_reminder: number;
  default_priority: 'low' | 'medium' | 'high';
  show_completed_tasks: boolean;
  task_sort_order: 'due_date' | 'priority' | 'created_at';
  created_at: string;
  updated_at: string;
}

export interface UserSettingsInput {
  notifications_enabled?: boolean;
  sound_enabled?: boolean;
  theme?: 'dark' | 'light';
  default_reminder?: number;
  default_priority?: 'low' | 'medium' | 'high';
  show_completed_tasks?: boolean;
  task_sort_order?: 'due_date' | 'priority' | 'created_at';
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  notifications_enabled: true,
  sound_enabled: true,
  theme: 'dark',
  default_reminder: 30,
  default_priority: 'medium',
  show_completed_tasks: false,
  task_sort_order: 'due_date',
};

export const REMINDER_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
] as const;

export const SORT_OPTIONS = [
  { label: 'Due Date', value: 'due_date' as const },
  { label: 'Priority', value: 'priority' as const },
  { label: 'Created Date', value: 'created_at' as const },
] as const;
