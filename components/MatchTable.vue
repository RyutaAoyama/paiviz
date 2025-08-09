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
        <tr v-for="(row, i) in rows" :key="i" class="border-t border-[#242A33] hover:bg-[#11151b]">
          <td class="px-3 py-2">{{ row.at.slice(0, 10) }}</td>
          <td class="px-3 py-2">{{ row.table }}</td>
          <td class="px-3 py-2">{{ row.rule }}</td>
          <td class="px-3 py-2 text-right tabular-nums">{{ row.rank }}</td>
          <td class="px-3 py-2 text-right tabular-nums">{{ row.point }}</td>
          <td class="px-3 py-2 text-center">
            <a
              :href="`https://tenhou.net/?log=${row.logId}`"
              target="_blank"
              rel="noopener"
              class="text-teal-400 hover:underline"
              >▶公式</a
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import type { MatchRow } from '~/utils/player';
defineProps<{ rows: MatchRow[] }>();
</script>
