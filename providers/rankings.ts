import type { TableType, Rule } from '~/types/rankings';
import type { RankRow } from '~/workers/rankWorker';

export type RankingRow = RankRow & { spark: number[]; tableType: TableType; rule: Rule };

const ALL_ROWS: RankingRow[] = Array.from({ length: 400 }, (_, i) => {
  const name = `P-${(i + 1).toString().padStart(4, '0')}`;
  const rate = 1800 + ((i * 37) % 401);
  const games = 40 + ((i * 23) % 361);
  let tableType: TableType;
  if (i < 280) tableType = '特上';
  else if (i < 320) tableType = '一般';
  else if (i < 360) tableType = '上';
  else tableType = '鳳凰';
  const rule: Rule = i % 10 < 6 ? '東' : '東南';
  const len = 16 + (i % 17);
  const spark = Array.from({ length: len }, (_, j) => ((i + j) % 4) + 1);
  return { name, rate, games, spark, tableType, rule };
});

/**
 * ランキング行を取得する（将来の実データ差し替えポイント）。
 * @param query フィルタ条件
 * @returns ランキング行の配列
 */
export const getRankingRows = async (query: {
  tableType: TableType;
  rule: Rule;
}): Promise<RankingRow[]> =>
  ALL_ROWS.filter((r) => r.tableType === query.tableType && r.rule === query.rule).map(
    (r, idx) => ({ ...r, rank: idx + 1 })
  );
