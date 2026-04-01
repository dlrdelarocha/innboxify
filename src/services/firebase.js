import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// For Vercel deployment, we need to tell Firebase to use the correct auth domain
// This ensures OAuth redirects work properly
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  firebaseConfig.authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
}

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let auth = null
let provider = null

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)

  const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.settings.basic'
  ]

  provider = new GoogleAuthProvider()
  GMAIL_SCOPES.forEach(scope => provider.addScope(scope))
}

export async function loginWithGoogle() {
  if (!isConfigured) throw new Error('Firebase not configured')
  try {
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    return {
      user: result.user,
      accessToken: credential.accessToken
    }
  } catch (error) {
    console.error('Firebase login error:', error)
    // Re-throw con mensaje más descriptivo
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Este dominio no está autorizado en Firebase. Contacta al administrador.')
    }
    throw error
  }
}

export async function logout() {
  if (!auth) return
  await signOut(auth)
}

export function onAuthChange(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export { auth }
