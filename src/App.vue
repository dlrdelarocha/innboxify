<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useSettingsStore } from './stores/settings.js'
import AppNavbar from './components/AppNavbar.vue'

const auth = useAuthStore()
const settings = useSettingsStore()
const route = useRoute()

const showNavbar = computed(() => route.name !== 'login' && auth.user)

onMounted(() => {
  auth.init()
  settings.loadApiKey()
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f7f9]">
    <div v-if="auth.loading" class="flex items-center justify-center min-h-screen">
      <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <template v-else>
      <AppNavbar v-if="showNavbar" />
      <router-view />
    </template>
  </div>
</template>
