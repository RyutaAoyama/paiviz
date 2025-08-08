<template>
  <div class="rounded-2xl border border-border bg-surface p-4">
    <div class="mb-2 text-sm text-muted">着順割合</div>
    <div ref="box" style="height:280px"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ ranks: number[] }>()

let chart: any
const box = ref<HTMLElement|null>(null)

function getCss(name: string) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function dist() {
  const c = [0,0,0,0,0] // ignore 0
  for (const r of props.ranks) c[r]++
  return [
    { name: '1位', value: c[1], itemStyle: { color: getCss('--jade') } },
    { name: '2位', value: c[2], itemStyle: { color: getCss('--plum') } },
    { name: '3位', value: c[3], itemStyle: { color: getCss('--amber') || '#F59E0B' } },
    { name: '4位', value: c[4], itemStyle: { color: getCss('--warn') } },
  ]
}

async function render() {
  const echarts = await import('echarts')
  if (!box.value) return
  chart = echarts.init(box.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['48%', '78%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: getCss('--surface'), borderWidth: 2 },
      label: { formatter: '{b}\n{d}%', color: getCss('--text') },
      data: dist()
    }],
    animationDuration: 250
  })
}

onMounted(render)
onBeforeUnmount(() => chart?.dispose?.())
watch(() => props.ranks, () => chart?.dispose?.() || render())
</script>
