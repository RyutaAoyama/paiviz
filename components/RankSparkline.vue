<template>
  <div ref="box" class="h-14 w-full md:h-20">
    <div
      v-if="!hasData"
      class="flex h-full items-center justify-center rounded bg-[#242A33] text-xs text-muted"
    >
      データなし
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch, computed } from 'vue';

const props = defineProps<{ ranks: number[] }>();
const box = ref<HTMLElement | null>(null);
let chart: any;
const hasData = computed(() => Array.isArray(props.ranks) && props.ranks.length > 0);

const render = async (): Promise<void> => {
  if (!box.value || !hasData.value) return;
  const echarts = await import('echarts');
  chart = echarts.init(box.value);
  const data = props.ranks;
  chart.setOption({
    grid: { left: 2, right: 2, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', min: 1, max: 4, inverse: true, splitNumber: 3, show: false },
    series: [
      {
        type: 'line',
        data,
        showSymbol: false,
        lineStyle: { color: '#14B8A6', width: 1.5 },
        markPoint: {
          data: [
            {
              coord: [data.length - 1, data[data.length - 1]],
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color: '#14B8A6' },
            },
          ],
        },
      },
      {
        type: 'line',
        data: Array(data.length).fill(2.5),
        showSymbol: false,
        lineStyle: { color: '#374151', width: 1, type: 'dashed' },
      },
    ],
    animation: false,
  });
};

useOnVisible(box, () => render());
onBeforeUnmount(() => chart?.dispose?.());
watch(
  () => props.ranks,
  () => chart?.dispose?.() || render()
);
</script>
