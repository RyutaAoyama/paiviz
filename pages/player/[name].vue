<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ decodeURIComponent(route.params.name as string) }}
    </h1>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        label="和了率"
        :value="pct(kpi.agari)"
        :tone="toneForKpi('agari', kpi.agari)"
      />
      <KpiCard
        label="放銃率"
        :value="pct(kpi.houju)"
        :tone="toneForKpi('houju', kpi.houju)"
      />
      <KpiCard
        label="立直率"
        :value="pct(kpi.riichi)"
        :tone="toneForKpi('riichi', kpi.riichi)"
      />
      <KpiCard
        label="副露率"
        :value="pct(kpi.furo)"
        :tone="toneForKpi('furo', kpi.furo)"
      />
      <KpiCard
        label="平均順位"
        :value="kpi.avgRank.toFixed(2)"
        :tone="toneForKpi('avgRank', kpi.avgRank)"
      />
    </div>

    <AdSlot type="mid" />

    <div class="rounded-2xl border border-border bg-surface p-4">
      <div class="mb-2 text-sm text-muted">Rate 推移（ダミーデータ + MA7）</div>
      <div style="height: 280px" ref="chartBox"></div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <RankTrendChart :ranks="ranks" />
      <RankPieChart :ranks="ranks" />
    </div>

    <div>
      <div class="mb-2 text-sm text-muted">直近の対局（モック, ▶公式へ）</div>
      <MatchTableMock />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { getLineOptions } from "~/utils/chartTheme";
import { pct, toneForKpi } from "~/utils/kpi";

const route = useRoute();

// --- dummy KPI for now (replace later with real) ---
const kpi = {
  agari: 0.24,
  houju: 0.11,
  riichi: 0.19,
  furo: 0.31,
  avgRank: 2.48,
};

// --- dummy rank series (1..4) ---
const ranks = ref<number[]>(
  Array.from({ length: 120 }).map(() => {
    const r = Math.random();
    if (r < 0.27) return 1;
    if (r < 0.27 + 0.26) return 2;
    if (r < 0.27 + 0.26 + 0.25) return 3;
    return 4;
  })
);

let chart: any;
const chartBox = ref<HTMLElement | null>(null);

onMounted(async () => {
  const echarts = await import("echarts");
  if (chartBox.value) {
    chart = echarts.init(chartBox.value);
    const x = Array.from({ length: 60 }).map((_, i) => i + 1);
    const y = x.map((i) => 1800 + Math.sin(i / 6) * 100 + Math.random() * 50);
    chart.setOption(getLineOptions(y, x, { maWindow: 7, showMA: true }));
  }
});
onBeforeUnmount(() => {
  chart?.dispose?.();
});
</script>
