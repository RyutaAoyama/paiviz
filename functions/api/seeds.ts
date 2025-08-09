type Env = { PAIVIZ_LINKS: KVNamespace; ADMIN_TOKEN: string };

async function getList(kv: KVNamespace): Promise<string[]> {
  const txt = await kv.get('seed:players');
  if (!txt) return [];
  try {
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
async function setList(kv: KVNamespace, arr: string[]) {
  const uniq = Array.from(new Set(arr.map((n) => String(n || '').trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, 'ja')
  );
  await kv.put('seed:players', JSON.stringify(uniq));
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const items = (await getList(env.PAIVIZ_LINKS)).map((name: string) => ({ name, source: 'kv' }));
  return new Response(JSON.stringify({ items }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => ({}) as unknown)) as
    | { admin?: string; names?: unknown[]; name?: unknown }
    | Record<string, unknown>;
  const admin =
    typeof (body as Record<string, unknown>)?.admin === 'string'
      ? (body as Record<string, unknown>).admin
      : '';
  if (admin !== env.ADMIN_TOKEN) return new Response('forbidden', { status: 403 });
  let names: string[] = [];
  if (Array.isArray((body as Record<string, unknown>)?.names))
    names = ((body as Record<string, unknown>).names as unknown[])
      .map((n) => String(n || '').trim())
      .filter(Boolean);
  else {
    const name = String((body as Record<string, unknown>)?.name || '').trim();
    if (name) names = [name];
  }
  if (!names.length) return new Response('bad request', { status: 400 });
  const list = await getList(env.PAIVIZ_LINKS);
  for (const n of names) list.push(n);
  await setList(env.PAIVIZ_LINKS, list);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => ({}) as unknown)) as
    | { admin?: string; name?: unknown }
    | Record<string, unknown>;
  const admin =
    typeof (body as Record<string, unknown>)?.admin === 'string'
      ? (body as Record<string, unknown>).admin
      : '';
  if (admin !== env.ADMIN_TOKEN) return new Response('forbidden', { status: 403 });
  const name = String((body as Record<string, unknown>)?.name || '').trim();
  const list = (await getList(env.PAIVIZ_LINKS)).filter((n) => n !== name);
  await setList(env.PAIVIZ_LINKS, list);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
