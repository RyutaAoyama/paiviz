<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">ランキング</h1>
      <div class="hidden md:flex items-center gap-2 text-sm text-muted">
        <div class="rounded-md border border-border px-2 py-1">
          表示: {{ visibleRows.length }} / {{ sorted.length }}
        </div>
        <button
          class="rounded-lg border border-border px-2 py-1 hover:text-text"
          @click="toggleDense"
        >
          密度: {{ dense ? "凝縮" : "快適" }}
        </button>
      </div>
    </div>

    <FilterChips v-model="chipModel" @openDrawer="drawerOpen = true" />

    <SkeletonTable
      v-if="loading"
      :rows="Math.ceil((dense ? 480 : 560) / rowHeight)"
    />

    <div
      v-else
      ref="viewport"
      class="rounded-2xl border border-border bg-surface text-sm focus-ring"
      :style="{ height: (dense ? 480 : 560) + 'px', overflow: 'auto' }"
      tabindex="0"
      @keydown="onKey"
      @scroll="onScroll"
    >
      <div
        class="sticky top-0 grid grid-cols-[72px_1fr_90px_160px_90px] gap-3 border-b border-border bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur"
      >
        <button
          class="text-left"
          @click="setSort('rank')"
          :aria-sort="aria('rank')"
        >
          # <SortIcon :dir="icon('rank')" />
        </button>
        <button
          class="text-left"
          @click="setSort('name')"
          :aria-sort="aria('name')"
        >
          名前 <SortIcon :dir="icon('name')" />
        </button>
        <button
          class="text-left"
          @click="setSort('rate')"
          :aria-sort="aria('rate')"
        >
          Rate <SortIcon :dir="icon('rate')" />
        </button>
        <div>直近</div>
        <button
          class="text-left"
          @click="setSort('games')"
          :aria-sort="aria('games')"
        >
          対局数 <SortIcon :dir="icon('games')" />
        </button>
      </div>

      <div v-if="sorted.length === 0">
        <div
          v-if="favOnly && favList.length === 0"
          class="p-6 text-sm text-muted"
        >
          お気に入りがありません。<NuxtLink to="/" class="text-teal-400">検索</NuxtLink>
          でプレイヤーを探し、詳細ページで★を押すとここに表示されます。
        </div>
        <div v-else class="p-6 text-sm text-muted">
          条件に合うプレイヤーが見つかりません。フィルタや期間を見直してください。
        </div>
      </div>

      <div
        v-else
        :style="{ height: totalHeight + 'px', position: 'relative' }"
        role="table"
        aria-label="ランキング"
      >
        <div
          v-for="(row, i) in visibleRows"
          :key="row.id"
          class="grid grid-cols-[72px_1fr_90px_160px_90px] items-center gap-3 border-b border-border hover:outline hover:outline-1 hover:outline-[#1b2230] rounded-md active:bg-[#0c1218]"
          :class="{ 'row-selected': isSelected(startIndex + i) }"
          :style="{
            position: 'absolute',
            top: (startIndex + i) * rowHeight + 'px',
            left: 0,
            right: 0,
            height: rowHeight + 'px',
            padding: '0 12px',
          }"
          @click="goDetail(startIndex + i)"
        >
          <div class="tabular-nums text-muted">
            <span class="pill">{{ startIndex + i + 1 }}</span>
          </div>
          <div class="truncate">
            <span v-if="isFav(row.name)" class="mr-1 text-jade">★</span>
            {{ row.name }}
          </div>
          <div class="tabular-nums">{{ row.rate }}</div>
          <div class="text-jade"><Sparkline :data="row.spark" /></div>
          <div class="tabular-nums text-muted">{{ row.games }}</div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-xs text-muted">
        ヒント:
        フィルタはURLに保存されます。スマホでは下部ナビから主要ページに素早く移動できます。
      </div>
      <div class="md:hidden flex items-center gap-2">
        <button
          class="rounded-lg border border-border px-3 py-1.5 text-sm hover:text-text"
          @click="shareCurrent"
        >
          共有リンク作成
        </button>
      </div>
    </div>

    <FilterDrawer
      v-model:open="drawerOpen"
      v-model:favOnly="favOnly"
      @range="onRange"
      @exportCsv="onExportCsv"
      @share="shareCurrent"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { downloadCsv } from "@/utils/csv";
import { createShareLink } from "@/utils/share";
import { resolveRange } from "~/utils/range";
import { useRankingQuery } from "~/composables/useRankingQuery";
import type { SortKey, Mode } from "~/types/rankings";

const { model, syncToUrl } = useRankingQuery();
const { isFav, list: favList } = useFavorites();
const { push: pushToast } = useToast();
const drawerOpen = ref(false);

const chipModel = computed({
  get: () => ({
    mode: model.value.mode,
    tableType: model.value.tableType,
    rule: model.value.rule,
    sortKey: model.value.sortKey,
    favOnly: !!model.value.favOnly,
  }),
  set: (v) => {
    Object.assign(model.value, v);
    syncToUrl();
  },
});

const favOnly = computed({
  get: () => !!model.value.favOnly,
  set: (v: boolean) => {
    model.value.favOnly = v;
    syncToUrl();
  },
});

const dense = computed(() => model.value.dense);

function onRange(p: { mode: string; from: string; to: string }) {
  model.value.mode = p.mode as Mode;
  if (model.value.mode === "custom") {
    model.value.from = p.from;
    model.value.to = p.to;
  } else {
    const r = resolveRange(model.value.mode);
    model.value.from = r.from;
    model.value.to = r.to;
  }
  syncToUrl();
}

const setSort = (key: SortKey): void => {
  if (model.value.sortKey === key)
    model.value.sortDir = model.value.sortDir === "asc" ? "desc" : "asc";
  else {
    model.value.sortKey = key;
    model.value.sortDir = key === "name" ? "asc" : "desc";
  }
  syncToUrl();
};
const aria = (k: SortKey): "ascending" | "descending" | "none" =>
  model.value.sortKey === k
    ? model.value.sortDir === "asc"
      ? "ascending"
      : "descending"
    : "none";
const icon = (k: SortKey): "asc" | "desc" | "none" =>
  model.value.sortKey === k ? model.value.sortDir : "none";

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 250));

const rowHeight = computed(() => (model.value.dense ? 40 : 48));
const randomDateWithin = (days = 120): Date => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const t = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(t);
};

const total = 1000;
const data = Array.from({ length: total }).map((_, i) => ({
  id: i,
  name: `Player_${i.toString().padStart(4, "0")}`,
  rate: Math.floor(1800 + Math.random() * 600),
  games: Math.floor(50 + Math.random() * 300),
  spark: Array.from({ length: 16 }, () => Math.floor(1 + Math.random() * 4)),
  playedAt: randomDateWithin(120) as Date,
}));

const filtered = computed(() => {
  const list = [...data];
  if (model.value.from && model.value.to) {
    const fromD = new Date(model.value.from + "T00:00:00");
    const toD = new Date(model.value.to + "T23:59:59");
    return list.filter((r) => r.playedAt >= fromD && r.playedAt <= toD);
  }
  return list;
});

const favFiltered = computed(() =>
  model.value.favOnly
    ? filtered.value.filter((r) => isFav(r.name))
    : filtered.value
);

const sorted = computed(() => {
  const base = [...favFiltered.value];
  const dir = model.value.sortDir === "asc" ? 1 : -1;
  if (model.value.sortKey === "rank") return dir === 1 ? base : base.reverse();
  if (model.value.sortKey === "name")
    return base.sort((a, b) => a.name.localeCompare(b.name) * dir);
  if (model.value.sortKey === "games")
    return base.sort((a, b) => (a.games - b.games) * dir);
  if (model.value.sortKey === "rate")
    return base.sort((a, b) => (a.rate - b.rate) * dir);
  return base;
});

const viewport = ref<HTMLElement | null>(null);
const startIndex = ref(0);
const visibleCount = ref(0);
const selected = ref(0);

onMounted(() => {
  calcVisible();
});
watch(dense, () => calcVisible());

const calcVisible = (): void => {
  const h = viewport.value?.clientHeight ?? (model.value.dense ? 480 : 560);
  visibleCount.value = Math.ceil(h / rowHeight.value) + 2;
};
const onScroll = (): void => {
  const st = viewport.value?.scrollTop ?? 0;
  startIndex.value = Math.max(0, Math.floor(st / rowHeight.value) - 1);
};
const visibleRows = computed(() =>
  sorted.value.slice(startIndex.value, startIndex.value + visibleCount.value)
);
const totalHeight = computed(() => sorted.value.length * rowHeight.value);

const toggleDense = (): void => {
  model.value.dense = !model.value.dense;
  syncToUrl();
};
const isSelected = (i: number): boolean => selected.value === i;

const onKey = (e: KeyboardEvent): void => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selected.value = Math.min(sorted.value.length - 1, selected.value + 1);
    ensureVisible();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selected.value = Math.max(0, selected.value - 1);
    ensureVisible();
  } else if (e.key === "Enter") {
    e.preventDefault();
    goDetail(selected.value);
  }
};
const ensureVisible = (): void => {
  const vp = viewport.value;
  if (!vp) return;
  const top = selected.value * rowHeight.value;
  const bottom = top + rowHeight.value;
  if (top < vp.scrollTop) vp.scrollTop = top;
  if (bottom > vp.scrollTop + vp.clientHeight)
    vp.scrollTop = bottom - vp.clientHeight;
};
const goDetail = (i: number): void => {
  const row = sorted.value[i];
  if (row) navigateTo(`/player/${encodeURIComponent(row.name)}`);
};

const shareCurrent = async (): Promise<void> => {
  try {
    const short = await createShareLink("rankings", { ...model.value });
    await navigator.clipboard.writeText(short);
    pushToast("共有リンクを作成してコピーしました", "success");
  } catch {
    pushToast("共有リンクの作成に失敗しました", "error");
  }
};

const onExportCsv = (): void => {
  const header = ["rank", "name", "rate", "games"];
  const rows = sorted.value
    .map((r, idx) => ({
      rank: idx + 1,
      name: r.name,
      rate: r.rate,
      games: r.games,
    }))
    .slice(0, 500);
  downloadCsv("paiviz_rankings.csv", rows, header, {
    rank: "#",
    name: "名前",
    rate: "Rate",
    games: "対局数",
  });
  pushToast("CSVをダウンロードしました", "success");
};
</script>
