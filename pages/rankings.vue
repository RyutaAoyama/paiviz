<script setup lang="ts">
import { h } from 'vue'
const { model } = useRankingQuery()
useHead(() => {
  const q = model.value
  const ttl = `ランキング（${q.mode} / ${q.tableType} / ${q.rule}）— Paiviz`
  const desc = `天鳳のランキング。期間: ${q.mode}${q.mode==='custom' && q.from && q.to ? `（${q.from}〜${q.to}）` : ''} / 卓: ${q.tableType} / ルール: ${q.rule}`
  return {
    title: ttl,
    meta: [
      { property:'og:title', content: ttl },
      { property:'og:description', content: desc },
      { name:'twitter:title', content: ttl },
      { name:'twitter:description', content: desc },
      { name:'description', content: desc }
    ]
  }
})

// TODO: 実データに差し替え。今はモック行（安定動作確認用）
type Row = { rank:number; name:string; rate:number; games:number; trend:string }
const allRows = ref<Row[]>(Array.from({length: 500}, (_,i)=> ({
  rank: i+1,
  name: `Player_${(i+1).toString().padStart(3,'0')}`,
  rate: 2000 + Math.round(Math.random()*800),
  games: 50 + Math.round(Math.random()*200),
  trend: '↗︎'
})))

// お気に入りフィルタ
const { has } = useFavorites()
const filtered = computed(() => {
  let rows = allRows.value
  if (model.value.favOnly) rows = rows.filter(r => has(r.name))
  // ルール/卓など他フィルタはここに適用
  // ソート
  const { sortKey, sortDir } = model.value
  const k = sortKey
  rows = rows.slice().sort((a:any,b:any)=>{
    const va = a[k], vb = b[k]
    return sortDir === 'asc' ? (va>vb?1:-1) : (va<vb?1:-1)
  })
  // rankを振り直す（表示用）
  rows.forEach((r, idx) => (r.rank = idx+1))
  return rows
})

// CSV
import { toCsv, downloadCsv } from '~/utils/csv'
const exportCsv = (): void => {
  const csv = toCsv(filtered.value, [
    { key:'rank', label:'#' },
    { key:'name', label:'名前' },
    { key:'rate', label:'Rate' },
    { key:'games', label:'対局数' }
  ])
  const q = model.value
  const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'')
  downloadCsv(`paiviz_rankings_${ymd}_${q.mode}_${q.tableType}_${q.rule}.csv`, csv)
}

// テーブル列定義
const columns = [
  { key:'fav',   label:'',      width:'72px', render: { render: (p:any) => h('div', { class:'text-xs' }, h('fav-star', { name: p.row.name })) } },
  { key:'rank',  label:'#',     width:'64px' },
  { key:'name',  label:'名前',  width:'1fr' },
  { key:'rate',  label:'Rate',  width:'120px' },
  { key:'games', label:'対局数', width:'120px' }
]
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">ランキング</h1>

    <!-- （フィルタチップやドロワーは既存のものを継続） -->

    <div class="flex items-center gap-2">
      <button class="rounded-lg bg-[#0F1115] px-3 py-2 ring-1 ring-[#242A33] text-sm" @click="exportCsv">
        CSVエクスポート
      </button>
      <button class="rounded-lg bg-[#0F1115] px-3 py-2 ring-1 ring-[#242A33] text-sm">
        共有リンク作成
      </button>
      <div class="ml-auto text-xs text-gray-400">表示: {{ filtered.length }} 件</div>
    </div>

    <VirtualTable :rows="filtered" :columns="columns" :height="520" :row-height="44" key-field="name" />
  </section>
</template>
