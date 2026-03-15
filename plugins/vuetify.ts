import { defineNuxtPlugin } from 'nuxt/app'

import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { useThemeStore } from '~/stores/themeStore'

import 'vuetify/styles'

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F7F8FC',
    surface: '#FFFFFF',
    primary: '#2c3e50',
    'on-primary': '#FFFFFF',
    secondary: '#34495e',
    'on-secondary': '#FFFFFF',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#4a90e2',
    'on-primary': '#FFFFFF',
    secondary: '#5a768f',
    'on-secondary': '#FFFFFF',
    error: '#CF6679',
    info: '#2196F3',
    success: '#66BB6A',
    warning: '#FFA726',
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
    },
    defaults: {
      VCard: {
        elevation: 0,
        border: 'lg',
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

  // Syncing the Vuetify theme with the Pinia store
  nuxtApp.hook('app:mounted', () => {
    const themeStore = useThemeStore()
    watch(
      () => themeStore.currentTheme,
      (newTheme) => {
        vuetify.theme.change(newTheme)
      },
      { immediate: true }
    )
  })
})
