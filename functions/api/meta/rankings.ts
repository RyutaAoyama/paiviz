/// <reference lib="webworker" />
/// <reference types="@cloudflare/workers-types" />
export const onRequestGet: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({ env }) => {
  const key = "meta:rankings"
  const cached = await env.PAIVIZ_LINKS.get(key)
  if (cached) return json(JSON.parse(cached), 200, 120)

  const meta = {
    updatedAt: Date.now(),
    monthsAvailable: 24,
    note: "This is a placeholder meta. Replace with official page metadata fetcher if permitted."
  }
  await env.PAIVIZ_LINKS.put(key, JSON.stringify(meta), { expirationTtl: 600 })
  return json(meta, 200, 120)
}

function json(data: any, status = 200, ttl = 0) {
  const h: Record<string,string> = { "content-type":"application/json; charset=utf-8", "Access-Control-Allow-Origin":"*" }
  if (ttl) h["cache-control"] = `public, max-age=${ttl}`
  return new Response(JSON.stringify(data), { status, headers: h })
}
