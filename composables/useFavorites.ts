const KEY = 'paiviz:favs';
const favs = ref<Set<string>>(new Set());

const DEFAULT = ['P-0001', 'P-0002', 'P-0003', 'P-0004', 'P-0005'];
const load = (): void => {
  try {
    const s = localStorage.getItem(KEY);
    const arr = JSON.parse(s || '[]');
    const list = Array.isArray(arr) && arr.length ? arr : DEFAULT;
    favs.value = new Set(list);
  } catch {
    favs.value = new Set(DEFAULT);
  }
};
const save = (): void => {
  if (process.client) {
    localStorage.setItem(KEY, JSON.stringify([...favs.value]));
  }
};

export const useFavorites = () => {
  if (process.client && favs.value.size === 0) load();
  const toggle = (name: string) => {
    if (favs.value.has(name)) {
      favs.value.delete(name);
    } else {
      favs.value.add(name);
    }
    save();
  };
  const has = (name: string) => favs.value.has(name);
  const list = computed(() => [...favs.value]);
  // 後方互換のために has を isFav エイリアスとしても公開
  return { list, has, isFav: has, toggle };
};
