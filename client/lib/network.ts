let online = true;
const listeners = new Set<(state: boolean) => void>();

export function isOnline(): boolean {
  return online;
}

export function setOnline(state: boolean) {
  if (online !== state) {
    online = state;
    for (const l of listeners) l(online);
  }
}

export function onOnlineChange(listener: (state: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function checkOnline(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    clearTimeout(id);
    return false;
  }
}

export function isNetworkError(err: unknown): boolean {
  if (!err) return true;
  const msg = typeof err === 'string' ? err : (err as any).message || '';
  return (
    !online ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network request failed') ||
    msg.includes('TypeError: Network request failed') ||
    msg.includes('NetworkError') ||
    msg.includes('fetch')
  );
}
