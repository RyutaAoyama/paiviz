/// <reference lib="webworker" />
/// <reference types="@cloudflare/workers-types" />
export const onRequestPost: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async (ctx) => {
  try {
    const { request, env } = ctx;

    // Basic rate limit: 20 req/min per IP for shorten
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const allowed = await rateLimit(env, `rl:shorten:${ip}`, 20, 60);
    if (!allowed) return json({ error: 'rate_limited' }, 429);

    const ct = request.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return json({ error: 'invalid_content_type' }, 415);

    const raw = await request.text();
    if (raw.length > 8_000) return json({ error: 'payload_too_large' }, 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const kind =
      typeof (body as { kind?: string } | null | undefined)?.kind === 'string'
        ? (body as { kind?: string }).kind!
        : 'rankings';
    const data = (body as { data?: unknown } | null | undefined)?.data;
    if (!data || typeof data !== 'object') return json({ error: 'invalid_data' }, 400);

    const allowedKeys = [
      'mode',
      'from',
      'to',
      'tableType',
      'rule',
      'dense',
      'favOnly',
      'sortKey',
      'sortDir',
      'a',
      'b',
      'rwindow',
    ];
    const clean: Record<string, unknown> = {};
    for (const k of allowedKeys)
      if (k in (data as Record<string, unknown>)) clean[k] = (data as Record<string, unknown>)[k];

    const payload = { v: 1, kind, data: clean, createdAt: Date.now() };

    const id = rid(8);
    const key = `snap:${id}`;
    await env.PAIVIZ_LINKS.put(key, JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 90 });

    const url = new URL(request.url);
    const short = `${url.origin}/s/${id}`;
    return json({ id, short });
  } catch {
    return json({ error: 'internal_error' }, 500);
  }
};

export const onRequestGet: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({
  request,
  env,
}) => {
  const u = new URL(request.url);
  const id = u.searchParams.get('id') || '';
  if (!/^[0-9a-zA-Z]{6,32}$/.test(id)) return json({ error: 'invalid_id' }, 400);
  const txt = await env.PAIVIZ_LINKS.get(`snap:${id}`);
  if (!txt) return json({ error: 'not_found' }, 404);
  return json(JSON.parse(txt));
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  });

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function rid(n = 8) {
  const abc = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  let s = '';
  for (const v of arr) s += abc[v % abc.length];
  return s;
}

async function rateLimit(
  env: { PAIVIZ_LINKS: KVNamespace },
  key: string,
  limit: number,
  windowSec: number
) {
  const now = Date.now();
  const bucketKey = `${key}:${Math.floor(now / (windowSec * 1000))}`;
  const cur = await env.PAIVIZ_LINKS.get(bucketKey);
  const n = cur ? parseInt(cur) : 0;
  if (n >= limit) return false;
  await env.PAIVIZ_LINKS.put(bucketKey, String(n + 1), { expirationTtl: windowSec + 5 });
  return true;
}
