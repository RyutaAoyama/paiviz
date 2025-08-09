export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const body = await request.json().catch(()=> ({} as any))
  const token = body?.token || ''
  const secret = env.TURNSTILE_SECRET as string
  if (!token || !secret) return new Response(JSON.stringify({ ok:false }), { status: 400 })
  const form = new URLSearchParams()
  form.append('secret', secret)
  form.append('response', token)
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', body: form })
  const js = await r.json().catch(()=> ({}))
  return new Response(JSON.stringify({ ok: !!js?.success }), { headers:{ 'content-type':'application/json' } })
}
