<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[1000] flex flex-col gap-2">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto select-none rounded-xl border border-[#2a3340] bg-[#0f141b]/95 px-4 py-2 text-sm shadow-lg backdrop-blur"
        :class="{
          'text-jade': t.type==='success',
          'text-orange-300': t.type==='warn',
          'text-red-300': t.type==='error',
          'text-gray-200': !t.type || t.type==='info'
        }"
      >
        {{ t.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .18s ease; }
.toast-enter-from { opacity: 0; transform: translateY(8px) scale(.98); }
.toast-leave-to { opacity: 0; transform: translateY(8px) scale(.98); }
</style>
