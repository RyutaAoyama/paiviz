<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ decodeURIComponent(route.params.name as string) }}
      </h1>
      <div class="flex items-center gap-2 text-sm text-muted">
        <label class="flex items-center gap-2">
          対象試合数
          <select
            v-model.number="rwindow"
            class="rounded-xl bg-surface px-2 py-1 ring-1 ring-border"
          >
            <option :value="60">60</option>
            <option :value="120">120</option>
            <option :value="240">240</option>
            <option :value="9999">全期間</option>
          </select>
        </label>
        <button
          class="rounded-lg border border-border px-2 py-1 hover:text-text"
          @click="copyLink"
        >
          共有
        </button>
      </div>
    </div>

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
      <RankTrendChart :ranks="visibleRanks" />
      <RankPieChart :ranks="visibleRanks" />
    </div>

    <div>
      <div class="mb-2 text-sm text-muted">直近の対局（モック, ▶公式へ）</div>
      <MatchTableMock />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import MatchTableMock from "~/components/MatchTableMock.vue";
import RankTrendChart from "~/components/RankTrendChart.vue";
import RankPieChart from "~/components/RankPieChart.vue";
import { getLineOptions } from "~/utils/chartTheme";
import { pct, toneForKpi } from "~/utils/kpi";

const route = useRoute();
const router = useRouter();

// Query param: rwindow (対象試合数)
const rwindow = ref<number>(Number(route.query.rwindow ?? 120) || 120);
watchEffect(() => {
  const q = { ...route.query, rwindow: String(rwindow.value) };
  router.replace({ query: q });
});

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
  Array.from({ length: 480 }).map(() => {
    const r = Math.random();
    if (r < 0.27) return 1;
    if (r < 0.27 + 0.26) return 2;
    if (r < 0.27 + 0.26 + 0.25) return 3;
    return 4;
  })
);
const visibleRanks = computed(() => ranks.value.slice(-rwindow.value));

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

async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href);
  } catch {}
}
</script>
