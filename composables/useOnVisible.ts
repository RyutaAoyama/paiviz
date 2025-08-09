import { onMounted, onBeforeUnmount } from 'vue';

export function useOnVisible(
  elRef: { value: Element | null },
  cb: () => void,
  options?: IntersectionObserverInit
) {
  let observer: IntersectionObserver | null = null;
  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            cb();
            // one-shot
            observer?.disconnect();
            observer = null;
            break;
          }
        }
      },
      options ?? { rootMargin: '100px' }
    );
    if (elRef.value) observer.observe(elRef.value);
  });
  onBeforeUnmount(() => observer?.disconnect());
}
