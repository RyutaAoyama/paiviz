export type KPI = { agari: number; houju: number; riichi: number; furo: number; avgRank: number };
export type MatchRow = {
  at: string;
  table: string;
  rule: string;
  rank: 1 | 2 | 3 | 4;
  point: number;
  logId: string;
};
export type Series = { x: (string | number)[]; y: number[] };
export type PlayerProfile = { kpi: KPI; rate: Series; ranks: number[]; matches: MatchRow[] };

// deterministic pseudo random generator based on name hash
const seeded = (name: string) => {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = (h >>> 0) / 0xffffffff;
  return () => {
    s = (1103515245 * s + 12345) % 2147483647;
    return s / 2147483647;
  };
};

export const getPlayerProfile = async (name: string): Promise<PlayerProfile | null> => {
  const rnd = seeded(name);
  const kpi: KPI = {
    agari: 0.2 + rnd() * 0.08,
    houju: 0.08 + rnd() * 0.08,
    riichi: 0.14 + rnd() * 0.1,
    furo: 0.2 + rnd() * 0.2,
    avgRank: +(2.2 + rnd() * 0.6).toFixed(2),
  };
  const rateY: number[] = [];
  const rateX: number[] = [];
  const base = 1700 + rnd() * 500;
  for (let i = 0; i < 60; i++) {
    rateX.push(i + 1);
    rateY.push(Math.round(base + Math.sin(i / 6) * 80 + (rnd() - 0.5) * 60));
  }
  const ranks: number[] = [];
  for (let i = 0; i < 240; i++) {
    const r = rnd();
    if (r < 0.27) ranks.push(1);
    else if (r < 0.53) ranks.push(2);
    else if (r < 0.78) ranks.push(3);
    else ranks.push(4);
  }
  const matches: MatchRow[] = [];
  const today = Date.now();
  for (let i = 0; i < 20; i++) {
    const d = new Date(today - i * 86400000);
    const rank = ranks[ranks.length - 1 - i] || ((1 + Math.floor(rnd() * 4)) as 1 | 2 | 3 | 4);
    const point = 20000 + Math.round(rnd() * 40000);
    const table = ['一般東南', '上東南', '特上東南', '鳳凰東南'][Math.floor(rnd() * 4)];
    const rule = rnd() > 0.5 ? '喰断アリ' : '喰断ナシ';
    const lid = Array.from({ length: 8 })
      .map(() => Math.floor(rnd() * 36).toString(36))
      .join('');
    matches.push({
      at: d.toISOString(),
      table,
      rule,
      rank: rank as 1 | 2 | 3 | 4,
      point,
      logId: lid,
    });
  }
  return { kpi, rate: { x: rateX, y: rateY }, ranks, matches };
};
