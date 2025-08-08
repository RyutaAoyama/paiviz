<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">ランキング</h1>

    <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
      <select
        v-model="period"
        class="rounded-xl bg-[#161A20] px-3 py-2 ring-1 ring-[#242A33]"
      >
        <option value="this">今月</option>
        <option value="prev">先月</option>
        <option value="all">通期</option>
      </select>
      <select
        v-model="tableType"
        class="rounded-xl bg-[#161A20] px-3 py-2 ring-1 ring-[#242A33]"
      >
        <option>一般</option>
        <option>上</option>
        <option>特上</option>
        <option>鳳凰</option>
      </select>
      <select
        v-model="rule"
        class="rounded-xl bg-[#161A20] px-3 py-2 ring-1 ring-[#242A33]"
      >
        <option>東南</option>
        <option>東</option>
      </select>
      <select
        v-model="sortKey"
        class="rounded-xl bg-[#161A20] px-3 py-2 ring-1 ring-[#242A33]"
      >
        <option value="rate">Rate</option>
        <option value="games">対局数</option>
        <option value="win">勝率</option>
      </select>
    </div>

    <div
      ref="viewport"
      class="rounded-2xl border border-[#242A33] bg-[#161A20] text-sm"
      style="height: 560px; overflow: auto"
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
          class="grid grid-cols-[56px_1fr_90px_160px_90px] items-center gap-3 border-b border-[#242A33] hover:bg-[#11151b]"
          :style="{
            position: 'absolute',
            top: (startIndex + i) * rowHeight + 'px',
            left: 0,
            right: 0,
            height: rowHeight + 'px',
            padding: '0 12px',
          }"
        >
          <div class="tabular-nums text-gray-400">{{ startIndex + i + 1 }}</div>
          <div class="truncate">{{ row.name }}</div>
          <div class="tabular-nums">{{ row.rate }}</div>
          <div class="text-teal-400"><Sparkline :data="row.spark" /></div>
          <div class="tabular-nums text-gray-400">{{ row.games }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const period = ref("this");
const tableType = ref("特上");
const rule = ref("東南");
const sortKey = ref<"rate" | "games" | "win">("rate");

const rowHeight = 48;
const total = 1000;
const data = Array.from({ length: total }).map((_, i) => ({
  id: i,
  name: `Player_${i.toString().padStart(4, "0")}`,
  rate: Math.floor(1800 + Math.random() * 600),
  games: Math.floor(50 + Math.random() * 300),
  spark: Array.from({ length: 16 }, () => Math.floor(1 + Math.random() * 4)),
}));
const sorted = computed(() => {
  return [...data].sort((a, b) => b.rate - a.rate);
});

const viewport = ref<HTMLElement | null>(null);
const startIndex = ref(0);
const visibleCount = ref(0);

onMounted(() => {
  calcVisible();
});

function calcVisible() {
  const h = viewport.value?.clientHeight ?? 560;
  visibleCount.value = Math.ceil(h / rowHeight) + 2;
}
function onScroll() {
  const st = viewport.value?.scrollTop ?? 0;
  startIndex.value = Math.max(0, Math.floor(st / rowHeight) - 1);
}
const visibleRows = computed(() => {
  return sorted.value.slice(
    startIndex.value,
    startIndex.value + visibleCount.value
  );
});
const totalHeight = computed(() => sorted.value.length * rowHeight);
</script>
