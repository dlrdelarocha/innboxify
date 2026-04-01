import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config Debug:')
console.log('  URL present:', !!supabaseUrl)
console.log('  Anon Key present:', !!supabaseAnonKey)
console.log('  URL:', supabaseUrl)

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let supabase = null

if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase inicializado')
}

export async function loginWithGoogle() {
  if (!isConfigured) throw new Error('Supabase no está configurado')
  try {
    console.log('🔐 Abriendo popup de Google...')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) throw error

    console.log('✅ Autenticación completada')
    return data
  } catch (error) {
    console.error('❌ Error en autenticación:', error)
    console.error('Mensaje:', error.message)

    throw new Error(error.message || 'Error en autenticación')
  }
}

export async function logout() {
  if (!supabase) return
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log('✅ Sesión cerrada')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
    throw error
  }
}

export function onAuthChange(callback) {
  if (!supabase) {
    callback(null)
    return () => {}
  }

  // Obtener el usuario actual al iniciar
  supabase.auth.getUser().then(({ data: { user } }) => {
    callback(user)
  })

  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('🔄 Auth event:', event)
      callback(session?.user || null)
    }
  )

  return () => subscription?.unsubscribe()
}

export { supabase }
