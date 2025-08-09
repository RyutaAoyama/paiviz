<script setup lang="ts">
import { h } from 'vue';
import FavStar from '~/components/FavStar.vue';
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

// TODO: 実データに差し替え。今はモック行（安定動作確認用）
type Row = { rank: number; name: string; rate: number; games: number; trend: string };
const rows = ref<Row[]>([]);
const loading = ref(true);
const load = (): void => {
  loading.value = true;
  setTimeout(() => {
    rows.value = Array.from({ length: 500 }, (_, i) => ({
      rank: i + 1,
      name: `Player_${(i + 1).toString().padStart(3, '0')}`,
      rate: 2000 + Math.round(Math.random() * 800),
      games: 50 + Math.round(Math.random() * 200),
      trend: '↗︎',
    }));
    loading.value = false;
  }, 300);
};
watch(
  () => ({ ...model.value }),
  () => load()
);
onMounted(load);

// お気に入りフィルタ
const { has } = useFavorites();
const collator = new Intl.Collator('ja');
const filtered = computed(() => {
  let r = rows.value;
  if (model.value.favOnly) r = r.filter((row) => has(row.name));
  const { sortKey, sortDir } = model.value;
  const dir = sortDir === 'asc' ? 1 : -1;
  const decorated = r.map((row, i) => ({ ...row, __idx: i }));
  const order = (a: any, b: any): number => {
    const seq: [string, number][] = [];
    if (sortKey === 'rate') seq.push(['rate', dir], ['games', -1], ['name', 1]);
    else if (sortKey === 'games') seq.push(['games', dir], ['rate', -1], ['name', 1]);
    else if (sortKey === 'name') seq.push(['name', dir], ['rate', -1], ['games', -1]);
    else seq.push(['rank', dir], ['rate', -1], ['games', -1], ['name', 1]);
    for (const [k, d] of seq) {
      let cmp = 0;
      if (k === 'name') cmp = collator.compare(a.name, b.name);
      else cmp = a[k] === b[k] ? 0 : a[k] > b[k] ? 1 : -1;
      if (cmp !== 0) return d * cmp;
    }
    return a.__idx - b.__idx; // 安定化
  };
  const sorted = decorated.sort(order).map((row, idx) => {
    const rest = { ...row };
    delete rest.__idx;
    return { ...rest, rank: idx + 1 };
  });
  return sorted;
});

// CSV
import { toCsv, downloadCsv } from '~/utils/csv';
const exportCsv = (): void => {
  const csv = toCsv(filtered.value, [
    { key: 'rank', label: '#' },
    { key: 'name', label: '名前' },
    { key: 'rate', label: 'Rate' },
    { key: 'games', label: '対局数' },
  ]);
  const q = model.value;
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadCsv(`paiviz_rankings_${ymd}_${q.mode}_${q.tableType}_${q.rule}.csv`, csv);
};

// テーブル列定義
const jumpThis = (): void => {
  model.value.mode = 'this';
  syncToUrl();
};
const jumpLast30 = (): void => {
  model.value.mode = 'last30d';
  syncToUrl();
};

const columns = [
  {
    key: 'fav',
    label: '',
    width: '72px',
    render: (p: any) => h('div', { class: 'text-xs' }, h(FavStar, { name: p.row.name })),
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

    <!-- （フィルタチップやドロワーは既存のものを継続） -->

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
    />
  </section>
</template>
