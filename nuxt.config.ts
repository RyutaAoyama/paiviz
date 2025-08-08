export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
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
    },
  },
  nitro: {
    prerender: {
      routes: ["/", "/rankings", "/about", "/privacy", "/labs/upload"],
      // 当面の保険。原因が潰れたら外してOK
      failOnError: false,
    },
  },
});
