<script setup>
import { onMounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmailsStore } from '../stores/emails.js'
import { useSettingsStore } from '../stores/settings.js'
import { CATEGORIES } from '../services/classifier.js'
import SenderTable from '../components/SenderTable.vue'
import SyncProgressBar from '../components/SyncProgressBar.vue'
import FilterModal from '../components/FilterModal.vue'

const { t } = useI18n()
const emails = useEmailsStore()
const settings = useSettingsStore()

const showFilterModal = ref(false)
const filterPrefill = ref({ from: '', domain: '' })

onMounted(() => {
  emails.fetchEmails()
})

const progressText = computed(() => {
  const s = emails.statusMessage
  if (!s) return ''
  if (s.startsWith('classifying:')) {
    const [, current, total] = s.split(':')
    return t('dashboard.classifying', { current, total })
  }
  return ''
})

const totalEmails = computed(() => {
  return emails.filteredSenders.reduce((sum, s) => sum + s.count, 0)
})

const classifiedCount = computed(() => {
  return emails.senders.filter(s => emails.classifications[s.email]).length
})

const topDomain = computed(() => {
  if (!emails.senders.length) return '--'
  const domainCounts = {}
  emails.senders.forEach(s => {
    domainCounts[s.domain] = (domainCounts[s.domain] || 0) + s.count
  })
  return Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '--'
})

const categoryTabs = computed(() => ['', ...CATEGORIES])

function tabLabel(cat) {
  if (cat === '') return t('dashboard.allCategories')
  return cat
}

function openFilterFor(sender) {
  filterPrefill.value = { from: sender.email, domain: sender.domain }
  showFilterModal.value = true
}
</script>

<template>
  <div class="md:ml-64 min-h-screen pb-20 md:pb-8">
    <div class="pt-20 md:pt-20 px-6 md:px-8 max-w-7xl mx-auto">

      <!-- API key warning -->
      <div
        v-if="!settings.apiKey && !emails.loading"
        class="mb-6 bg-orange-50 border-l-4 border-orange-400 rounded-xl px-5 py-4 flex items-start gap-3"
      >
        <span class="material-symbols-outlined text-orange-500 mt-0.5">warning</span>
        <p class="text-sm text-orange-700 font-medium">{{ t('dashboard.needsApiKey') }}</p>
      </div>

      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 class="text-3xl font-extrabold font-headline tracking-tight text-slate-900 flex items-center gap-3">
            <span class="w-1 h-8 bg-secondary rounded-full"></span>
            {{ t('dashboard.title') }}
          </h2>
          <p class="text-slate-500 font-body text-sm mt-1">
            <template v-if="emails.senders.length">
              {{ t('dashboard.manageSenders', { count: emails.senders.length }) }}
            </template>
            <template v-else-if="emails.fromCache">{{ t('dashboard.cached') }}</template>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="emails.fetchEmails(true)"
            :disabled="emails.loading || emails.syncing"
            class="px-5 py-2.5 text-primary font-semibold text-sm border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">refresh</span>
            {{ t('dashboard.refresh') }}
          </button>
          <button
            @click="emails.classifyAllSenders()"
            :disabled="emails.classifying || !settings.apiKey || emails.syncing"
            :title="!settings.apiKey ? t('dashboard.needsApiKey') : ''"
            class="px-6 py-2.5 bg-gradient-to-r from-primary to-[#4f46e5] text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="emails.classifying" class="material-symbols-outlined text-sm animate-spin">sync</span>
            <span v-else class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">bolt</span>
            {{ emails.classifying ? progressText || t('dashboard.classify') : t('dashboard.classify') }}
          </button>
        </div>
      </div>

      <!-- Initial loading spinner (cache read only, < 1s) -->
      <div v-if="emails.loading" class="flex flex-col items-center justify-center py-24">
        <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p class="text-on-surface-variant text-sm">{{ t('dashboard.loading') }}</p>
      </div>

      <!-- Error (only if no data at all) -->
      <div v-else-if="emails.error && !emails.senders.length && !emails.syncing" class="bg-error/5 border-l-4 border-error rounded-xl px-5 py-4 text-sm text-error mb-6">
        {{ emails.error }}
      </div>

      <!-- Content (visible if we have data OR sync is running) -->
      <template v-else-if="emails.senders.length > 0 || emails.syncing">

        <!-- Error banner (non-blocking, when we have data) -->
        <div v-if="emails.error" class="bg-error/5 border-l-4 border-error rounded-xl px-5 py-4 text-sm text-error mb-4 flex items-center justify-between">
          <span>{{ emails.error }}</span>
          <button @click="emails.error = null" class="text-error hover:text-error/70">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <!-- Sync progress bar -->
        <SyncProgressBar />

        <!-- Glassmorphic Category Tab Bar -->
        <div class="glass-tab p-1.5 rounded-2xl mb-8 flex items-center gap-1 w-fit ghost-border overflow-x-auto">
          <button
            v-for="cat in categoryTabs"
            :key="cat"
            @click="emails.categoryFilter = cat"
            class="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            :class="emails.categoryFilter === cat
              ? 'bg-white text-primary shadow-sm font-semibold'
              : 'text-slate-500 hover:bg-white/40'"
          >
            {{ tabLabel(cat) }}
          </button>
        </div>

        <!-- Search bar -->
        <div class="bg-surface-container-lowest rounded-xl shadow-sm mb-6">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
            <input
              v-model="emails.searchQuery"
              type="text"
              :placeholder="t('dashboard.search')"
              class="w-full pl-12 pr-4 py-3.5 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
            />
          </div>
        </div>

        <!-- Table card -->
        <div class="bg-white rounded-[12px] shadow-sm border border-slate-100 overflow-hidden">
          <SenderTable :senders="emails.filteredSenders" />
        </div>

        <!-- Dashboard Stats Bento Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
          <div class="bg-white p-5 rounded-[12px] shadow-sm border border-slate-100 flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-label">{{ t('dashboard.stats.totalSenders') }}</span>
            <span class="text-2xl font-extrabold text-slate-900 font-headline">{{ emails.filteredSenders.length }}</span>
          </div>
          <div class="bg-white p-5 rounded-[12px] shadow-sm border border-slate-100 flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-label">{{ t('dashboard.stats.totalEmails') }}</span>
            <span class="text-2xl font-extrabold text-slate-900 font-headline">{{ totalEmails.toLocaleString() }}</span>
          </div>
          <div class="bg-white p-5 rounded-[12px] shadow-sm border border-slate-100 flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-label">{{ t('dashboard.stats.classified') }}</span>
            <span class="text-2xl font-extrabold text-slate-900 font-headline">{{ classifiedCount }}</span>
          </div>
          <div class="bg-white p-5 rounded-[12px] shadow-sm border border-slate-100 flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-label">{{ t('dashboard.stats.topDomain') }}</span>
            <span class="text-2xl font-extrabold text-slate-900 font-headline truncate">{{ topDomain }}</span>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="text-center py-24 text-on-surface-variant">
        <span class="material-symbols-outlined text-[48px] text-outline-variant mb-4">inbox</span>
        <p class="text-lg">{{ t('dashboard.noEmails') }}</p>
      </div>

      <!-- Filter modal -->
      <FilterModal
        v-if="showFilterModal"
        :prefill-from="filterPrefill.from"
        :prefill-domain="filterPrefill.domain"
        @close="showFilterModal = false"
        @created="showFilterModal = false"
      />
    </div>
  </div>
</template>
