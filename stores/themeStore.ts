import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  // When initialization, trying to load the theme from localStorage
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      currentTheme.value = savedTheme
    } else {
      // If there is nothing in localStorage, check the system preferences
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
  })

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  // Monitor changes and save them in localStorage
  watch(currentTheme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
  })

  return {
    currentTheme,
    toggleTheme,
  }
})
