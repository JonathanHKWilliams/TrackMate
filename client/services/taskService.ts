import { supabase } from '../lib/supabase';
import { Task, TaskInput, TaskStatus, TaskDisplayStatus } from '../types/task';
import { getCache, setCache, CacheKeys } from '../lib/cache';
import { isOnline, isNetworkError } from '../lib/network';
import { optimisticInsert, optimisticUpdate, optimisticDelete } from '../lib/offlineQueue';
import { scheduleTaskReminder, cancelTaskNotifications } from './notificationService';

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const getTaskDisplayStatus = (task: Task): TaskDisplayStatus => {
  if (task.status === 'completed') return 'completed';
  if (!task.due_at) return 'upcoming';
  
  const now = new Date();
  const dueDate = new Date(task.due_at);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  if (dueDate < now) return 'overdue';
  if (dueDate >= todayStart && dueDate < todayEnd) return 'today';
  return 'upcoming';
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_at', { ascending: true });
    if (error) throw error;
    await setCache<Task[]>(CacheKeys.tasks(userId), data || []);
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) {
      const cached = await getCache<Task[]>(CacheKeys.tasks(userId));
      return cached || [];
    }
    throw e;
  }
};

export const getTasksByStatus = async (userId: string) => {
  const tasks = await getTasks(userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return {
    overdue: tasks.filter(t => {
      if (t.status === 'completed' || !t.due_at) return false;
      return new Date(t.due_at) < now;
    }),
    today: tasks.filter(t => {
      if (t.status === 'completed' || !t.due_at) return false;
      const dueDate = new Date(t.due_at);
      return dueDate >= todayStart && dueDate < todayEnd;
    }),
    upcoming: tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_at) return true;
      return new Date(t.due_at) >= todayEnd;
    }),
    completed: tasks.filter(t => t.status === 'completed'),
  };
};

export const getSharedTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .contains('monitor_uids', [userId])
      .order('due_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (isNetworkError(e)) {
      return [];
    }
    throw e;
  }
};

export const createTask = async (userId: string, taskInput: TaskInput): Promise<Task> => {
  if (!isOnline()) {
    const data = {
      title: taskInput.title,
      description: taskInput.description,
      project_id: taskInput.project_id,
      status: taskInput.status || 'todo',
      priority: taskInput.priority || 'medium',
      due_at: taskInput.due_at,
      reminder_offset_minutes: taskInput.reminder_offset_minutes || 0,
      tags: taskInput.tags || [],
      position: taskInput.position || 0,
      parent_task_id: taskInput.parent_task_id,
      is_recurring: taskInput.is_recurring || false,
      recurrence_pattern: taskInput.recurrence_pattern,
      monitor_emails: [],
      monitor_uids: [],
    } as any;
    return optimisticInsert<Task>('tasks', userId, data, CacheKeys.tasks(userId));
  }
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: taskInput.title,
      description: taskInput.description,
      project_id: taskInput.project_id,
      status: taskInput.status || 'todo',
      priority: taskInput.priority || 'medium',
      due_at: taskInput.due_at,
      reminder_offset_minutes: taskInput.reminder_offset_minutes || 0,
      tags: taskInput.tags || [],
      position: taskInput.position || 0,
      parent_task_id: taskInput.parent_task_id,
      is_recurring: taskInput.is_recurring || false,
      recurrence_pattern: taskInput.recurrence_pattern,
      monitor_emails: [],
      monitor_uids: [],
    })
    .select()
    .single();
  if (error) throw error;
  const cacheKey = CacheKeys.tasks(userId);
  const list = (await getCache<Task[]>(cacheKey)) || [];
  await setCache(cacheKey, [data, ...list]);
  
  // Schedule notification if task has a reminder
  if (data.reminder_offset_minutes > 0) {
    await scheduleTaskReminder(data);
  }
  
  return data;
};

type TaskUpdate = Partial<TaskInput> & { completed_at?: string | null };

export const updateTask = async (
  taskId: string,
  updates: TaskUpdate
): Promise<Task> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    throw new Error('Not authenticated');
  }
  if (!isOnline()) {
    const cacheKey = CacheKeys.tasks(userId);
    return optimisticUpdate<Task>('tasks', userId, taskId, updates, cacheKey);
  }
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  const cacheKey = CacheKeys.tasks(userId);
  const list = (await getCache<Task[]>(cacheKey)) || [];
  const updatedList = list.map((t) => (t.id === taskId ? { ...t, ...data } : t));
  await setCache(cacheKey, updatedList);
  
  // Cancel old notifications and schedule new ones if needed
  await cancelTaskNotifications(taskId);
  if (data.reminder_offset_minutes > 0 && data.status !== 'completed') {
    await scheduleTaskReminder(data);
  }
  
  return data;
};

export const completeTask = async (taskId: string): Promise<Task> => {
  return updateTask(taskId, { status: 'completed', completed_at: new Date().toISOString() });
};

export const uncompleteTask = async (taskId: string): Promise<Task> => {
  return updateTask(taskId, { status: 'todo', completed_at: null });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  // Cancel any scheduled notifications for this task
  await cancelTaskNotifications(taskId);
  
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  if (!isOnline()) {
    const cacheKey = CacheKeys.tasks(userId);
    await optimisticDelete('tasks', userId, taskId, cacheKey);
    return;
  }
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
  const cacheKey = CacheKeys.tasks(userId);
  const list = (await getCache<Task[]>(cacheKey)) || [];
  await setCache(cacheKey, list.filter((t) => t.id !== taskId));
};

export const addMonitor = async (
  taskId: string,
  monitorEmail: string,
  monitorUid?: string
): Promise<Task> => {
  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('monitor_emails, monitor_uids, user_id')
      .eq('id', taskId)
      .single();
    if (!task) throw new Error('Task not found');
    const updates = {
      monitor_emails: [...(task.monitor_emails || []), monitorEmail],
      monitor_uids: monitorUid ? [...(task.monitor_uids || []), monitorUid] : task.monitor_uids,
    } as Partial<Task>;
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    const cacheKey = CacheKeys.tasks(task.user_id);
    const list = (await getCache<Task[]>(cacheKey)) || [];
    await setCache(cacheKey, list.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
    return data as Task;
  } catch (e) {
    if (isNetworkError(e)) {
      const userId = await getCurrentUserId();
      if (!userId) throw e;
      const cacheKey = CacheKeys.tasks(userId);
      const list = (await getCache<Task[]>(cacheKey)) || [];
      const current = list.find((t) => t.id === taskId);
      const updates = {
        monitor_emails: [...(current?.monitor_emails || []), monitorEmail],
        monitor_uids: monitorUid ? [...(current?.monitor_uids || []), monitorUid] : current?.monitor_uids,
      } as Partial<Task>;
      return optimisticUpdate<Task>('tasks', userId, taskId, updates, cacheKey);
    }
    throw e;
  }
};

export const removeMonitor = async (
  taskId: string,
  monitorEmail: string
): Promise<Task> => {
  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('monitor_emails, monitor_uids, user_id')
      .eq('id', taskId)
      .single();
    if (!task) throw new Error('Task not found');
    const updates = {
      monitor_emails: (task.monitor_emails || []).filter((e: string) => e !== monitorEmail),
    } as Partial<Task>;
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    const cacheKey = CacheKeys.tasks(task.user_id);
    const list = (await getCache<Task[]>(cacheKey)) || [];
    await setCache(cacheKey, list.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
    return data as Task;
  } catch (e) {
    if (isNetworkError(e)) {
      const userId = await getCurrentUserId();
      if (!userId) throw e;
      const cacheKey = CacheKeys.tasks(userId);
      const list = (await getCache<Task[]>(cacheKey)) || [];
      const current = list.find((t) => t.id === taskId);
      const updates = {
        monitor_emails: (current?.monitor_emails || []).filter((e: string) => e !== monitorEmail),
      } as Partial<Task>;
      return optimisticUpdate<Task>('tasks', userId, taskId, updates, cacheKey);
    }
    throw e;
  }
};

export const subscribeToTasks = (
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void
) => {
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getTasks(userId).then(onTasksUpdate);
      }
    )
    .subscribe();

  getTasks(userId).then(onTasksUpdate);

  return () => {
    supabase.removeChannel(channel);
  };
};
