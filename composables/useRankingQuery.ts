import { resolveRange } from '~/utils/range';
import type { Model, Mode, TableType, Rule, SortKey, SortDir } from '~/types/rankings';

const DEF: Model = {
  mode: 'this',
  tableType: '特上',
  rule: '東',
  dense: false,
  sortKey: 'rate',
  sortDir: 'desc',
  favOnly: false,
};

const tableTypes = new Set<TableType>(['一般', '上', '特上', '鳳凰']);
const rules = new Set<Rule>(['東', '東南']);
const sortKeys = new Set<SortKey>(['name', 'rate', 'games', 'rank']);
const sortDirs = new Set<SortDir>(['asc', 'desc']);
const modes = new Set<Mode>(['this', 'prev', 'last30d', 'last90d', 'custom']);

export function useRankingQuery() {
  const route = useRoute();
  const router = useRouter();
  const model = ref<Model>({ ...DEF });

  function clampFromQuery(q: Record<string, any>) {
    const m = (q.mode ?? DEF.mode) as string;
    model.value.mode = modes.has(m as Mode) ? (m as Mode) : DEF.mode;

    if (model.value.mode === 'custom') {
      model.value.from = String(q.from || '').slice(0, 10) || undefined;
      model.value.to = String(q.to || '').slice(0, 10) || undefined;
    } else {
      const r = resolveRange(model.value.mode);
      model.value.from = r.from;
      model.value.to = r.to;
    }

    const tt = decodeURIComponent(String(q.tableType || DEF.tableType));
    model.value.tableType = tableTypes.has(tt as TableType) ? (tt as TableType) : DEF.tableType;

    const rl = decodeURIComponent(String(q.rule || DEF.rule));
    model.value.rule = rules.has(rl as Rule) ? (rl as Rule) : DEF.rule;

    model.value.dense = String(q.dense) === 'true';
    model.value.favOnly = String(q.favOnly) === 'true';

    const sk = String(q.sortKey || DEF.sortKey);
    model.value.sortKey = sortKeys.has(sk as SortKey) ? (sk as SortKey) : DEF.sortKey;

    const sd = String(q.sortDir || DEF.sortDir);
    model.value.sortDir = sortDirs.has(sd as SortDir) ? (sd as SortDir) : DEF.sortDir;
  }

  function syncToUrl() {
    const m = model.value;
    const params: any = {
      mode: m.mode,
      tableType: m.tableType,
      rule: m.rule,
      dense: String(m.dense),
      favOnly: String(!!m.favOnly),
      sortKey: m.sortKey,
      sortDir: m.sortDir,
    };
    if (m.mode === 'custom') {
      params.from = m.from || '';
      params.to = m.to || '';
    }
    const q = new URLSearchParams(params).toString();
    router.replace(`/rankings?${q}`);
  }

  watchEffect(() => clampFromQuery(route.query as any));
  return { model, syncToUrl };
}
