export type ShareKind = 'rankings' | 'compare';
export interface ShortenResponse {
  id: string;
  short: string;
}
export interface SnapshotPayload {
  v?: number;
  kind?: ShareKind | string;
  data?: Record<string, unknown> | null;
  createdAt?: number;
}
export interface SuggestItem {
  name: string;
  source: string;
}
export interface SuggestResponse {
  suggestions: SuggestItem[];
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
  headers?: Record<string, string>;
  retries?: number;
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = 8000, headers = {}, retries = 1 } = opts;
  let attempt = 0,
    lastErr: unknown;

  while (attempt <= retries) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(path, {
        method,
        body: body != null ? JSON.stringify(body) : undefined,
        headers: {
          ...(body != null ? { 'content-type': 'application/json' } : {}),
          ...headers,
        },
        signal: ctrl.signal,
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        const err: ApiError = new Error(`HTTP ${r.status} ${r.statusText}${txt ? `: ${txt}` : ''}`);
        err.status = r.status;
        throw err;
      }
      if (r.status === 204) return undefined as unknown as T;
      return (await r.json()) as T;
    } catch (e: unknown) {
      lastErr = e;
      const err = e as ApiError | undefined;
      // 429/5xx/Abort はリトライ
      const status = err?.status ?? 0;
      const retryable = status === 0 || status === 429 || (status >= 500 && status < 600);
      if (attempt < retries && retryable) {
        await sleep(400 * Math.pow(2, attempt)); // 400ms, 800ms, ...
        attempt++;
        continue;
      }
      throw lastErr;
    } finally {
      clearTimeout(t);
    }
  }
  throw lastErr;
}

// ---- 既存API（互換） ----
export async function createShareLink(kind: ShareKind, data: Record<string, unknown>) {
  const res = await apiFetch<ShortenResponse>('/api/shorten', {
    method: 'POST',
    body: { kind, data },
    retries: 2,
  });
  return res.short;
}
export function getSnapshot(id: string) {
  return apiFetch<SnapshotPayload>(`/api/shorten?id=${encodeURIComponent(id)}`, { retries: 1 });
}
export async function getSuggest(q: string, limit = 10): Promise<SuggestItem[]> {
  if (!q || q.trim().length < 2) return [];
  const res = await apiFetch<SuggestResponse>(
    `/api/suggest?q=${encodeURIComponent(q)}&limit=${limit}`,
    { retries: 1 }
  );
  return Array.isArray(res.suggestions) ? res.suggestions : [];
}

// ---- 管理用 seeds API ----
export type SeedItem = { name: string; source?: string };
export async function listSeeds(): Promise<SeedItem[]> {
  const res = await apiFetch<{ items: SeedItem[] }>('/api/seeds', { retries: 1 });
  return res.items ?? [];
}
export async function addSeed(name: string, admin: string) {
  return apiFetch('/api/seeds', { method: 'POST', body: { name, admin }, retries: 0 });
}
export async function addSeeds(names: string[], admin: string) {
  return apiFetch('/api/seeds', { method: 'POST', body: { names, admin }, retries: 0 });
}
export async function deleteSeed(name: string, admin: string) {
  return apiFetch('/api/seeds', { method: 'DELETE', body: { name, admin }, retries: 0 });
}
