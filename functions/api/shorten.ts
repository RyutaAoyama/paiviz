export const onRequestPost: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async (ctx) => {
  try {
    const { request, env } = ctx
    const ct = request.headers.get('content-type') || ''
    if (!ct.includes('application/json')) return json({ error: 'invalid_content_type' }, 415)

    const raw = await request.text()
    if (raw.length > 8_000) return json({ error: 'payload_too_large' }, 413)

    let body: any
    try { body = JSON.parse(raw) } catch { return json({ error: 'invalid_json' }, 400) }

    const kind = typeof body?.kind === 'string' ? body.kind : 'rankings'
    const data = body?.data
    if (!data || typeof data !== 'object') return json({ error: 'invalid_data' }, 400)

    const allowedKeys = ['mode','from','to','tableType','rule','dense','favOnly','sortKey','sortDir','a','b','rwindow']
    const clean: Record<string, any> = {}
    for (const k of allowedKeys) if (k in data) clean[k] = data[k]

    const payload = { v: 1, kind, data: clean, createdAt: Date.now() }

    const id = rid(8)
    const key = `snap:${id}`
    await env.PAIVIZ_LINKS.put(key, JSON.stringify(payload), { expirationTtl: 60*60*24*90 })

    const url = new URL(request.url)
    const short = `${url.origin}/s/${id}`
    return json({ id, short })
  } catch {
    return json({ error: 'internal_error' }, 500)
  }
}

export const onRequestOptions: PagesFunction = async () => new Response(null, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type'
  }
})

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

function rid(n = 8) {
  const abc = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const arr = new Uint8Array(n)
  crypto.getRandomValues(arr)
  let s = ''
  for (const v of arr) s += abc[v % abc.length]
  return s
}
