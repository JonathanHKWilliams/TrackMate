export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  icon: string;
  start_date?: string;
  end_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
  icon?: string;
  start_date?: string;
  end_date?: string;
}

export const PROJECT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' as ProjectStatus, color: '#4CAF50' },
  { label: 'Paused', value: 'paused' as ProjectStatus, color: '#FFD700' },
  { label: 'Completed', value: 'completed' as ProjectStatus, color: '#2196F3' },
  { label: 'Archived', value: 'archived' as ProjectStatus, color: '#9E9E9E' },
] as const;

export const PROJECT_COLORS = [
  '#FF8C00', '#4CAF50', '#2196F3', '#9C27B0', '#F44336',
  '#FF9800', '#00BCD4', '#E91E63', '#8BC34A', '#FFC107',
] as const;

export const PROJECT_ICONS = [
  'folder', 'briefcase', 'star', 'heart', 'flag',
  'bookmark', 'analytics', 'rocket', 'bulb', 'trophy',
] as const;

export const normalizeProjectIcon = (icon: string | null | undefined): string => {
  if (!icon) return 'folder';
  if (icon === 'target') return 'analytics';
  if (icon === 'lightbulb') return 'bulb';
  return icon;
};
