import { defineStore } from 'pinia'
import { ref } from 'vue'
import { encrypt, decrypt } from '../services/crypto.js'

const STORAGE_KEY_APIKEY = 'ai_api_key_enc'
const STORAGE_KEY_PROVIDER = 'ai_provider_enc'
const LEGACY_KEY = 'gemini_api_key_enc'

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = ref('')
  const provider = ref('gemini')
  const loaded = ref(false)

  async function loadSettings() {
    let storedKey = localStorage.getItem(STORAGE_KEY_APIKEY)
    // Migrate from old single-provider storage
    if (!storedKey) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        storedKey = legacy
        localStorage.setItem(STORAGE_KEY_APIKEY, legacy)
        localStorage.removeItem(LEGACY_KEY)
      }
    }
    if (storedKey) {
      apiKey.value = await decrypt(storedKey)
    }
    const storedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER)
    if (storedProvider) {
      const decrypted = await decrypt(storedProvider)
      if (decrypted && ['gemini', 'anthropic', 'openrouter'].includes(decrypted)) {
        provider.value = decrypted
      }
    }
    loaded.value = true
  }

  async function saveApiKey(key) {
    apiKey.value = key
    const encrypted = await encrypt(key)
    localStorage.setItem(STORAGE_KEY_APIKEY, encrypted)
  }

  async function saveProvider(p) {
    provider.value = p
    const encrypted = await encrypt(p)
    localStorage.setItem(STORAGE_KEY_PROVIDER, encrypted)
  }

  function clearApiKey() {
    apiKey.value = ''
    localStorage.removeItem(STORAGE_KEY_APIKEY)
  }

  // Keep backwards compat: loadApiKey calls loadSettings
  async function loadApiKey() {
    return loadSettings()
  }

  return { apiKey, provider, loaded, loadApiKey, loadSettings, saveApiKey, saveProvider, clearApiKey }
})
