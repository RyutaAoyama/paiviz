<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="close" />
      <div
        class="absolute inset-x-0 bottom-0 rounded-t-2xl border border-[#242A33] bg-[#0F1115] p-4 shadow-2xl md:left-auto md:inset-y-0 md:right-0 md:w-[420px] md:rounded-l-2xl md:rounded-tr-none"
      >
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold">詳細フィルタ</h3>
          <button
            class="rounded-md border border-[#242A33] px-2 py-1 text-sm"
            @click="close"
          >
            閉じる
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <div class="mb-1 text-xs text-muted">期間</div>
            <DateRangePicker @update="onUpdate" />
            <div class="mt-2 flex gap-2 justify-end">
              <button
                class="rounded-lg border border-[#242A33] px-3 py-1 text-sm hover:text-text"
                @click="apply"
              >
                適用
              </button>
              <button
                class="rounded-lg border border-[#242A33] px-3 py-1 text-sm hover:text-text"
                @click="reset"
              >
                リセット
              </button>
            </div>
          </div>

          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="fav" />
            ★ お気に入りのみ
          </label>

          <div class="flex gap-2">
            <button
              class="rounded-lg border border-[#242A33] px-3 py-2 text-sm hover:text-text"
              @click="$emit('exportCsv')"
            >
              CSVエクスポート
            </button>
            <button
              class="rounded-lg border border-[#242A33] px-3 py-2 text-sm hover:text-text"
              @click="$emit('share')"
            >
              共有リンクをコピー
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; favOnly?: boolean }>();
const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (e: "update:favOnly", v: boolean): void;
  (e: "range", p: { mode: string; from: string; to: string }): void;
  (e: "exportCsv"): void;
  (e: "share"): void;
}>();

const range = ref({ mode: "this", from: "", to: "" });

function close() {
  emit("update:open", false);
}
function onUpdate(p: { mode: string; from: string; to: string }) {
  range.value = p;
}
function apply() {
  emit("range", range.value);
}
function reset() {
  range.value = { mode: "this", from: "", to: "" };
  emit("range", range.value);
}

const fav = computed({
  get: () => !!props.favOnly,
  set: (v: boolean) => emit("update:favOnly", v),
});
</script>
