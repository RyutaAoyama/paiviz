<template>
  <section ref="wrap" class="space-y-4">
    <h1 class="text-2xl font-bold">比較</h1>

    <div class="relative overflow-hidden">
      <div class="flex transition-transform duration-300 ease-out" :style="{ transform: `translateX(${offset}%)` }">
        <!-- A -->
        <div class="w-full shrink-0 pr-2">
          <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
            <h2 class="mb-2 font-semibold">A</h2>
            <slot name="A">
              <div class="text-sm text-gray-400">プレイヤーA（モック）</div>
            </slot>
          </div>
        </div>
        <!-- B -->
        <div class="w-full shrink-0 pl-2">
          <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
            <h2 class="mb-2 font-semibold">B</h2>
            <slot name="B">
              <div class="text-sm text-gray-400">プレイヤーB（モック）</div>
            </slot>
          </div>
        </div>
      </div>

      <!-- ヒント -->
      <div class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/40 px-2 py-1 text-xs text-gray-200">
        Alt+S で入替 / スワイプで切替
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="swap">A↔B 入替</button>
      <div class="text-xs text-gray-400">現在: {{ active === 0 ? 'A' : 'B' }} を表示中</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const wrap = ref<HTMLElement|null>(null)
const active = ref(0) // 0:A 1:B
const offset = computed(() => active.value === 0 ? 0 : -100)

useHead({
  title: '比較 — Paiviz',
  meta: [
    { property: 'og:title', content: 'Paiviz 比較' },
    { property: 'og:description', content: 'プレイヤーAとBを並べて比較' }
  ]
})

const swap = (): void => {
  const q = { ...route.query }
  const a = q.a as string | undefined
  q.a = q.b
  q.b = a
  router.replace({ query: q })
}
const toggle = (): void => { active.value = active.value ? 0 : 1 }

// Alt+S
onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); swap() }
    if (e.key === 'ArrowLeft') { active.value = 0 }
    if (e.key === 'ArrowRight') { active.value = 1 }
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})

// スワイプ（簡易）
let x0 = 0, y0 = 0, act = false
const down = (e: PointerEvent): void => { x0=e.clientX; y0=e.clientY; act=true }
const up = (e: PointerEvent): void => {
  if (!act) return
  const dx = e.clientX - x0, dy = e.clientY - y0
  act=false
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) toggle()
}
onMounted(() => {
  const el = wrap.value; if (!el) return
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointerup', up)
})
onBeforeUnmount(() => {
  const el = wrap.value; if (!el) return
  el.removeEventListener('pointerdown', down)
  el.removeEventListener('pointerup', up)
})
</script>

