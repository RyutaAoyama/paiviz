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

      <div v-if="sorted.length === 0" class="p-6 text-sm text-muted">
        条件に合うプレイヤーが見つかりません。フィルタや期間を見直してください。
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { downloadCsv } from "@/utils/csv";
import { createShareLink } from "@/utils/share";

type Mode = "this" | "prev" | "last30d" | "last90d" | "custom";
type Table = "一般" | "上" | "特上" | "鳳凰";
type Rule = "東南" | "東";
type SortKey = "rank" | "rate" | "games" | "name";

const MODES: readonly Mode[] = ["this", "prev", "last30d", "last90d", "custom"];
const TABLES: readonly Table[] = ["一般", "上", "特上", "鳳凰"];
const RULES: readonly Rule[] = ["東南", "東"];
const SORTS: readonly SortKey[] = ["rank", "rate", "games", "name"];

const asMode = (v: any): Mode => (MODES.includes(v) ? (v as Mode) : "this");
const asTable = (v: any): Table => (TABLES.includes(v) ? (v as Table) : "特上");
const asRule = (v: any): Rule => (RULES.includes(v) ? (v as Rule) : "東");
const asSortKey = (v: any): SortKey =>
  SORTS.includes(v) ? (v as SortKey) : "rate";

const route = useRoute();
const router = useRouter();
const { isFav } = useFavorites();
const { push: pushToast } = useToast();

const mode = ref<Mode>(asMode(route.query.mode));
const from = ref(String(route.query.from ?? ""));
const to = ref(String(route.query.to ?? ""));
const tableType = ref<Table>(asTable(route.query.tableType));
const rule = ref<Rule>(asRule(route.query.rule));
const dense = ref(route.query.dense === "true");
const favOnly = ref(route.query.favOnly === "true");

const sort = reactive<{ key: SortKey; dir: "asc" | "desc" }>({
  key: asSortKey(route.query.sortKey),
  dir: route.query.sortDir === "asc" ? "asc" : "desc",
});

const chipModel = computed<{
  mode: Mode;
  tableType: Table;
  rule: Rule;
  sortKey: SortKey;
  favOnly: boolean;
}>({
  get: () => ({
    mode: mode.value,
    tableType: tableType.value,
    rule: rule.value,
    sortKey: sort.key,
    favOnly: favOnly.value,
  }),
  set: (v) => {
    mode.value = v.mode;
    tableType.value = v.tableType;
    rule.value = v.rule;
    sort.key = v.sortKey;
    favOnly.value = v.favOnly;
  },
});

watch(
  [
    mode,
    from,
    to,
    tableType,
    rule,
    dense,
    favOnly,
    () => sort.key,
    () => sort.dir,
  ],
  () => {
    router.replace({
      query: {
        ...route.query,
        mode: mode.value,
        from: from.value,
        to: to.value,
        tableType: tableType.value,
        rule: rule.value,
        dense: String(dense.value),
        favOnly: String(favOnly.value),
        sortKey: sort.key,
        sortDir: sort.dir,
      },
    });
  }
);

function onRange(p: { mode: string; from: string; to: string }) {
  mode.value = asMode(p.mode);
  from.value = p.from;
  to.value = p.to;
}

function setSort(key: SortKey) {
  if (sort.key === key) sort.dir = sort.dir === "asc" ? "desc" : "asc";
  else {
    sort.key = key;
    sort.dir = key === "name" ? "asc" : "desc";
  }
}
function aria(k: SortKey) {
  return sort.key === k
    ? sort.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
}
function icon(k: SortKey) {
  return sort.key === k ? sort.dir : "none";
}

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 250));

const rowHeight = computed(() => (dense.value ? 40 : 48));
function randomDateWithin(days = 120) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const t = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(t);
}

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
  if (from.value && to.value) {
    const fromD = new Date(from.value + "T00:00:00");
    const toD = new Date(to.value + "T23:59:59");
    return list.filter((r) => r.playedAt >= fromD && r.playedAt <= toD);
  } else {
    const days =
      mode.value === "this"
        ? 31
        : mode.value === "prev"
        ? 31
        : mode.value === "last90d"
        ? 90
        : 30;
    const fromD = new Date(Date.now() - days * 86400000);
    return list.filter((r) => r.playedAt >= fromD);
  }
});

const favFiltered = computed(() =>
  favOnly.value ? filtered.value.filter((r) => isFav(r.name)) : filtered.value
);

const sorted = computed(() => {
  const base = [...favFiltered.value];
  const dir = sort.dir === "asc" ? 1 : -1;
  if (sort.key === "rank") return dir === 1 ? base : base.reverse();
  if (sort.key === "name")
    return base.sort((a, b) => a.name.localeCompare(b.name) * dir);
  if (sort.key === "games")
    return base.sort((a, b) => (a.games - b.games) * dir);
  if (sort.key === "rate") return base.sort((a, b) => (a.rate - b.rate) * dir);
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

function calcVisible() {
  const h = viewport.value?.clientHeight ?? (dense.value ? 480 : 560);
  visibleCount.value = Math.ceil(h / rowHeight.value) + 2;
}
function onScroll() {
  const st = viewport.value?.scrollTop ?? 0;
  startIndex.value = Math.max(0, Math.floor(st / rowHeight.value) - 1);
}
const visibleRows = computed(() =>
  sorted.value.slice(startIndex.value, startIndex.value + visibleCount.value)
);
const totalHeight = computed(() => sorted.value.length * rowHeight.value);

function toggleDense() {
  dense.value = !dense.value;
}
function isSelected(i: number) {
  return selected.value === i;
}

function onKey(e: KeyboardEvent) {
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
}
function ensureVisible() {
  const vp = viewport.value;
  if (!vp) return;
  const top = selected.value * rowHeight.value;
  const bottom = top + rowHeight.value;
  if (top < vp.scrollTop) vp.scrollTop = top;
  if (bottom > vp.scrollTop + vp.clientHeight)
    vp.scrollTop = bottom - vp.clientHeight;
}
function goDetail(i: number) {
  const row = sorted.value[i];
  if (row) navigateTo(`/player/${encodeURIComponent(row.name)}`);
}

async function shareCurrent() {
  try {
    const short = await createShareLink("rankings", {
      mode: mode.value,
      from: from.value,
      to: to.value,
      tableType: tableType.value,
      rule: rule.value,
      dense: dense.value,
      favOnly: favOnly.value,
      sortKey: sort.key,
      sortDir: sort.dir,
    });
    await navigator.clipboard.writeText(short);
    pushToast("共有リンクを作成してコピーしました", "success");
  } catch {
    pushToast("共有リンクの作成に失敗しました", "error");
  }
}

function onExportCsv() {
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
}
const drawerOpen = ref(false);
</script>
