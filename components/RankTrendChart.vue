<template>
  <div class="rounded-2xl border border-border bg-surface p-4">
    <div class="mb-2 text-sm text-muted">着順の推移（低いほど良い）</div>
    <div ref="box" style="height:280px"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ ranks: number[], showMA?: boolean }>()

let chart: any
const box = ref<HTMLElement|null>(null)

function getCss(name: string) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function ma(arr: number[], window = 7) {
  const out: (number|null)[] = []
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= window) sum -= arr[i - window]
    out.push(i + 1 >= window ? +(sum / Math.min(i + 1, window)).toFixed(2) : null)
  }
  return out
}

async function render() {
  const echarts = await import('echarts')
  if (!box.value) return
  chart = echarts.init(box.value)
  const x = props.ranks.map((_, i) => i + 1)
  const y = props.ranks
  chart.setOption({
    grid: { left: 36, right: 12, top: 20, bottom: 24 },
    textStyle: { color: getCss('--muted'), fontFamily: 'Inter, Noto Sans JP' },
    xAxis: { type: 'category', data: x, axisLabel: { color: getCss('--muted') }, axisLine: { lineStyle: { color: getCss('--border') } } },
    yAxis: { type: 'value', min: 1, max: 4, inverse: true, splitNumber: 3, axisLabel: { formatter: (v: number) => v + '位', color: getCss('--muted') }, splitLine: { lineStyle: { color: '#1B2230' } } },
    series: [
      {
        type: 'line',
        data: y,
        smooth: 0.2,
        showSymbol: true,
        symbolSize: 4,
        lineStyle: { color: getCss('--jade'), width: 2 },
        itemStyle: { color: getCss('--jade') },
        z: 2
      },
      ...(props.showMA !== false ? [{
        type: 'line',
        data: ma(y, 9),
        smooth: true,
        showSymbol: false,
        lineStyle: { color: getCss('--plum'), width: 1.5, opacity: 0.9 },
        z: 3
      }] : [])
    ],
    animationDuration: 250
  })
}

onMounted(render)
onBeforeUnmount(() => chart?.dispose?.())
watch(() => props.ranks, () => chart?.dispose?.() || render())
</script>
