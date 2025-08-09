<template>
  <div class="flex flex-wrap items-center gap-2">
    <select v-model="mode" class="rounded-xl bg-surface px-3 py-2 ring-1 ring-border">
      <option value="this">今月</option>
      <option value="prev">先月</option>
      <option value="last30d">直近30日</option>
      <option value="last90d">直近90日</option>
      <option value="custom">カスタム</option>
    </select>
    <div v-if="mode==='custom'" class="flex items-center gap-2">
      <input type="date" v-model="from" class="rounded-xl bg-surface px-2 py-1 ring-1 ring-border" />
      <span class="text-muted text-xs">〜</span>
      <input type="date" v-model="to" class="rounded-xl bg-surface px-2 py-1 ring-1 ring-border" />
      <button class="rounded-lg border border-border px-2 py-1 text-sm hover:text-text" @click="setThisMonth">今月に戻す</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e:'update', payload:{mode:string; from:string; to:string}):void }>()
function fmt(d: Date){ return d.toISOString().slice(0,10) }

function monthRange(offset=0){
  const t = new Date()
  const y = t.getFullYear()
  const m = t.getMonth() + offset
  const first = new Date(y, m, 1)
  const last = new Date(y, m+1, 0)
  return { from: fmt(first), to: fmt(last) }
}
function lastDays(n:number){
  const to = new Date()
  const from = new Date(to.getTime() - (n-1)*86400000)
  return { from: fmt(from), to: fmt(to) }
}

const mode = ref<'this'|'prev'|'last30d'|'last90d'|'custom'>('this')
const from = ref(monthRange(0).from)
const to = ref(monthRange(0).to)

watch([mode, from, to], () => {
  if (mode.value === 'this'){ const r = monthRange(0); from.value = r.from; to.value = r.to }
  if (mode.value === 'prev'){ const r = monthRange(-1); from.value = r.from; to.value = r.to }
  if (mode.value === 'last30d'){ const r = lastDays(30); from.value = r.from; to.value = r.to }
  if (mode.value === 'last90d'){ const r = lastDays(90); from.value = r.from; to.value = r.to }
  emit('update', { mode: mode.value, from: from.value, to: to.value })
}, { immediate: true })

function setThisMonth(){
  mode.value = 'this'
  const r = monthRange(0)
  from.value = r.from; to.value = r.to
}
</script>
