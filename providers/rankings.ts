import type { TableType, Rule, RankRow } from '~/types/rankings';

export type RankingRow = RankRow & { rank: number };

// シングルトン生成（初回のみ）。約400件、分布: tableType=特上7割、他は均等 / rule=東6割, 東南4割
let CACHE_ALL: RankingRow[] | null = null;

function generateAllRows(): RankingRow[] {
  const TOTAL = 400; // 受入基準に合わせて約400件
  const names = (n: number) => `P-${n.toString().padStart(4, '0')}`;
  const rows: RankingRow[] = [];

  // tableType 割合
  const tablePicker = (i: number): TableType => {
    // 0..399 → 70% 特上, 残り3種を均等
    const r = i / TOTAL;
    if (r < 0.7) return '特上';
    const restIdx = Math.floor(((r - 0.7) / 0.3) * 3); // 0,1,2
    const others: TableType[] = ['一般', '上', '鳳凰'];
    return others[Math.min(others.length - 1, Math.max(0, restIdx))];
  };

  // 特上では東:75%、それ以外は東:25% にすることで全体で東:約60%を満たす
  const rulePickerFor = (tt: TableType, i: number): Rule => {
    if (tt === '特上') return i % 4 !== 0 ? '東' : '東南'; // 3/4 = 75%
    return i % 4 === 0 ? '東' : '東南'; // 1/4 = 25%
  };

  for (let i = 0; i < TOTAL; i++) {
    const name = names(i + 1);
    const rate = 1800 + ((i * 37) % 401); // 1800..2201
    const games = 40 + ((i * 23) % 361); // 40..400
    const tableType = tablePicker(i);
    const rule = rulePickerFor(tableType, i);
    const len = 22 + (i % 7); // 22..28 程度（24前後）
    const spark = Array.from({ length: len }, (_, j) => ((i + j) % 4) + 1);
    rows.push({ name, rate, games, tableType, rule, spark, rank: i + 1 });
  }
  return rows;
}

/**
 * ランキング行を取得（ダミー供給）。
 * 供給はクエリ非依存。フィルタは UI 側で実施。
 */
export const getRankingRows = async (): Promise<RankingRow[]> => {
  if (!CACHE_ALL) CACHE_ALL = generateAllRows();
  return CACHE_ALL;
};
