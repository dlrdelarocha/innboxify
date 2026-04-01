<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { isConfigured } from '../services/firebase.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import LanguageSwitch from '../components/LanguageSwitch.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const error = ref(null)
const firebaseReady = isConfigured

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    await auth.login()
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
    <!-- Mesh gradient background -->
    <div class="pointer-events-none absolute inset-0 opacity-15" style="filter: blur(80px)">
      <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary"></div>
      <div class="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-tertiary"></div>
      <div class="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary-fixed-dim"></div>
    </div>

    <!-- Gradient overlay -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>

    <!-- Header with language toggle -->
    <header class="absolute top-6 right-6 z-20">
      <div class="bg-surface-container-lowest/80 backdrop-blur-md rounded-full px-1 py-1">
        <LanguageSwitch />
      </div>
    </header>

    <!-- Main card -->
    <div class="relative z-10 max-w-md w-full bg-surface-container-lowest rounded-xl shadow-lg shadow-on-surface/5 border border-outline-variant/10 p-8 md:p-12 text-center">
      <!-- Brand icon -->
      <div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-white text-3xl">mail</span>
      </div>

      <!-- Title and subtitle -->
      <h1 class="text-headline-sm font-extrabold tracking-tight text-on-surface mb-2">{{ t('login.title') }}</h1>
      <p class="text-on-surface-variant text-sm mb-8">{{ t('login.subtitle') }}</p>

      <!-- Firebase not configured warning -->
      <div v-if="!firebaseReady" class="mb-6 p-4 bg-tertiary/5 border border-tertiary/20 rounded-xl text-left">
        <p class="text-sm font-semibold text-tertiary mb-2">Firebase no configurado</p>
        <p class="text-xs text-on-surface-variant mb-2">Crea un archivo <code class="bg-tertiary/10 px-1 rounded">.env</code> en la raiz del proyecto con:</p>
        <pre class="text-xs bg-tertiary/10 p-2 rounded overflow-x-auto text-on-surface">VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_APP_ID=tu_app_id</pre>
        <p class="text-xs text-on-surface-variant mt-2">Luego reinicia el servidor de desarrollo.</p>
      </div>

      <!-- Google sign-in button -->
      <button
        @click="handleLogin"
        :disabled="loading || !firebaseReady"
        class="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? t('common.loading') : t('login.signIn') }}
      </button>

      <!-- Error message -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Feature pills in 2x2 grid -->
      <div class="mt-8 grid grid-cols-2 gap-3">
        <div class="flex items-center gap-2 bg-primary/5 rounded-xl p-3">
          <span class="material-symbols-outlined text-primary shrink-0" style="font-size: 10px;">auto_awesome</span>
          <span class="text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">{{ t('login.features.classify') }}</span>
        </div>
        <div class="flex items-center gap-2 bg-secondary/5 rounded-xl p-3">
          <span class="material-symbols-outlined text-secondary shrink-0" style="font-size: 10px;">filter_list</span>
          <span class="text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">{{ t('login.features.filters') }}</span>
        </div>
        <div class="flex items-center gap-2 bg-tertiary/5 rounded-xl p-3">
          <span class="material-symbols-outlined text-tertiary shrink-0" style="font-size: 10px;">unsubscribe</span>
          <span class="text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">{{ t('login.features.unsubscribe') }}</span>
        </div>
        <div class="flex items-center gap-2 bg-on-surface-variant/5 rounded-xl p-3">
          <span class="material-symbols-outlined text-on-surface-variant shrink-0" style="font-size: 10px;">delete_sweep</span>
          <span class="text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">{{ t('login.features.clean') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
