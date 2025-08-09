<template>
  <div class="rounded-2xl border border-[#242A33] bg-[#161A20]">
    <!-- ヘッダ -->
    <div
      class="sticky top-0 z-10 grid border-b border-[#242A33] bg-[#161A20] text-xs text-gray-400"
      :style="{ gridTemplateColumns: colTemplate }"
    >
      <div v-for="c in columns" :key="c.key" class="px-3 py-2">{{ c.label }}</div>
    </div>

    <!-- ビューポート -->
    <div ref="viewport" class="relative overflow-auto" :style="{ height: height + 'px' }" @scroll="onScroll">
      <!-- 全体高（ダミー） -->
      <div :style="{ height: totalHeight + 'px' }"></div>
      <!-- 可視領域 -->
      <div class="absolute left-0 right-0" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="(row, i) in visibleRows"
          :key="row[keyField] ?? i"
          class="grid items-center text-sm text-gray-200 hover:bg-white/5"
          :style="{ gridTemplateColumns: colTemplate, height: rowHeight + 'px' }"
          role="row"
        >
          <div v-for="c in columns" :key="c.key" class="px-3">
            <component :is="c.render ?? 'span'" v-bind="buildCellProps(row, c)">{{ row[c.key] }}</component>
          </div>
        </div>
      </div>
    </div>
    <!-- フッタ（件数） -->
    <div class="border-t border-[#242A33] px-3 py-2 text-xs text-gray-400">
      表示: {{ rows.length }} 件
    </div>
  </div>
</template>

<script setup lang="ts">
type Col = { key: string; label: string; width?: string; render?: any }
const props = defineProps<{
  rows: any[]
  columns: Col[]
  rowHeight?: number
  height?: number
  keyField?: string
}>()

const rowHeight = props.rowHeight ?? 44
const height = props.height ?? 480
const keyField = props.keyField ?? 'name'

const viewport = ref<HTMLElement|null>(null)
const start = ref(0)
const end = ref(0)
const buffer = 6 // 上下に余分に描画
const colTemplate = computed(() => (props.columns ?? []).map(c => c.width ?? '1fr').join(' '))

const totalHeight = computed(() => (props.rows?.length ?? 0) * rowHeight)
const page = Math.ceil(height / rowHeight)

const clamp = (): void => {
  const v = viewport.value
  const len = props.rows?.length ?? 0
  if (!v || !len) { start.value = 0; end.value = 0; return }
  const s = Math.floor(v.scrollTop / rowHeight)
  start.value = Math.max(0, s - buffer)
  end.value = Math.min(len, s + page + buffer)
}
const onScroll = (): void => clamp()
onMounted(() => { clamp(); window.addEventListener('resize', clamp) })
onBeforeUnmount(() => window.removeEventListener('resize', clamp))

const offsetY = computed(() => start.value * rowHeight)
const visibleRows = computed(() => props.rows?.slice(start.value, end.value) ?? [])

const buildCellProps = (row:any, c:Col) => ({ row, value: row[c.key], col: c })

// 公開メソッド：現在の可視行（CSVなどで利用したい場合）
defineExpose({ getVisible: () => visibleRows.value })
</script>

