<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">ランキング</h1>
      <div class="hidden sm:flex items-center gap-4 text-sm text-muted">
        <div class="flex items-center gap-2">
          密度:
          <button
            class="rounded-lg border border-border px-2 py-1 hover:text-text"
            @click="toggleDense"
          >
            {{ dense ? "凝縮" : "快適" }}
          </button>
        </div>
        <div class="text-xs">↑↓で移動 / Enterで詳細</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
      <select
        v-model="period"
        class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border"
      >
        <option value="this">今月</option>
        <option value="prev">先月</option>
        <option value="all">通期</option>
      </select>
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
        v-model="sortKey"
        class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border"
      >
        <option value="rate">Rate</option>
        <option value="games">対局数</option>
        <option value="win">勝率</option>
      </select>
    </div>

    <div
      ref="viewport"
      class="rounded-2xl border border-border bg-surface text-sm focus-ring"
      :style="{ height: (dense ? 480 : 560) + 'px', overflow: 'auto' }"
      tabindex="0"
      @keydown="onKey"
      @scroll="onScroll"
    >
      <div
        :style="{ height: totalHeight + 'px', position: 'relative' }"
        role="table"
        aria-label="ランキング"
      >
        <div
          v-for="(row, i) in visibleRows"
          :key="row.id"
          class="grid grid-cols-[72px_1fr_90px_160px_90px] items-center gap-3 border-b border-border row-hover"
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
          <div class="truncate">{{ row.name }}</div>
          <div class="tabular-nums">{{ row.rate }}</div>
          <div class="text-jade"><Sparkline :data="row.spark" /></div>
          <div class="tabular-nums text-muted">{{ row.games }}</div>
        </div>
      </div>
    </div>
    <div class="sm:hidden text-xs text-muted">
      ヒント: ランキングをタップ後、キーボード↑↓/Enterでも操作できます
    </div>
  </section>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { ref, computed, onMounted, watch } from "vue";

const period = ref("this");
const tableType = ref("特上");
const rule = ref("東南");
const sortKey = ref<"rate" | "games" | "win">("rate");

const dense = ref(false);
const rowHeight = computed(() => (dense.value ? 40 : 48));

const total = 1000;
const data = Array.from({ length: total }).map((_, i) => ({
  id: i,
  name: `Player_${i.toString().padStart(4, "0")}`,
  rate: Math.floor(1800 + Math.random() * 600),
  games: Math.floor(50 + Math.random() * 300),
  spark: Array.from({ length: 16 }, () => Math.floor(1 + Math.random() * 4)),
}));
const sorted = computed(() => [...data].sort((a, b) => b.rate - a.rate));

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
const visibleRows = computed(() => {
  return sorted.value.slice(
    startIndex.value,
    startIndex.value + visibleCount.value
  );
});
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
</script>
