export type Mode = 'this' | 'prev' | 'last30d' | 'last90d' | 'custom';
export type TableType = '一般' | '上' | '特上' | '鳳凰';
export type Rule = '東' | '東南';
export type SortKey = 'name' | 'rate' | 'games' | 'rank';
export type SortDir = 'asc' | 'desc';

// ランキング行の共通型（生成・フィルタ・表示で統一）
export type RankRow = {
  name: string;
  rate: number;
  games: number;
  tableType: TableType;
  rule: Rule;
  spark?: number[]; // 1..4 の着順配列
};

export interface Model {
  mode: Mode;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  tableType: TableType;
  rule: Rule;
  dense: boolean;
  favOnly?: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
}
