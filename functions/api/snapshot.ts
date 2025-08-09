export const onRequestGet: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({ request, env }) => {
  const u = new URL(request.url)
  const id = u.searchParams.get('id') || ''
  if (!/^[0-9a-zA-Z]{6,32}$/.test(id)) return json({ error: 'invalid_id' }, 400)
  const key = `snap:${id}`
  const txt = await env.PAIVIZ_LINKS.get(key)
  if (!txt) return json({ error: 'not_found' }, 404)
  return json(JSON.parse(txt))
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })
}
