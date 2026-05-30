import { defineStore } from 'pinia'
import { authApi } from '../api/modules'

const TOKEN_KEY = 'siiiweb-token'
const USER_KEY = 'siiiweb-user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  }),
  getters: { isLogin: (state) => Boolean(state.token) },
  actions: {
    async login(payload) {
      const data = await authApi.login(payload)
      this.token = data.token
      this.user = data.user || { username: payload.username }
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
