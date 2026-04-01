import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

console.log('🔧 Firebase Config Debug:')
console.log('  API Key present:', !!firebaseConfig.apiKey)
console.log('  Auth Domain:', firebaseConfig.authDomain)
console.log('  Project ID:', firebaseConfig.projectId)
console.log('  App ID present:', !!firebaseConfig.appId)

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain)

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
  if (!isConfigured) throw new Error('Firebase no está configurado')
  try {
    console.log('🔐 Abriendo popup de Google...')
    console.log('🌐 Dominio actual:', window.location.hostname)
    console.log('🔑 Auth domain:', firebaseConfig.authDomain)

    // Usar signInWithPopup en lugar de redirect
    // En Vercel, popup funciona mejor que redirect
    const result = await signInWithPopup(auth, provider)

    console.log('✅ Autenticación completada')
    console.log('👤 Usuario:', result.user.email)

    const credential = GoogleAuthProvider.credentialFromResult(result)

    if (!credential?.accessToken) {
      console.warn('⚠️ Token de acceso no disponible (esto es normal para OAuth)')
    } else {
      console.log('✅ Token de acceso obtenido')
    }

    return {
      user: result.user,
      accessToken: credential?.accessToken || null
    }
  } catch (error) {
    console.error('❌ Error en autenticación:', error)
    console.error('Código de error:', error.code)
    console.error('Mensaje completo:', error.message)

    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Este dominio no está autorizado en Firebase. Agrega innboxify.vercel.app a Firebase Console.')
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('El popup fue bloqueado. Desactiva el bloqueador de popups.')
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Cerraste el popup de Google.')
    }
    if (error.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('OAuth no está soportado en este navegador.')
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Error de conexión. Verifica tu internet.')
    }

    throw error
  }
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
