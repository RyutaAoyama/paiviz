<template>
  <div class="overflow-auto rounded-2xl border border-[#242A33]">
    <table class="min-w-full text-sm">
      <thead class="sticky top-0 bg-[#161A20] text-gray-400">
        <tr>
          <th class="px-3 py-2 text-left">日付</th>
          <th class="px-3 py-2 text-left">卓種</th>
          <th class="px-3 py-2 text-left">ルール</th>
          <th class="px-3 py-2 text-right">着順</th>
          <th class="px-3 py-2 text-right">持点</th>
          <th class="px-3 py-2 text-center">リプレイ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-t border-[#242A33] hover:bg-[#11151b]">
          <td class="px-3 py-2">{{ row.date }}</td>
          <td class="px-3 py-2">{{ row.table }}</td>
          <td class="px-3 py-2">{{ row.rule }}</td>
          <td class="px-3 py-2 text-right tabular-nums">{{ row.rank }}</td>
          <td class="px-3 py-2 text-right tabular-nums">{{ row.points }}</td>
          <td class="px-3 py-2 text-center">
            <a :href="row.replay" target="_blank" rel="noopener" class="text-teal-400 hover:underline">▶ 公式</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
type Row = { id:number; date:string; table:string; rule:string; rank:number; points:number; replay:string }
const rows: Row[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  date: `2025/08/${(i+1).toString().padStart(2,'0')}`,
  table: ['一般','上','特上','鳳凰'][i%4] + '東南',
  rule: i % 2 ? '喰断アリ' : '喰断ナシ',
  rank: 1 + (i % 4),
  points: 25000 + Math.floor(Math.random()*40000),
  replay: '#'
}))
</script>
