// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@primevue/nuxt-module', 'nuxt-gtag'],
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },

  gtag: {
    id: 'G-DYXDM94GJP',
  },

  ssr: true,

  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  }

})