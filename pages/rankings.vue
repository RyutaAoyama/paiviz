<script setup lang="ts">
import { h, ref, onMounted, watch } from 'vue';
import FavStar from '~/components/FavStar.vue';
import type { RankResponse, RankRequest } from '~/workers/rankWorker';
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

type Row = { rank: number; name: string; rate: number; games: number; trend: string };
const rows = ref<Row[]>([]);
const filtered = ref<Row[]>([]);
const loading = ref(true);
let worker: Worker | null = null;
const { list: favList } = useFavorites();

const genRows = (): Row[] => {
  return Array.from({ length: 50000 }, (_, i) => ({
    rank: i + 1,
    name: `Player_${(i + 1).toString().padStart(5, '0')}`,
    rate: 2000 + Math.round(Math.random() * 800),
    games: 50 + Math.round(Math.random() * 200),
    trend: '↗︎',
  }));
};

const recalc = () => {
  if (!worker) return;
  loading.value = true;
  const sortKeys: RankRequest['sort']['keys'] = [];
  const sk = model.value.sortKey;
  const dir = model.value.sortDir;
  if (sk === 'rate') sortKeys.push({ key: 'rate', dir });
  else if (sk === 'games') sortKeys.push({ key: 'games', dir });
  else if (sk === 'name') sortKeys.push({ key: 'name', dir });
  else sortKeys.push({ key: 'rate', dir: 'desc' });
  sortKeys.push({ key: 'games', dir: 'desc' }, { key: 'name', dir: 'asc' });
  const msg: RankRequest = {
    rows: rows.value,
    filter: { favOnly: model.value.favOnly, favs: favList.value },
    sort: { keys: sortKeys },
  };
  worker.postMessage(msg);
};

if (process.client) {
  worker = new Worker(new URL('~/workers/rankWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent<RankResponse>) => {
    filtered.value = e.data.rows as Row[];
    loading.value = false;
  };
}

onMounted(() => {
  rows.value = genRows();
  recalc();
});

watch(
  () => ({ ...model.value }),
  () => recalc()
);
watch(favList, () => recalc());

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
      @enter="(row: Row) => navigateTo(`/player/${encodeURIComponent(row.name)}`)"
    />
  </section>
</template>
