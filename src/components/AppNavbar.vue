<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'
import LanguageSwitch from './LanguageSwitch.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <!-- SIDEBAR (desktop) -->
  <nav class="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-slate-950 z-30 shadow-2xl shadow-black/50 text-sm">
    <div class="flex flex-col h-full py-6">
      <!-- Brand -->
      <div class="px-6 mb-8 flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
          <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div>
          <h1 class="font-black text-white text-lg leading-tight font-headline">Inboxly</h1>
          <p class="text-slate-500 text-[10px] uppercase tracking-widest">Smart Inbox</p>
        </div>
      </div>

      <!-- Nav Links -->
      <div class="flex-grow flex flex-col gap-1">
        <router-link
          to="/dashboard"
          class="px-4 py-3 flex items-center gap-3 transition-all"
          :class="$route.path === '/dashboard'
            ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500'
            : 'text-slate-400 opacity-80 hover:bg-slate-900 hover:text-white border-l-4 border-transparent'"
        >
          <span class="material-symbols-outlined" :style="$route.path === '/dashboard' ? `font-variation-settings: 'FILL' 1` : ''">dashboard</span>
          {{ t('nav.dashboard') }}
        </router-link>

        <router-link
          to="/filters"
          class="px-4 py-3 flex items-center gap-3 transition-all"
          :class="$route.path === '/filters'
            ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500'
            : 'text-slate-400 opacity-80 hover:bg-slate-900 hover:text-white border-l-4 border-transparent'"
        >
          <span class="material-symbols-outlined">filter_alt</span>
          {{ t('nav.filters') }}
        </router-link>

        <router-link
          to="/settings"
          class="px-4 py-3 flex items-center gap-3 transition-all"
          :class="$route.path === '/settings'
            ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500'
            : 'text-slate-400 opacity-80 hover:bg-slate-900 hover:text-white border-l-4 border-transparent'"
        >
          <span class="material-symbols-outlined">settings</span>
          {{ t('nav.settings') }}
        </router-link>
      </div>

      <!-- Footer -->
      <div class="mt-auto flex flex-col gap-1 border-t border-slate-800 pt-6">
        <!-- User profile -->
        <div v-if="auth.user" class="px-6 mb-4 flex items-center gap-2">
          <div class="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/30">
            <img :src="auth.user.photoURL" :alt="auth.user.displayName" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-white text-xs font-semibold truncate">{{ auth.user.displayName }}</span>
            <span class="text-slate-500 text-[10px] truncate">{{ auth.user.email }}</span>
          </div>
        </div>

        <!-- Language switch -->
        <div class="px-4 mb-4">
          <LanguageSwitch />
        </div>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="text-error/80 px-4 py-3 opacity-80 flex items-center gap-3 hover:bg-red-950/20 hover:text-error transition-all w-full text-left"
        >
          <span class="material-symbols-outlined">logout</span>
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>
  </nav>

  <!-- TOP HEADER (desktop) -->
  <header class="hidden md:flex fixed top-0 right-0 w-[calc(100%-256px)] z-40 glass-header shadow-sm shadow-indigo-100/20 px-6 py-3 justify-between items-center">
    <div class="flex items-center gap-4 flex-1">
      <div class="relative w-full max-w-md">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input
          class="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body placeholder:text-slate-400"
          :placeholder="t('dashboard.search')"
          type="text"
          disabled
        />
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="h-8 w-px bg-slate-200"></div>
      <div v-if="auth.user" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
          {{ auth.user.displayName?.substring(0, 2).toUpperCase() }}
        </div>
      </div>
    </div>
  </header>

  <!-- MOBILE BOTTOM NAV -->
  <nav class="fixed bottom-0 w-full z-50 md:hidden bg-white flex justify-around h-16 items-center border-t border-surface-container shadow-lg">
    <router-link
      to="/dashboard"
      class="flex flex-col items-center justify-center px-4 py-2 text-xs font-medium transition-colors"
      :class="$route.path === '/dashboard'
        ? 'bg-indigo-50 text-indigo-700 rounded-xl'
        : 'text-slate-400'"
    >
      <span class="material-symbols-outlined text-[22px]">dashboard</span>
      <span class="mt-0.5">{{ t('nav.dashboard') }}</span>
    </router-link>

    <router-link
      to="/filters"
      class="flex flex-col items-center justify-center px-4 py-2 text-xs font-medium transition-colors"
      :class="$route.path === '/filters'
        ? 'bg-indigo-50 text-indigo-700 rounded-xl'
        : 'text-slate-400'"
    >
      <span class="material-symbols-outlined text-[22px]">filter_list</span>
      <span class="mt-0.5">{{ t('nav.filters') }}</span>
    </router-link>

    <router-link
      to="/settings"
      class="flex flex-col items-center justify-center px-4 py-2 text-xs font-medium transition-colors"
      :class="$route.path === '/settings'
        ? 'bg-indigo-50 text-indigo-700 rounded-xl'
        : 'text-slate-400'"
    >
      <span class="material-symbols-outlined text-[22px]">settings</span>
      <span class="mt-0.5">{{ t('nav.settings') }}</span>
    </router-link>
  </nav>
</template>
