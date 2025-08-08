import type { Config } from 'tailwindcss'

export default <Partial<Config>>({
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './assets/**/*.{css,vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        jade: 'var(--jade)',
        plum: 'var(--plum)'
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      boxShadow: { card: 'var(--inner-1), var(--stroke-1)' },
      fontFamily: { sans: ['Inter', 'Noto Sans JP', 'ui-sans-serif', 'system-ui'] }
    }
  },
  plugins: []
})
