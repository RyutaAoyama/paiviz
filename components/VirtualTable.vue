<template>
  <div
    class="rounded-2xl border border-[#242A33] bg-[#161A20]"
    role="grid"
    tabindex="0"
    @keydown="onKey"
  >
    <!-- ヘッダ -->
    <div
      class="sticky top-0 z-10 grid border-b border-[#242A33] bg-[#161A20] text-xs text-gray-400"
      :style="{ gridTemplateColumns: colTemplate }"
      role="row"
    >
      <div
        v-for="c in columns"
        :key="c.key"
        class="px-3 py-2"
        role="columnheader"
        :aria-sort="sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
      >
        {{ c.label }}
      </div>
    </div>

    <!-- ビューポート -->
    <div
      ref="viewport"
      class="relative overflow-auto"
      :style="{ height: vh + 'px' }"
      @scroll="onScroll"
    >
      <!-- 全体高（スクロール用ダミー） -->
      <div :style="{ height: totalHeight + 'px' }"></div>

      <!-- 可視領域：必ず前面へ -->
      <div
        class="absolute left-0 right-0 top-0 z-10"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(row, i) in visibleRows"
          :key="row[keyField] ?? i"
          class="grid items-center text-sm text-gray-200 hover:bg-white/5"
          :style="{ gridTemplateColumns: colTemplate, height: rowH + 'px' }"
          role="row"
          :aria-selected="start + i === active"
          data-row
        >
          <div v-for="c in columns" :key="c.key" class="px-3">
            <component
              :is="c.render ?? 'span'"
              :row="row"
              :col="c"
              :value="row[c.key]"
              :index="start + i"
            >
              {{ row[c.key] }}
            </component>
          </div>
        </div>
      </div>
    </div>

    <!-- フッタ -->
    <div class="border-t border-[#242A33] px-3 py-2 text-xs text-gray-400">
      表示: {{ rows.length }} 件
    </div>
  </div>
</template>

<script setup lang="ts">
type Col = { key: string; label: string; width?: string; render?: any };

const props = defineProps<{
  rows: any[];
  columns: Col[];
  rowHeight?: number;
  height?: number;
  keyField?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
}>();

const rowH = computed(() => {
  const n = Number(props.rowHeight ?? 44);
  return Number.isFinite(n) && n > 0 ? n : 44;
});
const vh = computed(() => {
  const n = Number(props.height ?? 480);
  return Number.isFinite(n) && n > 0 ? n : 480;
});
const keyField = computed(() => props.keyField ?? 'name');
const sortKey = computed(() => props.sortKey ?? '');
const sortDir = computed(() => props.sortDir ?? 'desc');

const viewport = ref<HTMLElement | null>(null);
const start = ref(0);
const end = ref(0);
const buffer = 6;
const active = ref(0);

const colTemplate = computed(() => (props.columns ?? []).map((c) => c.width ?? '1fr').join(' '));

const totalHeight = computed(() => (props.rows?.length ?? 0) * rowH.value);
const page = computed(() => Math.ceil(vh.value / rowH.value));

const clamp = (): void => {
  const v = viewport.value;
  const len = props.rows?.length ?? 0;
  if (!v || !len) {
    start.value = 0;
    end.value = 0;
    return;
  }
  const s = Math.floor((v.scrollTop || 0) / rowH.value);
  start.value = Math.max(0, s - buffer);
  end.value = Math.min(len, s + page.value + buffer);
};

const reset = (): void => {
  if (viewport.value) viewport.value.scrollTop = 0;
  start.value = 0;
  end.value = Math.min(props.rows?.length ?? 0, page.value + buffer);
};

const onScroll = (): void => clamp();

onMounted(() => {
  reset();
  nextTick(() => clamp());
  window.addEventListener('resize', clamp);
});
onBeforeUnmount(() => window.removeEventListener('resize', clamp));

watch(
  () => props.rows,
  () => {
    reset();
    nextTick(() => clamp());
  },
  { deep: false }
);

watch([rowH, vh], () => nextTick(() => clamp()));

const offsetY = computed(() => start.value * rowH.value);
const visibleRows = computed(() => props.rows?.slice(start.value, end.value) ?? []);

defineExpose({ getVisible: () => visibleRows.value, reset });

const emit = defineEmits<{ (e: 'enter', row: any): void }>();
const scrollToActive = (): void => {
  const v = viewport.value;
  if (!v) return;
  const top = active.value * rowH.value;
  if (top < v.scrollTop) v.scrollTop = top;
  else if (top + rowH.value > v.scrollTop + vh.value) v.scrollTop = top - vh.value + rowH.value;
  clamp();
};
const onKey = (e: KeyboardEvent): void => {
  if (e.key === 'ArrowDown') {
    active.value = Math.min((props.rows?.length ?? 0) - 1, active.value + 1);
    scrollToActive();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    active.value = Math.max(0, active.value - 1);
    scrollToActive();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    const row = props.rows?.[active.value];
    if (row) emit('enter', row);
  }
};
</script>
