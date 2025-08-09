<template>
  <div class="no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2 py-1">
    <!-- Period presets -->
    <div class="flex gap-2">
      <button
        v-for="p in periodPresets"
        :key="p.value"
        class="chip"
        :class="{ 'chip--active': model.mode === p.value }"
        @click="set('mode', p.value)"
      >
        >{{ p.label }}
      </button>
      <button class="chip" @click="openDrawer">詳細</button>
    </div>

    <div class="mx-2 h-5 w-px self-center bg-[#242A33]" />

    <!-- Table type -->
    <div class="flex gap-2">
      <button
        v-for="t in tables"
        :key="t"
        class="chip"
        :class="{ 'chip--active': model.tableType === t }"
        @click="set('tableType', t)"
      >
        {{ t }}
      </button>
    </div>

    <div class="mx-2 h-5 w-px self-center bg-[#242A33]" />

    <!-- Rule -->
    <div class="flex gap-2">
      <button
        v-for="r in rules"
        :key="r"
        class="chip"
        :class="{ 'chip--active': model.rule === r }"
        @click="set('rule', r)"
      >
        {{ r }}
      </button>
    </div>

    <div class="mx-2 h-5 w-px self-center bg-[#242A33]" />

    <!-- Sort -->
    <div class="flex gap-2">
      <button
        v-for="s in sorts"
        :key="s.value"
        class="chip"
        :class="{ 'chip--active': model.sortKey === s.value }"
        @click="set('sortKey', s.value)"
      >
        {{ s.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type Model = {
  mode: "this" | "prev" | "last30d" | "last90d" | "custom";
  tableType: Table;
  rule: Rule;
  sortKey: "rate" | "games" | "name" | "rank";
};

const props = defineProps<{ modelValue: Model }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: Model): void;
  (e: "openDrawer"): void;
}>();
const model = reactive({ ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => Object.assign(model, v)
);
watch(model, (v) => emit("update:modelValue", { ...v }), { deep: true });

/** 型が文字列Unionのまま保たれるように as const / satisfies を使用 */
const periodPresets = [
  { value: "this", label: "今月" },
  { value: "prev", label: "先月" },
  { value: "last30d", label: "30日" },
  { value: "last90d", label: "90日" },
  { value: "custom", label: "カスタム" },
] as const satisfies ReadonlyArray<{ value: Model["mode"]; label: string }>;

const tables = ["一般", "上", "特上", "鳳凰"] as const;
type Table = (typeof tables)[number];

const rules = ["東南", "東"] as const;
type Rule = (typeof rules)[number];

const sorts = [
  { value: "rank", label: "#（順位）" },
  { value: "rate", label: "Rate" },
  { value: "games", label: "対局数" },
  { value: "name", label: "名前" },
] as const satisfies ReadonlyArray<{ value: Model["sortKey"]; label: string }>;

function set<K extends keyof Model>(k: K, v: Model[K]) {
  (model as any)[k] = v;
}
function openDrawer() {
  emit("openDrawer");
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.chip {
  @apply rounded-full border border-[#242A33] px-3 py-1 text-sm text-gray-300 hover:text-gray-100 whitespace-nowrap;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(0, 0, 0, 0.08)
  );
}
.chip--active {
  @apply border-teal-600 text-teal-300;
  box-shadow: 0 0 0 1px rgba(45, 212, 191, 0.35) inset;
}
</style>
