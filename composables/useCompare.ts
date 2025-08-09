import { getPlayerStats, type PlayerStats } from '~/utils/kpi';

/** 比較ページ用のKPI取得と状態管理 */
export const useCompare = () => {
  const route = useRoute();
  const aName = computed(() => String(route.query.a || ''));
  const bName = computed(() => String(route.query.b || ''));
  const a = ref<PlayerStats | null>(null);
  const b = ref<PlayerStats | null>(null);
  const loading = ref(false);
  const errored = ref(false);

  const load = async (): Promise<void> => {
    loading.value = true;
    errored.value = false;
    try {
      const [sa, sb] = await Promise.all([
        getPlayerStats(aName.value),
        getPlayerStats(bName.value),
      ]);
      a.value = sa;
      b.value = sb;
    } catch {
      errored.value = true;
      a.value = null;
      b.value = null;
    } finally {
      loading.value = false;
    }
  };

  watch([aName, bName], load, { immediate: true });

  return { aName, bName, a, b, loading, errored, reload: load };
};
