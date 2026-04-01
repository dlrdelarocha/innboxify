<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings.js'
import { clearCache } from '../services/cache.js'

const { t } = useI18n()
const settings = useSettingsStore()

const apiKeyInput = ref(settings.apiKey)
const selectedProvider = ref(settings.provider)
const saved = ref(false)
const cacheCleared = ref(false)

const providers = [
  {
    id: 'gemini',
    icon: 'auto_awesome',
    name: 'Google Gemini',
    tier: 'Gratis',
    description: 'Gemini 2.0 Flash - 15 req/min gratis',
    keyUrl: 'https://aistudio.google.com/apikey',
    placeholder: 'AIzaSy...'
  },
  {
    id: 'anthropic',
    icon: 'psychology',
    name: 'Anthropic Claude',
    tier: 'De pago',
    description: 'Claude Haiku - Requiere créditos',
    keyUrl: 'https://console.anthropic.com',
    placeholder: 'sk-ant-...'
  },
  {
    id: 'openrouter',
    icon: 'route',
    name: 'OpenRouter',
    tier: 'Gratis*',
    description: 'Acceso a múltiples modelos gratuitos',
    keyUrl: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-...'
  }
]

const activeProvider = computed(() =>
  providers.find(p => p.id === selectedProvider.value) || providers[0]
)

function selectProvider(id) {
  selectedProvider.value = id
}

function saveKey() {
  settings.saveProvider(selectedProvider.value)
  settings.saveApiKey(apiKeyInput.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

async function handleClearCache() {
  await clearCache()
  cacheCleared.value = true
  setTimeout(() => { cacheCleared.value = false }, 2000)
}
</script>

<template>
  <div class="md:ml-[240px] min-h-screen pb-24 md:pb-8 px-6">
    <div class="max-w-[640px] mx-auto pt-24 space-y-8">

      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-on-surface">{{ t('settings.title') }}</h1>
        <p class="text-on-surface-variant text-sm mt-1">{{ t('settings.providerHelp') }}</p>
      </div>

      <!-- Card 1: AI Provider + API Key -->
      <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">

        <!-- Provider Section -->
        <div class="flex items-start gap-4 mb-6">
          <div class="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary text-2xl">smart_toy</span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-on-surface">{{ t('settings.provider') }}</h2>
            <p class="text-on-surface-variant text-sm mt-0.5">{{ t('settings.providerHelp') }}</p>
          </div>
        </div>

        <!-- Provider Cards -->
        <div class="grid gap-3 mb-8">
          <button
            v-for="p in providers"
            :key="p.id"
            @click="selectProvider(p.id)"
            class="w-full text-left rounded-xl p-4 border-2 transition-all cursor-pointer"
            :class="selectedProvider === p.id
              ? 'bg-primary/5 text-primary border-primary/20'
              : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/30'"
          >
            <div class="flex items-center gap-4">
              <div
                class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="selectedProvider === p.id ? 'bg-primary/10' : 'bg-surface-container'"
              >
                <span
                  class="material-symbols-outlined text-xl"
                  :class="selectedProvider === p.id ? 'text-primary' : 'text-on-surface-variant'"
                >{{ p.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm" :class="selectedProvider === p.id ? 'text-primary' : 'text-on-surface'">{{ p.name }}</span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    :class="selectedProvider === p.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-container text-on-surface-variant'"
                  >{{ p.tier }}</span>
                </div>
                <p class="text-xs mt-0.5" :class="selectedProvider === p.id ? 'text-primary/70' : 'text-on-surface-variant'">{{ p.description }}</p>
              </div>
              <span
                v-if="selectedProvider === p.id"
                class="material-symbols-outlined text-primary text-xl flex-shrink-0"
              >check_circle</span>
            </div>
          </button>
        </div>

        <!-- API Key Section -->
        <div class="flex items-start gap-4 mb-6">
          <div class="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary text-2xl">vpn_key</span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-on-surface">{{ t('settings.apiKey') }}</h2>
            <p class="text-on-surface-variant text-sm mt-0.5">{{ t('settings.apiKeyHelp') }}</p>
          </div>
        </div>

        <!-- Input -->
        <div class="space-y-2">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">API Key</label>
          <div class="relative">
            <input
              v-model="apiKeyInput"
              type="password"
              :placeholder="activeProvider.placeholder"
              class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span class="material-symbols-outlined text-xl">visibility_off</span>
            </button>
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <span class="material-symbols-outlined text-on-surface-variant text-sm">info</span>
            <span class="text-xs text-on-surface-variant">{{ t('settings.apiKeyHelp') }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-sm">open_in_new</span>
            <a
              :href="activeProvider.keyUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-primary hover:underline"
            >{{ activeProvider.keyUrl }}</a>
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-6">
          <button
            @click="saveKey"
            class="px-6 py-3 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg" v-if="saved">check_circle</span>
              {{ saved ? t('settings.saved') : t('settings.save') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Card 2: Cache -->
      <div class="bg-surface-container-lowest rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
        <!-- Icon + Title -->
        <div class="flex items-start gap-4 mb-6">
          <div class="h-12 w-12 bg-tertiary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-tertiary text-2xl">database</span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-on-surface">{{ t('settings.clearCache') }}</h2>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-surface-container-low rounded-xl p-4 mb-6">
          <p class="text-sm text-on-surface-variant">{{ t('settings.cacheInfo') }}</p>
        </div>

        <!-- Clear Cache Button -->
        <button
          @click="handleClearCache"
          class="px-6 py-3 text-sm font-bold text-error border-2 border-error rounded-xl hover:bg-error/5 transition-colors"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg" v-if="cacheCleared">check_circle</span>
            <span class="material-symbols-outlined text-lg" v-else>delete_sweep</span>
            {{ cacheCleared ? t('settings.cacheCleared') : t('settings.clearCache') }}
          </span>
        </button>
      </div>

    </div>
  </div>
</template>
