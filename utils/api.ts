export type ShareKind = "rankings" | "compare";

export interface ShortenResponse {
  id: string;
  short: string;
}
export interface SnapshotPayload {
  v?: number;
  kind?: ShareKind | string;
  data?: Record<string, any> | null;
  createdAt?: number;
}

export interface SuggestItem {
  name: string;
  source: string;
}
export interface SuggestResponse {
  suggestions: SuggestItem[];
}

export interface MetaRankings {
  updatedAt: number;
  monthsAvailable: number;
  note?: string;
}

type ApiOptions = {
  method?: "GET" | "POST";
  body?: any;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, timeoutMs = 8000, headers = {} } = opts;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const r = await fetch(path, {
      method,
      body: body != null ? JSON.stringify(body) : undefined,
      headers: {
        ...(body != null ? { "content-type": "application/json" } : {}),
        ...headers,
      },
      signal: ctrl.signal,
    });
    if (!r.ok) {
      // Cloudflare Functions 側のエラーJSONも拾いたいので一応読む
      let detail = "";
      try {
        detail = await r.text();
      } catch {}
      throw new Error(
        `HTTP ${r.status} ${r.statusText}${detail ? `: ${detail}` : ""}`
      );
    }
    // 204などを考慮
    if (r.status === 204) return undefined as unknown as T;
    const js = (await r.json()) as unknown;
    return js as T;
  } finally {
    clearTimeout(t);
  }
}

// ---- エンドポイント別の薄いラッパ ----

export async function createShareLink(
  kind: ShareKind,
  data: Record<string, any>
): Promise<string> {
  const res = await apiFetch<ShortenResponse>("/api/shorten", {
    method: "POST",
    body: { kind, data },
  });
  return res.short;
}

export async function getSnapshot(id: string): Promise<SnapshotPayload> {
  return apiFetch<SnapshotPayload>(
    `/api/snapshot?id=${encodeURIComponent(id)}`
  );
}

export async function getSuggest(
  q: string,
  limit = 10
): Promise<SuggestItem[]> {
  if (!q || q.trim().length < 2) return [];
  const res = await apiFetch<SuggestResponse>(
    `/api/suggest?q=${encodeURIComponent(q)}&limit=${limit}`
  );
  return Array.isArray(res.suggestions) ? res.suggestions : [];
}

export async function getRankingsMeta(): Promise<MetaRankings> {
  return apiFetch<MetaRankings>("/api/meta/rankings");
}
