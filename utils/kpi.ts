export type KPI = {
  agari: number;
  houju: number;
  riichi: number;
  furo: number;
  avgRank: number;
};

export type RankDist = {
  first: number;
  second: number;
  third: number;
  fourth: number;
};

export type PlayerStats = {
  kpi: KPI;
  ranks: number[];
  dist: RankDist;
};

const pseudoRandom = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

export const getPlayerStats = async (name: string): Promise<PlayerStats | null> => {
  if (!name) return null;
  let seed = 0;
  for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = pseudoRandom(seed);
  const ranks = Array.from({ length: 40 }, () => 1 + Math.floor(rand() * 4));
  const dist: RankDist = { first: 0, second: 0, third: 0, fourth: 0 };
  for (const r of ranks) {
    if (r === 1) dist.first++;
    else if (r === 2) dist.second++;
    else if (r === 3) dist.third++;
    else dist.fourth++;
  }
  const kpi: KPI = {
    agari: 0.18 + rand() * 0.1,
    houju: 0.08 + rand() * 0.07,
    riichi: 0.15 + rand() * 0.1,
    furo: 0.2 + rand() * 0.3,
    avgRank: 1.8 + rand() * 1.4,
  };
  return { kpi, ranks, dist };
};

export const getPlayerKpi = async (name: string): Promise<KPI | null> => {
  const stats = await getPlayerStats(name);
  return stats?.kpi ?? null;
};

export type Tone = 'good' | 'bad' | 'neutral';

export const toneForKpi = (
  key: string,
  value: number,
  th: Record<string, { good: number; bad: number }> = {
    agari: { good: 0.24, bad: 0.18 },
    houju: { good: 0.09, bad: 0.13 },
    riichi: { good: 0.2, bad: 0.12 },
    furo: { good: 0.4, bad: 0.2 },
    avgRank: { good: 2.25, bad: 2.75 },
  }
): Tone => {
  const rev = new Set(['houju', 'avgRank']);
  const t = th[key];
  if (!t) return 'neutral';
  if (rev.has(key)) {
    if (value < t.good) return 'good';
    if (value > t.bad) return 'bad';
  } else {
    if (value > t.good) return 'good';
    if (value < t.bad) return 'bad';
  }
  return 'neutral';
};

export const toneForDiff = (key: string, delta: number): Tone => {
  if (Math.abs(delta) < 1e-9) return 'neutral';
  const rev = new Set(['houju', 'avgRank']);
  const positiveIsGood = !rev.has(key);
  const good = delta > 0 ? positiveIsGood : !positiveIsGood;
  return good ? 'good' : 'bad';
};

export const pct = (n: number, digits = 1): string => {
  return (n * 100).toFixed(digits) + '%';
};
