<template>
  <span
    v-if="!Number.isNaN(delta)"
    class="ml-2 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs"
    :class="delta > 0 ? 'text-[var(--jade)]' : delta < 0 ? 'text-[var(--warn)]' : 'text-muted'"
  >
    <span v-if="prefix">{{ prefix }}</span>
    <span>{{ signed }}</span>
  </span>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
  delta: number
  percent?: boolean
  reverse?: boolean   // trueなら符号を反転（平均順位など）
  prefix?: string
}>(), { percent: true, reverse: false, prefix: '' })

const signed = computed(() => {
  const v = props.reverse ? -props.delta : props.delta
  const n = props.percent ? (v * 100) : v
  const str = (n >= 0 ? '+' : '') + (props.percent ? n.toFixed(1) + '%' : n.toFixed(2))
  return str
})
</script>
