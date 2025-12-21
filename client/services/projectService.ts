import { supabase } from '../lib/supabase';
import { Project, ProjectInput, normalizeProjectIcon } from '../types/project';
import { getCache, setCache, CacheKeys } from '../lib/cache';
import { isOnline, isNetworkError } from '../lib/network';
import { optimisticInsert, optimisticUpdate, optimisticDelete } from '../lib/offlineQueue';
import type { Task } from '../types/task';

export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const normalized = (data || []).map((p) => ({ ...p, icon: normalizeProjectIcon(p.icon) }));
    await setCache(CacheKeys.projects(userId), normalized);
    return normalized;
  } catch (e) {
    if (isNetworkError(e)) {
      return (await getCache<Project[]>(CacheKeys.projects(userId))) || [];
    }
    throw e;
  }
};

export const getProjectsByStatus = async (userId: string, status?: string) => {
  const projects = await getProjects(userId);
  return status ? projects.filter((p) => p.status === status) : projects;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    if (error) throw error;
    return data ? ({ ...data, icon: normalizeProjectIcon(data.icon) } as Project) : null;
  } catch (e) {
    if (isNetworkError(e)) {
      // best-effort: scan cached lists for any user id if available is out-of-scope; return null
      return null;
    }
    throw e;
  }
};

export const createProject = async (userId: string, projectInput: ProjectInput): Promise<Project> => {
  const base = {
    name: projectInput.name,
    description: projectInput.description,
    status: projectInput.status || 'active',
    color: projectInput.color || '#FF8C00',
    icon: normalizeProjectIcon(projectInput.icon || 'folder'),
    start_date: projectInput.start_date,
    end_date: projectInput.end_date,
    progress: 0,
  } as any;
  if (!isOnline()) {
    const created = await optimisticInsert<Project>('projects', userId, base, CacheKeys.projects(userId));
    return { ...created, icon: normalizeProjectIcon(created.icon) } as Project;
  }
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, ...base })
    .select()
    .single();
  if (error) throw error;
  const project = { ...data, icon: normalizeProjectIcon(data.icon) } as Project;
  const cacheKey = CacheKeys.projects(userId);
  const list = (await getCache<Project[]>(cacheKey)) || [];
  await setCache(cacheKey, [project, ...list]);
  return project;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<ProjectInput>
): Promise<Project> => {
  const normalizedUpdates = {
    ...updates,
    ...(updates.icon !== undefined ? { icon: normalizeProjectIcon(updates.icon) } : {}),
  } as Partial<ProjectInput>;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id as string;
  if (!userId) throw new Error('Not authenticated');
  if (!isOnline()) {
    const updated = await optimisticUpdate<Project>('projects', userId, projectId, normalizedUpdates, CacheKeys.projects(userId));
    return { ...updated, icon: normalizeProjectIcon((updated as any).icon) } as Project;
  }
  const { data, error } = await supabase
    .from('projects')
    .update(normalizedUpdates)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  const project = { ...data, icon: normalizeProjectIcon(data.icon) } as Project;
  const cacheKey = CacheKeys.projects(userId);
  const list = (await getCache<Project[]>(cacheKey)) || [];
  await setCache(cacheKey, list.map((p) => (p.id === projectId ? project : p)));
  return project;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id as string;
  if (!userId) throw new Error('Not authenticated');
  if (!isOnline()) {
    await optimisticDelete('projects', userId, projectId, CacheKeys.projects(userId));
    return;
  }
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw error;
  const cacheKey = CacheKeys.projects(userId);
  const list = (await getCache<Project[]>(cacheKey)) || [];
  await setCache(cacheKey, list.filter((p) => p.id !== projectId));
};

export const archiveProject = async (projectId: string): Promise<Project> => {
  return updateProject(projectId, { status: 'archived' });
};

export const getProjectStats = async (projectId: string) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('project_id', projectId)
      .is('parent_task_id', null);
    if (error) throw error;
    const total = tasks?.length || 0;
    const completed = tasks?.filter((t) => t.status === 'completed').length || 0;
    const inProgress = tasks?.filter((t) => t.status === 'in_progress').length || 0;
    const todo = tasks?.filter((t) => t.status === 'todo').length || 0;
    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  } catch (e) {
    if (isNetworkError(e)) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id as string;
      if (!userId) return { total: 0, completed: 0, inProgress: 0, todo: 0, completionRate: 0 };
      const cachedTasks = (await getCache<Task[]>(CacheKeys.tasks(userId))) || [];
      const tasks = cachedTasks.filter((t) => t.project_id === projectId && !t.parent_task_id);
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
      const todo = tasks.filter((t) => t.status === 'todo').length;
      return {
        total,
        completed,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }
    throw e;
  }
};

export const subscribeToProjects = (
  userId: string,
  onProjectsUpdate: (projects: Project[]) => void
) => {
  const channel = supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getProjects(userId).then(onProjectsUpdate);
      }
    )
    .subscribe();

  getProjects(userId).then(onProjectsUpdate);

  return () => {
    supabase.removeChannel(channel);
  };
};
