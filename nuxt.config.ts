// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'expense-tracker-color-mode',
    dataValue: 'theme',
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/login', '/register', '/forgot-password', '/reset-password', '/auth/*'],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

  ssr: false,
  
  nitro: {
    preset: 'static',
  },

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
