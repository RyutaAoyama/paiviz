type TurnstileEnv = { TURNSTILE_SECRET?: string };

type TurnstileBody = { token?: string };

export const onRequestPost: PagesFunction<TurnstileEnv> = async ({ request, env }) => {
  const body = (await request.json().catch(() => ({}) as unknown)) as TurnstileBody;
  const token = typeof body.token === 'string' ? body.token : '';
  const secret = env.TURNSTILE_SECRET || '';
  if (!token || !secret) return new Response(JSON.stringify({ ok: false }), { status: 400 });
  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const js = (await r.json().catch(() => ({}) as unknown)) as { success?: boolean } | unknown;
  const ok = typeof (js as any)?.success === 'boolean' ? !!(js as any).success : false;
  return new Response(JSON.stringify({ ok }), { headers: { 'content-type': 'application/json' } });
};
