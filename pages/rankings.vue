<script setup lang="ts">
import { h, ref, onMounted, watch, resolveComponent, computed } from 'vue';
import { getRankingRows, type RankingRow } from '~/providers/rankings';
import type { Model, TableType, Rule } from '~/types/rankings';

const { model, syncToUrl } = useRankingQuery();
const url = useRequestURL();

useHead(() => {
  const q = model.value;
  const period =
    q.mode === 'this'
      ? '今月'
      : q.mode === 'prev'
        ? '先月'
        : q.mode === 'last30d'
          ? '直近30日'
          : q.mode === 'last90d'
            ? '直近90日'
            : q.mode === 'custom' && q.from && q.to
              ? `${q.from}〜${q.to}`
              : '期間指定なし';
  const ttl = `ランキング（${q.mode} / ${q.tableType} / ${q.rule}）— Paiviz`;
  const desc = `天鳳のランキング。期間: ${period} / 卓: ${q.tableType} / ルール: ${q.rule}`;
  const img = `/api/og?title=${encodeURIComponent('ランキング')}&subtitle=${encodeURIComponent(`${q.tableType}/${q.rule}｜${period}`)}&badge=Paiviz&theme=teal`;
  const canonical = url.origin + url.pathname;
  return {
    title: ttl,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { property: 'og:title', content: ttl },
      { property: 'og:description', content: desc },
      { property: 'og:image', content: img },
      { name: 'twitter:title', content: ttl },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: img },
      { name: 'description', content: desc },
    ],
  };
});

type Row = RankingRow;
const rows = ref<Row[]>([]);
const loading = ref(true);
const { list: favList } = useFavorites();
const FavStar = resolveComponent('FavStar');

// フィルタ + ソート
const applyFilter = (
  all: Row[],
  q: {
    tableType: TableType;
    rule: Rule;
    favOnly?: boolean;
    sortKey: Model['sortKey'];
    sortDir: Model['sortDir'];
  },
  favSet: Set<string>
): Row[] => {
  const out = all.filter(
    (r) => r.tableType === q.tableType && r.rule === q.rule && (!q.favOnly || favSet.has(r.name))
  );
  const dir = q.sortDir === 'asc' ? 1 : -1;
  const coll = new Intl.Collator('ja', { sensitivity: 'base', numeric: true });
  return [...out].sort((a, b) => {
    if (q.sortKey === 'rate') return (a.rate - b.rate) * dir;
    if (q.sortKey === 'games') return (a.games - b.games) * dir;
    if (q.sortKey === 'name') return coll.compare(a.name, b.name) * dir;
    return 0;
  });
};

const filtered = computed<Row[]>(() =>
  applyFilter(rows.value, model.value, new Set(favList.value))
);

const recalc = async (): Promise<void> => {
  loading.value = true;
  rows.value = await getRankingRows();
  loading.value = false;
  if (process.client) (window as unknown as { __paivizRows?: typeof rows }).__paivizRows = rows;
};

onMounted(() => {
  void recalc();
});
watch(
  model,
  () => {
    void recalc();
  },
  { deep: true }
);

// CSV
import { toCsv, downloadCsv } from '~/utils/csv';
const exportCsv = (): void => {
  const csv = toCsv(filtered.value, [
    { key: 'name', label: '名前' },
    { key: 'rate', label: 'Rate' },
    { key: 'games', label: '対局数' },
    { key: 'tableType', label: '卓' },
    { key: 'rule', label: 'ルール' },
  ]);
  const q = model.value;
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadCsv(`paiviz_rankings_${ymd}_${q.mode}_${q.tableType}_${q.rule}.csv`, csv);
};

// 空状態ショートカット
const jumpThis = (): void => {
  model.value.mode = 'this';
  syncToUrl();
};
const jumpLast30 = (): void => {
  model.value.mode = 'last30d';
  syncToUrl();
};

// 列定義（rankは行内 index を使う実装なので見た目だけのヘッダ）
const columns = [
  {
    key: 'fav',
    label: '',
    width: '72px',
    render: (p: { row: { name: string } }) =>
      h('div', { class: 'text-xs' }, h(FavStar, { name: p.row.name })),
  },
  { key: 'rank', label: '#', width: '64px' },
  { key: 'name', label: '名前', width: '1fr' },
  { key: 'rate', label: 'Rate', width: '120px' },
  { key: 'games', label: '対局数', width: '120px' },
];
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">ランキング</h1>

    <div class="flex items-center gap-2">
      <button
        class="rounded-lg bg-[#0F1115] px-3 py-2 text-sm ring-1 ring-[#242A33]"
        @click="exportCsv"
      >
        CSVエクスポート
      </button>
      <button class="rounded-lg bg-[#0F1115] px-3 py-2 text-sm ring-1 ring-[#242A33]">
        共有リンク作成
      </button>
      <div class="ml-auto text-xs text-gray-400">表示: {{ filtered.length }} 件</div>
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded bg-[#161A20]"></div>
    </div>

    <div v-else-if="!filtered.length" class="space-y-4 text-center">
      <p class="text-sm text-gray-400">ランキングが見つかりません</p>
      <div class="flex justify-center gap-2">
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="jumpThis">
          今月
        </button>
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="jumpLast30">
          直近30日
        </button>
      </div>
    </div>

    <VirtualTable
      v-else
      :rows="filtered"
      :columns="columns"
      :height="520"
      :row-height="44"
      key-field="name"
      :sort-key="model.sortKey"
      :sort-dir="model.sortDir"
      @enter="(row: Row) => navigateTo(`/player/${encodeURIComponent(row.name)}`)"
    />
  </section>
</template>
