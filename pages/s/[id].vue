<script setup lang="ts">
import { getSnapshot } from '~/utils/api';

// SnapshotKind is inferred from payload; explicit type alias removed

const route = useRoute();
const id = route.params.id as string;

useHead({
  title: `共有リンク — Paiviz`,
  meta: [{ property: 'og:title', content: 'Paiviz 共有スナップショット' }],
});

onMounted(async () => {
  try {
    const js = await getSnapshot(id);
    const kind = typeof js?.kind === 'string' ? js.kind : '';
    const data =
      js && typeof js === 'object' && js.data && typeof js.data === 'object'
        ? (js.data as Record<string, any>)
        : {};

    let to = '/';
    if (kind === 'rankings') {
      const q = new URLSearchParams({
        mode: String(data.mode ?? ''),
        from: String(data.from ?? ''),
        to: String(data.to ?? ''),
        tableType: String(data.tableType ?? ''),
        rule: String(data.rule ?? ''),
        dense: String(data.dense ?? ''),
        favOnly: String(data.favOnly ?? ''),
        sortKey: String(data.sortKey ?? ''),
        sortDir: String(data.sortDir ?? ''),
      });
      to = `/rankings?${q}`;
    } else if (kind === 'compare') {
      const q = new URLSearchParams({
        a: String(data.a ?? ''),
        b: String(data.b ?? ''),
        rwindow: String(data.rwindow ?? ''),
      });
      to = `/compare?${q}`;
    }
    navigateTo(to, { replace: true });
  } catch {
    navigateTo('/', { replace: true });
  }
});
</script>
