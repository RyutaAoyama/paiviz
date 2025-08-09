<template>
  <div class="relative">
    <input
      :value="modelValue"
      class="w-full rounded-xl bg-[#161A20] px-3 py-2 ring-1 ring-border focus:ring-2 focus:ring-[rgba(20,184,166,.35)]"
      :placeholder="placeholder"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
    />
    <div
      v-if="open && suggestions.length"
      class="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface p-2 text-sm shadow-card"
    >
      <div class="mb-1 text-xs text-muted">候補（お気に入り/最近）</div>
      <ul>
        <li
          v-for="n in suggestions"
          :key="n"
          class="cursor-pointer rounded px-2 py-1 hover:bg-[#11151b]"
          @mousedown.prevent="pick(n)"
        >
          {{ n }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: string; placeholder?: string }>(), {
  modelValue: '',
  placeholder: '',
});
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();
const open = ref(false);
const { list: favs } = useFavorites();
const { recent: recents } = useRecent();
const q = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => {
    q.value = v;
  }
);

const suggestions = computed(() => {
  const s = [...new Set([...favs.value, ...recents.value])];
  if (!q.value.trim()) return s.slice(0, 10);
  const lower = q.value.toLowerCase();
  return s.filter((n) => n.toLowerCase().includes(lower)).slice(0, 10);
});
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  q.value = v;
  emit('update:modelValue', v);
}
function onBlur() {
  window.setTimeout(() => (open.value = false), 120);
}
function pick(n: string) {
  emit('update:modelValue', n);
  open.value = false;
}
</script>
