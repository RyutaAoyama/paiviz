<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">About Paiviz</h1>
    <p class="text-sm text-gray-300">
      Paiviz（パイビズ）は、ネット麻雀「天鳳」の公開情報をもとに、成績を見やすく可視化する非公式ビューアです。
    </p>
    <ul class="list-disc space-y-2 pl-5 text-sm text-gray-400">
      <li>牌譜の一括取得・再配布は行いません。</li>
      <li>
        対局の閲覧は
        <a href="https://tenhou.net/" class="text-teal-400" target="_blank" rel="noopener"
          >tenhou.net</a
        >
        の公式リプレイにリンクします。
      </li>
      <li>ログ解析（Labs）はブラウザ内で完結し、デフォルトでサーバー保存しません。</li>
    </ul>
    <p class="text-sm text-gray-400">
      ご連絡先:
      <a href="mailto:support@paiviz.app" class="text-teal-400">support@paiviz.app</a>
    </p>
  </section>
</template>

<script setup lang="ts">
const url = useRequestURL();
useHead(() => {
  const canonical = url.origin + url.pathname;
  const ttl = 'About — Paiviz';
  const img = `/api/og?title=${encodeURIComponent('About')}&badge=Paiviz&theme=teal`;
  return {
    title: ttl,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { property: 'og:title', content: ttl },
      { property: 'og:image', content: img },
      { name: 'twitter:title', content: ttl },
      { name: 'twitter:image', content: img },
    ],
  };
});
</script>
