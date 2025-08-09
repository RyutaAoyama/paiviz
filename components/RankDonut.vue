<template>
  <div class="rounded-2xl border border-border bg-surface p-4">
    <div class="mb-2 text-sm text-muted">着順割合</div>
    <div ref="box" style="height: 280px"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{ counts: number[] }>();

let chart: any;
const box = ref<HTMLElement | null>(null);

function getCss(name: string) {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function render() {
  const echarts = await import('echarts');
  if (!box.value) return;
  chart = echarts.init(box.value);
  const data = [
    { value: props.counts[0], name: '1位', itemStyle: { color: getCss('--jade') } },
    { value: props.counts[1], name: '2位', itemStyle: { color: getCss('--plum') } },
    { value: props.counts[2], name: '3位', itemStyle: { color: 'var(--amber)' } },
    { value: props.counts[3], name: '4位', itemStyle: { color: getCss('--warn') } },
  ];
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {d}% ({c} 回)' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '78%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: getCss('--surface'), borderWidth: 2 },
        label: { formatter: '{b}\n{d}%', color: getCss('--text') },
        data,
      },
    ],
    animationDuration: 250,
  });
}

onMounted(render);
onBeforeUnmount(() => chart?.dispose?.());
watch(
  () => props.counts,
  () => chart?.dispose?.() || render(),
  { deep: true }
);
</script>
