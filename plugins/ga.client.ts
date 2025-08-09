import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.GA_ID;
  if (!id) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  type DLWindow = Window & { dataLayer: unknown[] };
  const w = window as DLWindow;
  // GA snippet uses global dataLayer on window
  w.dataLayer = w.dataLayer || [];
  const gtag = (...args: unknown[]): void => {
    w.dataLayer.push(args);
  };
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
});
