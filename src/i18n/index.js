import { createI18n } from 'vue-i18n'
import es from './es.js'
import en from './en.js'

const savedLocale = localStorage.getItem('locale') || 'es'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { es, en }
})

export default i18n
