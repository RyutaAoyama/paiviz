import type { TableType, Rule } from '~/types/rankings';
import type { RankRow } from '~/workers/rankWorker';

export type RankingRow = RankRow & { trend: string; tableType: TableType; rule: Rule };

const TABLE_TYPES: TableType[] = ['一般', '上', '特上', '鳳凰'];
const RULES: Rule[] = ['東', '東南'];
const TRENDS = ['↗︎', '→', '↘︎'] as const;

const ALL_ROWS: RankingRow[] = Array.from({ length: 500 }, (_, i) => {
  const tableType = TABLE_TYPES[i % TABLE_TYPES.length];
  const rule = RULES[Math.floor(i / TABLE_TYPES.length) % RULES.length];
  const rate = 1800 + ((i * 13) % 401);
  const games = 50 + ((i * 17) % 451);
  return {
    rank: i + 1,
    name: `P-${(i + 1).toString().padStart(4, '0')}`,
    rate,
    games,
    trend: TRENDS[i % TRENDS.length],
    tableType,
    rule,
  };
});

/**
 * 指定した卓・ルールに該当するランキング行を取得する。
 * @param query フィルタ条件
 * @returns ランキング行の配列
 */
export const getRankingRows = (query: { tableType: TableType; rule: Rule }): RankingRow[] =>
  ALL_ROWS.filter((r) => r.tableType === query.tableType && r.rule === query.rule).map(
    (r, idx) => ({ ...r, rank: idx + 1 })
  );
