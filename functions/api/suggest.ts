/// <reference lib="webworker" />
/// <reference types="@cloudflare/workers-types" />
export const onRequestGet: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(+(url.searchParams.get('limit') || 10), 20);

  // Basic rate limit: 120 req/min per IP for suggest
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const allowed = await rateLimit(env, `rl:suggest:${ip}`, 120, 60);
  if (!allowed) return json({ error: 'rate_limited' }, 429, 10);

  // Load seeds from KV (optional), fallback to built-in small list
  let seeds: string[] = [];
  try {
    const txt = await env.PAIVIZ_LINKS.get('seed:players');
    if (txt) seeds = JSON.parse(txt);
  } catch {
    /* ignore */
  }
  if (!Array.isArray(seeds) || seeds.length === 0) {
    seeds = [
      'ASAPIN',
      '独歩',
      '就活生＠川村軍',
      '福地誠',
      'コーラください',
      '太くないお',
      'しゅかつせい',
      '天鳳位候補',
      '流神',
      'すずめクレイジー',
      'zaku',
      'らいつべ',
      'ぐんにょり',
      'みーにん',
      '赤犬さん',
      'あさぴん',
    ];
  }

  if (q.length < 2) {
    return json({ suggestions: [] }, 200, 30);
  }

  const qn = normalize(q);
  const out: { name: string; source: 'kv' | 'seed' }[] = [];
  for (const name of seeds) {
    if (out.length >= limit) break;
    if (normalize(name).includes(qn)) out.push({ name, source: 'seed' });
  }

  return new Response(JSON.stringify({ suggestions: out }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, max-age=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

// ------- helpers -------
function normalize(s: string) {
  return s.toLowerCase();
}
function json(data: unknown, status = 200, ttlSec = 0) {
  const h: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  };
  if (ttlSec > 0) h['cache-control'] = `private, max-age=${ttlSec}`;
  return new Response(JSON.stringify(data), { status, headers: h });
}

// naive KV-based rate limiter (best-effort)
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
