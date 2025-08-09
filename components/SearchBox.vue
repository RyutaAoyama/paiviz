<template>
  <div class="relative">
    <input
      ref="inputEl"
      v-model="q"
      aria-label="プレイヤー名またはIDを検索"
      class="focus-ring w-full rounded-xl bg-[#161A20] px-4 py-2 outline-none ring-1 ring-[#242A33]"
      placeholder="プレイヤー名/IDを検索"
    />
    <div
      v-if="open"
      class="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-[#242A33] bg-[#0F1115]"
    >
      <button
        v-for="(s, i) in suggestions"
        :key="s.name"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
        :class="i === idx ? 'bg-white/5' : ''"
        @click="select(i)"
      >
        <span>{{ s.name }}</span>
        <span class="text-xs text-gray-500">候補</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSuggest } from '~/utils/api';

const q = ref('');
const open = ref(false);
const idx = ref(-1);
const suggestions = ref<{ name: string }[]>([]);
const inputEl = ref<HTMLInputElement | null>(null);
let t: any;

const fetchSuggest = async (): Promise<void> => {
  try {
    suggestions.value = await getSuggest(q.value, 8);
    open.value = suggestions.value.length > 0;
    idx.value = suggestions.value.length ? 0 : -1;
  } catch {
    open.value = false;
    suggestions.value = [];
  }
};
watch(q, (v) => {
  clearTimeout(t);
  if (!v || v.length < 2) {
    open.value = false;
    suggestions.value = [];
    return;
  }
  t = setTimeout(fetchSuggest, 150);
});
const onKey = (e: KeyboardEvent): void => {
  if ((e.key === '/' || e.key === 'Divide') && document.activeElement !== inputEl.value) {
    e.preventDefault();
    inputEl.value?.focus();
    return;
  }
  if (!open.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    idx.value = (idx.value + 1) % suggestions.value.length;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx.value = (idx.value - 1 + suggestions.value.length) % suggestions.value.length;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    select(idx.value);
  }
  if (e.key === 'Escape') open.value = false;
};
const select = (i: number): void => {
  const item = suggestions.value[i];
  if (!item) return;
  navigateTo(`/player/${encodeURIComponent(item.name)}`);
  open.value = false;
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>
