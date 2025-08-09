<template>
  <div class="rounded-2xl border border-[#242A33] bg-[#161A20]">
    <div class="border-b border-[#242A33] px-4 py-2 text-sm text-gray-300">KPI差分</div>
    <div class="divide-y divide-[#242A33]">
      <div v-for="row in rows" :key="row.key" class="grid grid-cols-12 items-center px-4 py-2 text-sm">
        <div class="col-span-3 text-gray-400">{{ row.label }}</div>
        <div class="col-span-4">
          <span :class="toneClass(row.aTone)">{{ row.aText }}</span>
        </div>
        <div class="col-span-1 text-center" :class="diffClass(row.delta)">
          <span>{{ arrow(row.delta) }}</span>
        </div>
        <div class="col-span-4 text-right">
          <span :class="toneClass(row.bTone)">{{ row.bText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type KPI = { agari:number; houju:number; riichi:number; furo:number; avgRank:number }
const props = defineProps<{ a: KPI; b: KPI }>()
const { toneForKpi, pct } = await import('~/utils/kpi')

const defs = [
  { key:'agari',   label:'和了率',   fmt:(v:number)=>pct(v) },
  { key:'houju',   label:'放銃率',   fmt:(v:number)=>pct(v) },
  { key:'riichi',  label:'立直率',   fmt:(v:number)=>pct(v) },
  { key:'furo',    label:'副露率',   fmt:(v:number)=>pct(v) },
  { key:'avgRank', label:'平均順位', fmt:(v:number)=>v.toFixed(2) },
] as const

const rows = computed(() => defs.map(d => {
  const ak = (props.a as any)[d.key] ?? 0
  const bk = (props.b as any)[d.key] ?? 0
  const delta = ak - bk
  return {
    key: d.key, label: d.label, delta,
    aText: d.fmt(ak), bText: d.fmt(bk),
    aTone: toneForKpi(d.key, ak), bTone: toneForKpi(d.key, bk)
  }
}))

const arrow = (n:number) => n === 0 ? '–' : (n > 0 ? '▶' : '◀')
const diffClass = (n:number) => n === 0 ? 'text-gray-400' : (n > 0 ? 'text-teal-400' : 'text-rose-400')
const toneClass = (t:'good'|'bad'|'neutral') => t === 'good' ? 'text-teal-300' : t === 'bad' ? 'text-rose-300' : 'text-gray-300'
</script>
