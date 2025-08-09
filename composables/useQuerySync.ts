import { useRoute, useRouter } from 'vue-router';
import { watch, toValue } from 'vue';

type Schema = Record<string, any>;

/**
 * Sync a reactive state object to URL query and back.
 * - values are stringified
 * - null/undefined keys are removed from query
 */
export function useQuerySync<T extends Schema>(state: T, keys: (keyof T)[]) {
  const route = useRoute();
  const router = useRouter();

  // init from query once
  for (const k of keys) {
    const qv = route.query[k as string];
    if (qv != null) {
      // @ts-expect-error: accept string or string[] and take last value
      const v = Array.isArray(qv) ? qv[qv.length - 1] : qv;
      if (typeof state[k] === 'number') {
        // @ts-expect-error: coerce query string into number when target is number-like
        const num = Number(v);
        // @ts-expect-error: assign parsed number to state with loose typing
        if (!Number.isNaN(num)) state[k] = num as any;
      } else if (typeof state[k] === 'boolean') {
        // @ts-expect-error: coerce query string into boolean when target is boolean-like
        state[k] = (v === '1' || v === 'true') as any;
      } else {
        // @ts-expect-error: coerce query value into string for string-like target
        state[k] = String(v) as any;
      }
    }
  }

  // watch and push to query (replace to avoid history spam)
  watch(
    keys.map((k) => () => toValue(state[k])),
    async () => {
      const q: Record<string, string> = { ...(route.query as any) };
      for (const k of keys) {
        const v = toValue(state[k]);
        const key = k as string;
        if (v === null || v === undefined || v === '') delete q[key];
        else q[key] = String(v);
      }
      router.replace({ query: q });
    },
    { deep: true }
  );
}
