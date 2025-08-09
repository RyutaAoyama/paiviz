<template>
  <span
    v-if="!isZero"
    class="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs tabular-nums"
    :class="toneClass"
    :title="title"
  >
    {{ sign }}{{ text }}
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    delta: number;
    percent?: boolean;
    reverse?: boolean;
  }>(),
  { percent: true, reverse: false }
);

const isZero = computed(() => Math.abs(props.delta) < 1e-9);
const sign = computed(() => (props.delta > 0 ? "+" : ""));
const tone = computed<"good" | "bad" | "neutral">(() => {
  if (isZero.value) return "neutral";
  const positiveIsGood = !props.reverse;
  const good = props.delta > 0 ? positiveIsGood : !positiveIsGood;
  return good ? "good" : "bad";
});
const toneClass = computed(() =>
  tone.value === "good"
    ? "bg-[#04261f] text-[#2dd4bf] border border-[#124c43]"
    : tone.value === "bad"
    ? "bg-[#2a1114] text-[#fda4af] border border-[#69313b]"
    : "bg-[#1f2937] text-gray-300 border border-[#374151]"
);
const text = computed(() =>
  props.percent
    ? (Math.abs(props.delta) * 100).toFixed(1) + "%"
    : Math.abs(props.delta).toFixed(2)
);
const title = computed(() => (props.reverse ? "（値が小さいほど良い）" : ""));
</script>
