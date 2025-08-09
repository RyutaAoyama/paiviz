<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">{{ name }}</h2>
      <StarButton :name="name" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <KpiCard label="和了率" :value="pct(0.24)" />
      <KpiCard label="放銃率" :value="pct(0.11)" />
      <KpiCard label="立直率" :value="pct(0.19)" />
      <KpiCard label="副露率" :value="pct(0.31)" />
    </div>
    <div class="rounded-2xl border border-border bg-surface p-4">
      <div class="mb-2 text-sm text-muted">Rate 推移（ダミー）</div>
      <div ref="box" style="height: 200px"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { getLineOptions } from '~/utils/chartTheme';
import { pct } from '~/utils/kpi';

const { name } = defineProps<{ name: string }>();
let chart: any;
const box = ref<HTMLElement | null>(null);

onMounted(async () => {
  const echarts = await import('echarts');
  if (!box.value) return;
  chart = echarts.init(box.value);
  const x = Array.from({ length: 40 }).map((_, i) => i + 1);
  const y = x.map((i) => 1800 + Math.sin(i / 6) * 100 + Math.random() * 50);
  chart.setOption(getLineOptions(y, x));
});
onBeforeUnmount(() => chart?.dispose?.());
</script>
