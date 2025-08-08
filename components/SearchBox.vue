<template>
  <div class="relative">
    <input
      v-model="q"
      class="w-full rounded-xl bg-[#161A20] px-4 py-2 outline-none ring-1 ring-[#242A33]"
      placeholder="プレイヤー名/IDを検索"
      @keydown.enter="go"
      @focus="open = true"
      @blur="onBlur"
    />
    <div
      v-if="open && suggestions.length"
      class="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface p-2 text-sm shadow-card"
    >
      <div class="mb-1 text-xs text-muted">候補</div>
      <ul>
        <li
          v-for="n in suggestions"
          :key="n"
          class="cursor-pointer rounded px-2 py-1 hover:bg-[#11151b]"
          @mousedown.prevent="select(n)"
        >
          {{ n }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const q = ref("");
const open = ref(false);
const { favs } = useFavorites();
const { recents } = useRecent();

const suggestions = computed(() => {
  const s = [...new Set([...favs.value, ...recents.value])];
  if (!q.value.trim()) return s.slice(0, 8);
  const lower = q.value.toLowerCase();
  return s.filter((n) => n.toLowerCase().includes(lower)).slice(0, 10);
});

function onBlur() {
  // blur直後のクリック（候補選択）を拾うため、少し遅らせて閉じる
  window.setTimeout(() => {
    open.value = false;
  }, 120);
}

function go() {
  if (q.value.trim())
    navigateTo(`/player/${encodeURIComponent(q.value.trim())}`);
}

function select(n: string) {
  navigateTo(`/player/${encodeURIComponent(n)}`);
  open.value = false;
}
</script>
