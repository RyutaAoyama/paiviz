export type ShareKind = 'rankings' | 'compare'
export async function createShareLink(kind: ShareKind, data: Record<string, any>): Promise<string> {
  const r = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind, data })
  })
  if (!r.ok) throw new Error('share_failed')
  const js = await r.json()
  return js.short as string
}
