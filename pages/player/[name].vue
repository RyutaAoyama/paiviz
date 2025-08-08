<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ decodeURIComponent(route.params.name as string) }}
    </h1>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="和了率" :value="'--%'" />
      <KpiCard label="放銃率" :value="'--%'" />
      <KpiCard label="立直率" :value="'--%'" />
      <KpiCard label="副露率" :value="'--%'" />
      <KpiCard label="平均順位" :value="'--'" />
    </div>
    <AdSlot type="mid" />
    <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
      <div class="mb-2 text-sm text-gray-400">Rate 推移（ダミーデータ）</div>
      <div style="height: 280px" ref="chartBox"></div>
    </div>
    <div
      class="rounded-2xl border border-[#242A33] bg-[#161A20] p-8 text-sm text-gray-400"
    >
      直近の対局（モック, ▶公式へ）
    </div>
  </section>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";

const route = useRoute();
let chart: any;
const chartBox = ref<HTMLElement | null>(null);
onMounted(async () => {
  const echarts = await import("echarts");
  if (chartBox.value) {
    chart = echarts.init(chartBox.value);
    const x = Array.from({ length: 60 }).map((_, i) => i + 1);
    const y = x.map((i) => 1800 + Math.sin(i / 6) * 100 + Math.random() * 50);
    chart.setOption({
      grid: { left: 32, right: 16, top: 20, bottom: 24 },
      xAxis: { type: "category", data: x, axisLabel: { color: "#9CA3AF" } },
      yAxis: { type: "value", axisLabel: { color: "#9CA3AF" } },
      series: [{ type: "line", data: y, showSymbol: false, smooth: true }],
    });
  }
});
onBeforeUnmount(() => {
  chart?.dispose?.();
});
</script>
