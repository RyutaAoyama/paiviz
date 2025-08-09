<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="close"/>
      <div class="absolute inset-x-0 bottom-0 rounded-t-2xl border border-[#242A33] bg-[#0F1115] p-4 shadow-2xl md:left-auto md:inset-y-0 md:right-0 md:w-[420px] md:rounded-l-2xl md:rounded-tr-none">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold">詳細フィルタ</h3>
          <button class="rounded-md border border-[#242A33] px-2 py-1 text-sm" @click="close">閉じる</button>
        </div>

        <div class="space-y-4">
          <div>
            <div class="mb-1 text-xs text-muted">期間</div>
            <DateRangePicker @update="onRange" />
          </div>

          <div class="flex gap-2">
            <button class="rounded-lg border border-[#242A33] px-3 py-2 text-sm hover:text-text" @click="emit('exportCsv')">
              CSVエクスポート
            </button>
            <button class="rounded-lg border border-[#242A33] px-3 py-2 text-sm hover:text-text" @click="emit('share')">
              共有リンクをコピー
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e:'update:open', v:boolean):void; (e:'range', p:{mode:string; from:string; to:string}):void; (e:'exportCsv'):void; (e:'share'):void }>()
function close(){ emit('update:open', false) }
function onRange(p:{mode:string; from:string; to:string}){ emit('range', p) }
</script>
