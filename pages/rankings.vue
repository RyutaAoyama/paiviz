<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">ランキング</h1>
      <div class="hidden md:flex items-center gap-2 text-sm text-muted">
        <button
          class="rounded-lg border border-border px-2 py-1 hover:text-text"
          @click="toggleDense"
        >
          密度: {{ dense ? "凝縮" : "快適" }}
        </button>
        <button
          class="rounded-lg border border-border px-2 py-1 hover:text-text"
          @click="copyLink"
        >
          共有リンクをコピー
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
      <DateRangePicker @update="onRange" />
      <select
        v-model="tableType"
        class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border"
      >
        <option>一般</option>
        <option>上</option>
        <option>特上</option>
        <option>鳳凰</option>
      </select>
      <select
        v-model="rule"
        class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border"
      >
        <option>東南</option>
        <option>東</option>
      </select>
      <select
        v-model="sort.key"
        class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border"
      >
        <option value="rate">Rate</option>
        <option value="games">対局数</option>
        <option value="name">名前</option>
      </select>
    </div>

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

      <div
        :style="{ height: totalHeight + 'px', position: 'relative' }"
        role="table"
        aria-label="ランキング"
      >
        <div
          v-for="(row, i) in visibleRows"
          :key="row.id"
          class="grid grid-cols-[72px_1fr_90px_160px_90px] items-center gap-3 border-b border-border hover:outline hover:outline-1 hover:outline-[#1b2230] rounded-md"
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
    <div class="text-xs text-muted">
      ヒント:
      期間・卓・ルール・ソートはURLに保存されます。お気に入りは★でハイライト。
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { isFav } = useFavorites();

// range state (mode/from/to)
const mode = ref(String(route.query.mode ?? "this"));
const from = ref(String(route.query.from ?? ""));
const to = ref(String(route.query.to ?? ""));

function onRange(p: { mode: string; from: string; to: string }) {
  mode.value = p.mode;
  from.value = p.from;
  to.value = p.to;
}

// other filters
const tableType = ref(route.query.tableType?.toString() || "特上");
const rule = ref(route.query.rule?.toString() || "東");
const dense = ref(route.query.dense === "true" ? true : false);

const sort = reactive<{
  key: "rank" | "name" | "rate" | "games";
  dir: "asc" | "desc";
}>({
  key: (route.query.sortKey?.toString() as any) || "rate",
  dir: (route.query.sortDir?.toString() as any) || "desc",
});
watch(
  [mode, from, to, tableType, rule, dense, () => sort.key, () => sort.dir],
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
        sortKey: sort.key,
        sortDir: sort.dir,
      },
    });
  }
);

// sort helpers
function setSort(key: "rank" | "name" | "rate" | "games") {
  if (sort.key === key) sort.dir = sort.dir === "asc" ? "desc" : "asc";
  else {
    sort.key = key;
    sort.dir = key === "name" ? "asc" : "desc";
  }
}
function aria(k: string) {
  return sort.key === k
    ? sort.dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
}
function icon(k: string): "asc" | "desc" | "none" {
  return sort.key === k ? sort.dir : "none";
}

// mock loading skeleton
const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 300));

// virtual list & sort
const rowHeight = computed(() => (dense.value ? 40 : 48));
const total = 1000;
const data = Array.from({ length: total }).map((_, i) => ({
  id: i,
  name: `Player_${i.toString().padStart(4, "0")}`,
  rate: Math.floor(1800 + Math.random() * 600),
  games: Math.floor(50 + Math.random() * 300),
  spark: Array.from({ length: 16 }, () => Math.floor(1 + Math.random() * 4)),
}));

const sorted = computed(() => {
  const base = [...data];
  const dir = sort.dir === "asc" ? 1 : -1;
  if (sort.key === "name")
    return base.sort((a, b) => a.name.localeCompare(b.name) * dir);
  if (sort.key === "games")
    return base.sort((a, b) => (a.games - b.games) * dir);
  if (sort.key === "rate") return base.sort((a, b) => (a.rate - b.rate) * dir);
  return base.sort((a, b) => b.rate - a.rate);
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

async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href);
  } catch {}
}
</script>
