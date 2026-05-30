import { defineStore } from 'pinia'

const KEY = 'siiiweb-theme'
const themes = ['dark', 'blue', 'green']

function smartTheme() {
  const hour = new Date().getHours()
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  if (prefersDark || hour >= 18 || hour < 6) return 'dark'
  return hour < 12 ? 'blue' : 'green'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: localStorage.getItem(KEY) || smartTheme() }),
  actions: {
    apply(theme = this.theme, persist = false) {
      this.theme = themes.includes(theme) ? theme : 'dark'
      document.documentElement.dataset.theme = this.theme
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', this.theme === 'dark' ? '#1a1a2e' : this.theme === 'blue' ? '#f0f8ff' : '#f0faf5')
      if (persist) localStorage.setItem(KEY, this.theme)
    },
  },
})
