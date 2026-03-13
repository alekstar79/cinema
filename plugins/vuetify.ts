import { defineNuxtPlugin } from 'nuxt/app'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1976D2',
            secondary: '#FF4081',
            accent: '#82B1FF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#2196F3',
            secondary: '#FF4081',
            accent: '#FF4081',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
          },
        },
      },
    },
    defaults: {
      VCard: {
        elevation: 2,
        rounded: 'lg',
      },
      VBtn: {
        rounded: 'pill',
        elevation: 0,
      },
      VChip: {
        rounded: 'pill',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        bgColor: 'surface',
        rounded: 'lg',
        hideDetails: 'auto',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        bgColor: 'surface',
        rounded: 'lg',
        hideDetails: 'auto',
        menuProps: {
          contentClass: 'custom-select-menu'
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
