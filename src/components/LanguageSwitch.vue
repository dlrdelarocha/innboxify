<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function setLocale(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<template>
  <div class="flex bg-slate-900 rounded-lg p-1 text-[10px]">
    <button
      @click="setLocale('en')"
      class="px-2 py-1 rounded transition-colors"
      :class="locale === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'"
    >
      EN
    </button>
    <button
      @click="setLocale('es')"
      class="px-2 py-1 rounded transition-colors"
      :class="locale === 'es' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'"
    >
      ES
    </button>
  </div>
</template>
