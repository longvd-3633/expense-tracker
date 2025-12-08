// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
  ],

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/login', '/register', '/forgot-password', '/reset-password', '/auth/*'],
    },
  },

  components: [
    {
      path: '~/components/atoms',
      pathPrefix: false,
      global: true,
    },
    {
      path: '~/components/molecules',
      pathPrefix: false,
      global: true,
    },
    {
      path: '~/components/organisms',
      pathPrefix: false,
      global: true,
    },
  ],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  ssr: true,

  vite: {
    optimizeDeps: {
      include: ['date-fns', 'chart.js', 'papaparse', 'zod']
    },
    resolve: {
      alias: {
        '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
      },
    },
  },

  app: {
    head: {
      title: 'Expense Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track your income and expenses easily' },
      ],
    },
  },
})
