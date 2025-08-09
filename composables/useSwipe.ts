import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";

export function useSwipe(
  target: Ref<HTMLElement | null> | HTMLElement,
  opts: { onSwipeLeft?: () => void; onSwipeRight?: () => void; threshold?: number } = {}
) {
  const elRef = ref(target as any);
  const threshold = opts.threshold ?? 50;
  let startX = 0;
  let startY = 0;

  function onDown(e: PointerEvent) {
    startX = e.clientX;
    startY = e.clientY;
  }
  function onUp(e: PointerEvent) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx < 0) opts.onSwipeLeft?.();
      else opts.onSwipeRight?.();
    }
  }

  onMounted(() => {
    const el = elRef.value instanceof HTMLElement ? elRef.value : elRef.value?.value;
    if (!el) return;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
  });
  onBeforeUnmount(() => {
    const el = elRef.value instanceof HTMLElement ? elRef.value : elRef.value?.value;
    if (!el) return;
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointerup", onUp);
  });
}
