import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

export default defineNuxtConfig({
  compatibilityDate: '2024-07-11',

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },

  ssr: false,

  hooks: {
    'nitro:config': (nitroConfig) => {
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      }
    }
  }
})
