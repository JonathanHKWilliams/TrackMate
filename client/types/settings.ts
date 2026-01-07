export interface UserSettings {
  user_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  theme: 'dark' | 'light';
  default_reminder: number;
  default_priority: 'low' | 'medium' | 'high';
  show_completed_tasks: boolean;
  task_sort_order: 'due_date' | 'priority' | 'created_at';
  // Finance preferences
  default_currency: 'LRD' | 'USD' | 'EUR' | 'GBP';
  show_expense_categories: boolean;
  auto_generate_estimate_numbers: boolean;
  // Budget preferences
  budget_alerts_enabled: boolean;
  budget_alert_threshold: number;
  // Display preferences
  compact_view: boolean;
  show_icons: boolean;
  animations_enabled: boolean;
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
  // Finance preferences
  default_currency?: 'LRD' | 'USD' | 'EUR' | 'GBP';
  show_expense_categories?: boolean;
  auto_generate_estimate_numbers?: boolean;
  // Budget preferences
  budget_alerts_enabled?: boolean;
  budget_alert_threshold?: number;
  // Display preferences
  compact_view?: boolean;
  show_icons?: boolean;
  animations_enabled?: boolean;
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  notifications_enabled: true,
  sound_enabled: true,
  theme: 'dark',
  default_reminder: 30,
  default_priority: 'medium',
  show_completed_tasks: false,
  task_sort_order: 'due_date',
  // Finance preferences
  default_currency: 'LRD',
  show_expense_categories: true,
  auto_generate_estimate_numbers: true,
  // Budget preferences
  budget_alerts_enabled: true,
  budget_alert_threshold: 80,
  // Display preferences
  compact_view: false,
  show_icons: true,
  animations_enabled: true,
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
