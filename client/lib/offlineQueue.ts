import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getCache, setCache, CacheKeys } from './cache';
import { isOnline, isNetworkError } from './network';

export type QueueAction = 'insert' | 'update' | 'delete';
export type QueueEntity = 'tasks' | 'notes' | 'projects' | 'profiles' | 'user_settings';

export interface QueueItem {
  id: string; // queue item id
  entity: QueueEntity;
  action: QueueAction;
  payload: any; // shape depends on action
  createdAt: string;
}

type IdMap = Record<string, Record<string, string>>; // entity -> localId -> remoteId

async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(CacheKeys.queue);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueueItem[];
  } catch {
    return [];
  }
}

async function saveQueue(items: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(CacheKeys.queue, JSON.stringify(items));
}

export function generateLocalId(prefix = 'local'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'createdAt'>): Promise<QueueItem> {
  const queue = await getQueue();
  const full: QueueItem = {
    id: generateLocalId('q'),
    createdAt: new Date().toISOString(),
    ...item,
  };
  queue.push(full);
  await saveQueue(queue);
  return full;
}

async function getIdMap(): Promise<IdMap> {
  const raw = await AsyncStorage.getItem(CacheKeys.idMap);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as IdMap;
  } catch {
    return {};
  }
}

async function saveIdMap(map: IdMap): Promise<void> {
  await AsyncStorage.setItem(CacheKeys.idMap, JSON.stringify(map));
}

export async function updateIdMap(entity: QueueEntity, localId: string, remoteId: string) {
  const map = await getIdMap();
  if (!map[entity]) map[entity] = {};
  map[entity][localId] = remoteId;
  await saveIdMap(map);
}

export async function resolveId(entity: QueueEntity, id: string): Promise<string> {
  const map = await getIdMap();
  if (map[entity] && map[entity][id]) return map[entity][id];
  return id;
}

async function replaceInCache<T extends { id: string }>(key: string, predicate: (x: T) => boolean, replacer: (x: T) => T | null) {
  const list = (await getCache<T[]>(key)) || [];
  const newList: T[] = [];
  for (const item of list) {
    if (predicate(item)) {
      const updated = replacer(item);
      if (updated) newList.push(updated);
    } else {
      newList.push(item);
    }
  }
  await setCache<T[]>(key, newList);
}

async function appendToCache<T>(key: string, value: T) {
  const list = (await getCache<T[]>(key)) || [];
  list.unshift(value);
  await setCache<T[]>(key, list);
}

async function applyQueueItem(item: QueueItem): Promise<void> {
  const { entity, action, payload } = item;
  if (action === 'insert') {
    const local = payload.data; // contains local fields, local id
    const { id: _localId, created_at: _ca, updated_at: _ua, ...insertable } = local || {};
    const { data, error } = await supabase.from(entity).insert(insertable).select().single();
    if (error) throw error;
    const remote = data as any;
    // Update id map
    if (entity !== 'user_settings' && local.id && remote.id) {
      await updateIdMap(entity, local.id, remote.id);
    }
    // Update cache for list-based entities
    const userId = local.user_id;
    const cacheKey = entity === 'user_settings' ? CacheKeys.settings(userId) : (CacheKeys as any)[entity]?.(userId);
    if (cacheKey) {
      if (entity === 'user_settings') {
        await setCache(cacheKey, remote);
      } else {
        // Replace local item by id
        await replaceInCache<any>(cacheKey, (x) => x.id === local.id, () => remote);
      }
    }
  } else if (action === 'update') {
    const id = entity === 'user_settings' ? payload.user_id : await resolveId(entity, payload.id);
    const updates = payload.updates;
    const query = supabase.from(entity).update(updates);
    const { data, error } = entity === 'user_settings'
      ? await query.eq('user_id', id).select().single()
      : await query.eq('id', id).select().single();
    if (error) throw error;
    const updated = data as any;
    const userId = updated.user_id || payload.user_id;
    const cacheKey = entity === 'user_settings' ? CacheKeys.settings(userId) : (CacheKeys as any)[entity]?.(userId);
    if (cacheKey) {
      if (entity === 'user_settings') {
        await setCache(cacheKey, updated);
      } else {
        await replaceInCache<any>(cacheKey, (x) => x.id === id, () => updated);
      }
    }
  } else if (action === 'delete') {
    const id = entity === 'user_settings' ? payload.user_id : await resolveId(entity, payload.id);
    const query = supabase.from(entity).delete();
    const { error } = entity === 'user_settings' ? await query.eq('user_id', id) : await query.eq('id', id);
    if (error) throw error;
    const userId = payload.user_id;
    const cacheKey = (CacheKeys as any)[entity]?.(userId);
    if (cacheKey) {
      if (entity === 'user_settings') {
        await setCache(cacheKey, null as any);
      } else {
        await replaceInCache<any>(cacheKey, (x) => x.id === id || x.id === payload.id, () => null);
      }
    }
  }
}

export async function flushOfflineQueue(): Promise<{ success: number; failed: number }> {
  if (!isOnline()) return { success: 0, failed: 0 };
  let queue = await getQueue();
  const remaining: QueueItem[] = [];
  let success = 0;
  let failed = 0;
  for (const item of queue) {
    try {
      await applyQueueItem(item);
      success += 1;
    } catch (e) {
      if (isNetworkError(e)) {
        // keep for later
        remaining.push(item);
      } else {
        // drop irrecoverable errors
        failed += 1;
      }
    }
  }
  await saveQueue(remaining);
  return { success, failed };
}

export async function optimisticInsert<T>(entity: QueueEntity, userId: string, data: any, cacheKey: string): Promise<T> {
  const localId = generateLocalId(entity.slice(0, 2));
  const now = new Date().toISOString();
  const localRecord = { ...data, id: localId, user_id: userId, created_at: now, updated_at: now };
  if (entity === 'user_settings') {
    await setCache(cacheKey, localRecord as any);
  } else {
    await appendToCache<T>(cacheKey, localRecord);
  }
  await enqueue({ entity, action: 'insert', payload: { data: localRecord } });
  return localRecord as T;
}

export async function optimisticUpdate<T>(entity: QueueEntity, userId: string, id: string, updates: any, cacheKey: string): Promise<T> {
  const now = new Date().toISOString();
  if (entity === 'user_settings') {
    const current = (await getCache<any>(cacheKey)) || { user_id: userId };
    const updated = { ...current, ...updates, updated_at: now };
    await setCache(cacheKey, updated);
    await enqueue({ entity, action: 'update', payload: { id, updates, user_id: userId } });
    return updated as T;
  }
  const resolved = await resolveId(entity, id);
  await replaceInCache<any>(cacheKey, (x) => x.id === id || x.id === resolved, (x) => ({ ...x, ...updates, updated_at: now }));
  await enqueue({ entity, action: 'update', payload: { id, updates, user_id: userId } });
  const list = (await getCache<any[]>(cacheKey)) || [];
  return (list.find((x) => x.id === id || x.id === resolved) as T) || (updates as T);
}

export async function optimisticDelete(entity: QueueEntity, userId: string, id: string, cacheKey: string): Promise<void> {
  const resolved = await resolveId(entity, id);
  await replaceInCache<any>(cacheKey, (x) => x.id === id || x.id === resolved, () => null);
  await enqueue({ entity, action: 'delete', payload: { id, user_id: userId } });
}
