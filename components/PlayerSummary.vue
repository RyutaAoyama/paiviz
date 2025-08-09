<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <h2 class="truncate text-xl font-semibold">{{ displayName }}</h2>
        <StarButton :name="displayName" />
      </div>
      <div class="text-xs text-muted">
        Rate（現在値）: <span class="tabular-nums">{{ currentRate }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="和了率" :value="pct(kpi.agari)" :tone="toneForKpi('agari', kpi.agari)">
        <DiffBadge v-if="peer" kpi="agari" :delta="kpi.agari - peer.agari" />
      </KpiCard>
      <KpiCard label="放銃率" :value="pct(kpi.houju)" :tone="toneForKpi('houju', kpi.houju)">
        <DiffBadge v-if="peer" kpi="houju" :delta="kpi.houju - peer.houju" />
      </KpiCard>
      <KpiCard label="立直率" :value="pct(kpi.riichi)" :tone="toneForKpi('riichi', kpi.riichi)">
        <DiffBadge v-if="peer" kpi="riichi" :delta="kpi.riichi - peer.riichi" />
      </KpiCard>
      <KpiCard label="副露率" :value="pct(kpi.furo)" :tone="toneForKpi('furo', kpi.furo)">
        <DiffBadge v-if="peer" kpi="furo" :delta="kpi.furo - peer.furo" />
      </KpiCard>
      <KpiCard
        label="平均順位"
        :value="kpi.avgRank.toFixed(2)"
        :tone="toneForKpi('avgRank', kpi.avgRank)"
      >
        <DiffBadge v-if="peer" kpi="avgRank" :delta="kpi.avgRank - peer.avgRank" :percent="false" />
      </KpiCard>
    </div>

    <div class="rounded-2xl border border-border bg-surface p-4">
      <div class="mb-2 flex items-center justify-between text-sm text-muted">
        <span>Rate 推移</span>
        <span class="text-xs">凡例: Rate / MA7</span>
      </div>
      <div ref="chartBox" style="height: 220px"></div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <RankTrendChart :ranks="visibleRanks" />
      <RankDonut :counts="rankCounts" />
    </div>

    <div>
      <div class="mb-2 text-sm text-muted">直近の対局（モック, ▶公式へ）</div>
      <MatchTableMock />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { getLineOptions } from '~/utils/chartTheme';
import { pct, toneForKpi } from '~/utils/kpi';
import { useOnVisible } from '~/composables/useOnVisible';

const props = withDefaults(
  defineProps<{
    name: string;
    peerKpi?: {
      agari: number;
      houju: number;
      riichi: number;
      furo: number;
      avgRank: number;
    } | null;
    rwindow?: number;
  }>(),
  { rwindow: 120 }
);

const displayName = computed(() => decodeURIComponent(props.name));

// 自データ
const me = usePlayerData(displayName);

// kpi は Ref なので reactive に写す
const kpi = reactive({ agari: 0, houju: 0, riichi: 0, furo: 0, avgRank: 0 });
watch(
  () => me.kpi.value,
  (v) => Object.assign(kpi, v),
  { immediate: true }
);

// 現在のRate
const currentRate = computed(() => {
  const arr = me.rate.value;
  return arr.length ? arr[arr.length - 1] : '--';
});

// 可視範囲の着順配列
const visibleRanks = computed<number[]>(() => {
  const arr = me.ranks.value ?? [];
  const w = props.rwindow ?? 120;
  return arr.slice(-w);
});

const rankCounts = computed(() => {
  const c = [0, 0, 0, 0];
  for (const r of visibleRanks.value) if (r >= 1 && r <= 4) c[r - 1]++;
  return c;
});

// peer側KPI（差分表示用）
const peer = computed(() => props.peerKpi ?? null);

// Rate チャート（可視時に初期化）
let chart: any;
const chartBox = ref<HTMLElement | null>(null);
async function renderRate() {
  const echarts = await import('echarts');
  if (!chartBox.value) return;
  if (chart) chart.dispose();
  chart = echarts.init(chartBox.value);
  const x = me.rate.value.map((_, i) => i + 1);
  const opt: any = getLineOptions(me.rate.value, x, {
    maWindow: 7,
    showMA: true,
  });
  if (Array.isArray(opt.series)) {
    if (opt.series[0]) opt.series[0].name = 'Rate';
    if (opt.series[1]) opt.series[1].name = 'MA7';
    opt.legend = { data: ['Rate', 'MA7'], top: 0 };
  }
  chart.setOption(opt);
}
useOnVisible(chartBox, renderRate);
watch(
  () => me.rate.value,
  () => chart && renderRate()
);
</script>
