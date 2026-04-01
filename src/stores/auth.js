import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginWithGoogle, logout as firebaseLogout, onAuthChange } from '../services/firebase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const loading = ref(true)

  let _resolveReady
  const ready = new Promise(resolve => { _resolveReady = resolve })

  function init() {
    const savedToken = sessionStorage.getItem('gmail_access_token')
    if (savedToken) accessToken.value = savedToken

    onAuthChange((firebaseUser) => {
      user.value = firebaseUser
      if (!firebaseUser) {
        accessToken.value = null
        sessionStorage.removeItem('gmail_access_token')
      }
      loading.value = false
      _resolveReady()
    })
  }

  async function login() {
    const result = await loginWithGoogle()
    user.value = result.user
    accessToken.value = result.accessToken
    sessionStorage.setItem('gmail_access_token', result.accessToken)
  }

  async function logout() {
    await firebaseLogout()
    user.value = null
    accessToken.value = null
    sessionStorage.removeItem('gmail_access_token')
  }

  return { user, accessToken, loading, ready, init, login, logout }
})
