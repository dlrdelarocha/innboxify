import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginWithGoogle, logout as firebaseLogout, onAuthChange } from '../services/firebase.js'

const TOKEN_KEY = 'gmail_access_token'
const TIMEOUT_MS = 3000 // 3 segundos máximo para resolver

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const loading = ref(true)
  const error = ref(null)

  let _resolveReady
  const ready = new Promise(resolve => { _resolveReady = resolve })

  function init() {
    try {
      console.log('🔐 Inicializando autenticación...')

      // Restaura token de sesión si existe
      const savedToken = sessionStorage.getItem(TOKEN_KEY)
      if (savedToken) {
        console.log('ℹ️ Token de sesión anterior encontrado')
        accessToken.value = savedToken
      }

      // Escucha cambios de estado de autenticación
      let authStateResolved = false
      const unsubscribe = onAuthChange((firebaseUser) => {
        console.log('🔄 Estado de autenticación:', firebaseUser ? '✅ Autenticado' : '⚫ Sin autenticar')

        user.value = firebaseUser

        if (firebaseUser) {
          console.log('👤 Usuario:', firebaseUser.email)
        } else {
          accessToken.value = null
          sessionStorage.removeItem(TOKEN_KEY)
        }

        if (!authStateResolved) {
          authStateResolved = true
          loading.value = false
          _resolveReady()
          console.log('✅ Auth completado')
        }
      })

      // Timeout de seguridad - si después de 3 segundos no se resolvió, hazlo de todas formas
      const timeout = setTimeout(() => {
        if (!authStateResolved) {
          console.warn('⚠️ Timeout en auth state - resolviendo de todas formas')
          authStateResolved = true
          loading.value = false
          _resolveReady()
        }
      }, TIMEOUT_MS)

      // Cleanup
      return () => {
        clearTimeout(timeout)
        unsubscribe?.()
      }
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
      console.log('🔐 Iniciando login con Google...')
      const result = await loginWithGoogle()

      console.log('🔄 Popup cerrado - esperando a que Firebase procese...')

      // Guardar token si está disponible
      if (result?.accessToken) {
        console.log('💾 Guardando token de acceso...')
        sessionStorage.setItem(TOKEN_KEY, result.accessToken)
        accessToken.value = result.accessToken
      }

      // Asignar user inmediatamente si está disponible
      if (result?.user) {
        user.value = result.user
        console.log('👤 Usuario asignado:', result.user.email)
      }

      // El estado completo se asignará vía onAuthChange
      console.log('✅ Popup procesado')
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
