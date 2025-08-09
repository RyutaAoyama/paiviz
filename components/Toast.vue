<template>
  <div class="fixed bottom-4 left-1/2 z-[999] -translate-x-1/2 space-y-2">
    <div
      v-for="t in list"
      :key="t.id"
      class="rounded-lg bg-[#11161e] px-4 py-2 text-sm text-gray-200 shadow-lg ring-1 ring-[#242A33]"
    >
      {{ t.message }}
    </div>
  </div>
</template>
<script setup lang="ts">
const { list } = useToast();
</script>
