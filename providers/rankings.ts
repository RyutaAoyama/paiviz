import type { TableType, Rule } from '~/types/rankings';
import type { RankRow } from '~/workers/rankWorker';

export type RankingRow = RankRow & { spark: number[]; tableType: TableType; rule: Rule };

// 単純なダミーデータ。特上/東が 300 件になるよう分布を調整。
const ALL_ROWS: RankingRow[] = Array.from({ length: 460 }, (_, i) => {
  const name = `P-${(i + 1).toString().padStart(4, '0')}`;
  const rate = 1800 + ((i * 37) % 401);
  const games = 40 + ((i * 23) % 361);
  let tableType: TableType;
  let rule: Rule;
  if (i < 300) {
    tableType = '特上';
    rule = '東';
  } else if (i < 340) {
    tableType = '特上';
    rule = '東南';
  } else if (i < 380) {
    tableType = '一般';
    rule = '東';
  } else if (i < 420) {
    tableType = '上';
    rule = '東南';
  } else {
    tableType = '鳳凰';
    rule = '東';
  }
  const len = 16 + (i % 17);
  const spark = Array.from({ length: len }, (_, j) => ((i + j) % 4) + 1);
  return { name, rate, games, spark, tableType, rule };
});

// クエリごとに一度だけ生成するためのキャッシュ
const cache: Record<string, RankingRow[]> = {};

/**
 * ランキング行を取得する（将来の実データ差し替えポイント）。
 * @param query フィルタ条件
 * @returns ランキング行の配列
 */
export const getRankingRows = async (query: {
  tableType: TableType;
  rule: Rule;
}): Promise<RankingRow[]> => {
  const key = `${query.tableType}_${query.rule}`;
  if (!cache[key]) {
    cache[key] = ALL_ROWS.filter(
      (r) => r.tableType === query.tableType && r.rule === query.rule
    ).map((r, idx) => ({ ...r, rank: idx + 1 }));
  }
  return cache[key];
};
