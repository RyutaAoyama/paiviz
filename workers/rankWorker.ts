export type RankRequest = {
  rows: any[];
  filter: { favOnly: boolean; favs?: string[] };
  sort: { keys: Array<{ key: 'rate' | 'games' | 'name'; dir: 'asc' | 'desc' }> };
};
export type RankResponse = { rows: any[]; tookMs: number };

self.onmessage = (e: MessageEvent<RankRequest>) => {
  const t0 = performance.now();
  const req = e.data;
  let rows = req.rows || [];
  const { filter, sort } = req;
  if (filter?.favOnly && Array.isArray(filter.favs)) {
    const set = new Set(filter.favs);
    rows = rows.filter((r) => set.has(r.name));
  }
  const coll = new Intl.Collator('ja', { sensitivity: 'base', numeric: true });
  const decorated = rows.map((r, i) => ({ ...r, __i: i }));
  decorated.sort((a, b) => {
    for (const { key, dir } of sort.keys) {
      let cmp = 0;
      if (key === 'name') cmp = coll.compare(a.name, b.name);
      else cmp = a[key] === b[key] ? 0 : a[key] > b[key] ? 1 : -1;
      if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
    }
    return a.__i - b.__i;
  });
  const out = decorated.map((r, idx) => {
    const { __i: _i, ...rest } = r as any;
    void _i;
    return { ...rest, rank: idx + 1 };
  });
  (self as any).postMessage({ rows: out, tookMs: performance.now() - t0 } as RankResponse);
};
