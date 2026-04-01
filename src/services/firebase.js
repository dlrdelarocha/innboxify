import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let auth = null
let provider = null

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)

  // Set persistence to SESSION (clears on browser close - best practice)
  setPersistence(auth, browserSessionPersistence).catch(error => {
    console.warn('Could not set session persistence:', error)
  })

  const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.settings.basic'
  ]

  provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: 'consent' // Always show consent screen
  })
  GMAIL_SCOPES.forEach(scope => provider.addScope(scope))
}

export async function loginWithGoogle() {
  if (!isConfigured) throw new Error('Firebase not configured')
  try {
    console.log('🔐 Iniciando autenticación con Google...')
    console.log('📱 Redirigiendo a Google...')
    await signInWithRedirect(auth, provider)
    // Note: Page will redirect to Google, then back to app
  } catch (error) {
    console.error('❌ Error en autenticación:', error)
    console.error('Código de error:', error.code)

    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Este dominio no está autorizado en Firebase. Verifica Firebase Console.')
    }
    if (error.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('OAuth no está soportado en este navegador.')
    }

    throw error
  }
}

export async function getRedirectResultIfExists() {
  if (!auth) return null
  try {
    console.log('🔍 Verificando resultado de autenticación...')
    const result = await getRedirectResult(auth)

    if (result) {
      console.log('✅ Autenticación completada')
      const credential = GoogleAuthProvider.credentialFromResult(result)

      if (!credential?.accessToken) {
        console.warn('⚠️ Token de acceso no disponible')
      }

      return {
        user: result.user,
        accessToken: credential?.accessToken || null
      }
    }
    console.log('ℹ️ No hay sesión de autenticación en progreso')
  } catch (error) {
    console.error('❌ Error al obtener resultado de autenticación:', error)
    console.error('Código de error:', error.code)
    // Don't throw here - let auth state handle it
  }
  return null
}

export async function logout() {
  if (!auth) return
  try {
    await signOut(auth)
    console.log('✅ Sesión cerrada')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
    throw error
  }
}

export function onAuthChange(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export { auth }
