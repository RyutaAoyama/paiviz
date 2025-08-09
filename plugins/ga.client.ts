import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.GA_ID;
  if (!id) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  // @ts-expect-error: GA snippet uses global dataLayer on window
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
});
