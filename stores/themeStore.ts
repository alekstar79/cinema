import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  // Triggered only on the client
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      currentTheme.value = savedTheme
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
  }

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  // Monitoring changes and save them in localStorage, only on the client
  if (process.client) {
    watch(currentTheme, (newTheme) => {
      localStorage.setItem('theme', newTheme)
    })

    // Initializing the theme when creating a store on the client
    initializeTheme()
  }

  return {
    currentTheme,
    toggleTheme,
    initializeTheme
  }
})
