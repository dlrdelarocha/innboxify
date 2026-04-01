import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginWithGoogle, logout as firebaseLogout, onAuthChange, getRedirectResultIfExists } from '../services/firebase.js'

const TOKEN_KEY = 'gmail_access_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const loading = ref(true)
  const error = ref(null)

  let _resolveReady
  const ready = new Promise(resolve => { _resolveReady = resolve })

  async function init() {
    try {
      // Restaura token de sesión si existe
      const savedToken = sessionStorage.getItem(TOKEN_KEY)
      if (savedToken) {
        console.log('ℹ️ Token de sesión anterior encontrado')
        accessToken.value = savedToken
      }

      // Chequea si viene de un redirect OAuth
      try {
        const redirectResult = await getRedirectResultIfExists()
        if (redirectResult) {
          console.log('✅ Autenticación exitosa desde redirect')
          user.value = redirectResult.user
          accessToken.value = redirectResult.accessToken

          if (redirectResult.accessToken) {
            sessionStorage.setItem(TOKEN_KEY, redirectResult.accessToken)
          } else {
            console.warn('⚠️ No hay token de acceso disponible')
          }
        }
      } catch (redirectError) {
        console.error('Error procesando redirect:', redirectError)
        error.value = redirectError.message
      }

      // Escucha cambios de estado de autenticación
      onAuthChange((firebaseUser) => {
        console.log('🔄 Estado de autenticación cambió:', firebaseUser ? 'Autenticado' : 'Sin autenticar')
        user.value = firebaseUser

        if (!firebaseUser) {
          accessToken.value = null
          sessionStorage.removeItem(TOKEN_KEY)
        }

        loading.value = false
        _resolveReady()
      })
    } catch (initError) {
      console.error('❌ Error inicializando autenticación:', initError)
      error.value = initError.message
      loading.value = false
      _resolveReady()
    }
  }

  async function login() {
    try {
      error.value = null
      await loginWithGoogle()
      // No esperes resultado aquí - Firebase redirige y vuelve
    } catch (loginError) {
      console.error('❌ Error en login:', loginError)
      error.value = loginError.message
      throw loginError
    }
  }

  async function logout() {
    try {
      error.value = null
      await firebaseLogout()
      user.value = null
      accessToken.value = null
      sessionStorage.removeItem(TOKEN_KEY)
      console.log('✅ Sesión cerrada correctamente')
    } catch (logoutError) {
      console.error('❌ Error en logout:', logoutError)
      error.value = logoutError.message
      throw logoutError
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    accessToken,
    loading,
    error,
    ready,
    init,
    login,
    logout,
    clearError
  }
})
