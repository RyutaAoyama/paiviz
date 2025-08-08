export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/base.css", "~/assets/css/motion.css"],
  runtimeConfig: {
    public: {
      GA_ID: process.env.NUXT_PUBLIC_GA_ID || "",
      ADSENSE_CLIENT: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || "",
    },
  },
  app: {
    head: {
      title: "Paiviz — 天鳳成績ビューア",
      meta: [
        { name: "viewport", content: "width=device-width,initial-scale=1" },
        {
          name: "description",
          content: "天鳳の成績を見やすく可視化するビューア",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+JP:wght@400;700&display=swap",
        },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ["/", "/rankings", "/about", "/privacy", "/labs/upload"],
      failOnError: false,
    },
  },
});
