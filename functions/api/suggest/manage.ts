/// <reference lib="webworker" />
/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({ env }) => {
  try {
    const txt = await env.PAIVIZ_LINKS.get("seed:players");
    const seeds = txt ? JSON.parse(txt) : [];
    return json({ seeds });
  } catch {
    return json({ seeds: [] });
  }
};

export const onRequestPost: PagesFunction<{ PAIVIZ_LINKS: KVNamespace }> = async ({ request, env }) => {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.seeds)) throw new Error("invalid");
    const seeds = body.seeds
      .map((s: unknown) => String(s))
      .filter((s: string) => s.length > 0);
    await env.PAIVIZ_LINKS.put("seed:players", JSON.stringify(seeds));
    return json({ ok: true });
  } catch {
    return json({ error: "bad_request" }, 400);
  }
};

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
