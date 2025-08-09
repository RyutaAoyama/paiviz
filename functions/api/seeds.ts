type Env = { PAIVIZ_KV: KVNamespace; ADMIN_TOKEN: string }

async function getList(kv: KVNamespace): Promise<string[]> {
  const txt = await kv.get('seed:players')
  if (!txt) return []
  try { const arr = JSON.parse(txt); return Array.isArray(arr) ? arr : [] } catch { return [] }
}
async function setList(kv: KVNamespace, arr: string[]) {
  await kv.put('seed:players', JSON.stringify(Array.from(new Set(arr)).filter(Boolean)))
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const items = (await getList(env.PAIVIZ_KV)).map((name: string)=> ({ name, source:'kv' }))
  return new Response(JSON.stringify({ items }), { headers:{ 'content-type':'application/json' } })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json().catch(()=> ({} as any))
  if ((body?.admin || '') !== env.ADMIN_TOKEN) return new Response('forbidden', { status: 403 })
  const name = String(body?.name || '').trim()
  if (!name) return new Response('bad request', { status: 400 })
  const list = await getList(env.PAIVIZ_KV)
  list.push(name)
  await setList(env.PAIVIZ_KV, list)
  return new Response(JSON.stringify({ ok:true }), { headers:{ 'content-type':'application/json' } })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json().catch(()=> ({} as any))
  if ((body?.admin || '') !== env.ADMIN_TOKEN) return new Response('forbidden', { status: 403 })
  const name = String(body?.name || '').trim()
  const list = (await getList(env.PAIVIZ_KV)).filter((n)=> n !== name)
  await setList(env.PAIVIZ_KV, list)
  return new Response(JSON.stringify({ ok:true }), { headers:{ 'content-type':'application/json' } })
}
