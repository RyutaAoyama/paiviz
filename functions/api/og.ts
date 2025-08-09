import type { PagesFunction } from './$types';

/** HTML をエスケープする */
const esc = (s: string): string => s.replace(/[&<]/g, (c) => (c === '&' ? '&amp;' : '&lt;'));

const themes: Record<string, string> = {
  teal: '#14B8A6',
  violet: '#8B5CF6',
  rose: '#F43F5E',
};

export const onRequest: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const title = esc(searchParams.get('title')?.slice(0, 120) || '');
  const subtitle = esc(searchParams.get('subtitle')?.slice(0, 160) || '');
  const badge = esc(searchParams.get('badge')?.slice(0, 40) || '');
  const theme = themes[searchParams.get('theme') || ''] || themes.teal;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="80" />
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#0F1115" />
  <g filter="url(#blur)" opacity="0.6">
    <circle cx="1050" cy="80" r="200" fill="${theme}" />
    <circle cx="200" cy="580" r="200" fill="${theme}" />
  </g>
  <rect x="60" y="60" width="1080" height="510" rx="32" fill="#161A20" />
  <text x="120" y="230" fill="#fff" font-family="'Inter','Noto Sans JP',sans-serif" font-size="72" font-weight="700">${title}</text>
  <text x="120" y="320" fill="#D1D5DB" font-family="'Inter','Noto Sans JP',sans-serif" font-size="36">${subtitle}</text>
  <g transform="translate(120,380)">
    <rect rx="20" width="260" height="64" fill="${theme}" />
    <text x="130" y="42" text-anchor="middle" fill="#fff" font-family="'Inter','Noto Sans JP',sans-serif" font-size="32" font-weight="600">${badge}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
