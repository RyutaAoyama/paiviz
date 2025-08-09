<template>
  <div ref="box" class="relative h-24 w-24" @click="toggle">
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

const props = defineProps<{
  dist: { first: number; second: number; third: number; fourth: number };
}>();
const box = ref<HTMLElement | null>(null);
let chart: any;
const showLast = ref(false);
const total = computed(
  () => props.dist.first + props.dist.second + props.dist.third + props.dist.fourth
);
const hasData = computed(() => total.value > 0);

const render = async (): Promise<void> => {
  if (!box.value || !hasData.value) return;
  const echarts = await import('echarts');
  chart = echarts.init(box.value);
  const data = [
    { value: props.dist.first, name: '1位', itemStyle: { color: '#14B8A6' } },
    { value: props.dist.second, name: '2位', itemStyle: { color: '#6B7280' } },
    { value: props.dist.third, name: '3位', itemStyle: { color: '#9CA3AF' } },
    { value: props.dist.fourth, name: '4位', itemStyle: { color: '#F43F5E' } },
  ];
  const topRate = total.value ? ((props.dist.first / total.value) * 100).toFixed(0) : '0';
  const lastRate = total.value ? ((props.dist.fourth / total.value) * 100).toFixed(0) : '0';
  chart.setOption({
    title: {
      text: showLast.value ? `${lastRate}%` : `${topRate}%`,
      subtext: showLast.value ? 'ラス率' : 'Top率',
      left: 'center',
      top: 'center',
      textStyle: { color: '#fff', fontSize: 14 },
      subtextStyle: { color: '#9CA3AF', fontSize: 12 },
    },
    tooltip: { trigger: 'item', formatter: '{b}: {d}% ({c})' },
    series: [
      {
        type: 'pie',
        radius: ['60%', '90%'],
        label: { show: false },
        data,
        itemStyle: { borderColor: '#161A20', borderWidth: 2 },
      },
    ],
    animation: false,
  });
};

const toggle = (): void => {
  showLast.value = !showLast.value;
};

useOnVisible(box, () => render());
onBeforeUnmount(() => chart?.dispose?.());
watch([() => props.dist, showLast], () => chart?.dispose?.() || render(), { deep: true });
</script>
