<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFiltersStore } from '../stores/filters.js'
import FilterModal from '../components/FilterModal.vue'
import LabelModal from '../components/LabelModal.vue'

const { t } = useI18n()
const filtersStore = useFiltersStore()

const showFilterModal = ref(false)
const showLabelModal = ref(false)
const toast = ref(null)

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

onMounted(() => {
  filtersStore.fetchFilters()
  filtersStore.fetchLabels()
})

async function handleDeleteFilter(filterId) {
  if (!confirm(t('filters.deleteConfirm'))) return
  try {
    await filtersStore.removeFilter(filterId)
    showToast(t('filters.deleted'))
  } catch (e) {
    showToast(e.message)
  }
}

function formatCriteria(filter) {
  const c = filter.criteria || {}
  const parts = []
  if (c.from) parts.push(`From: ${c.from}`)
  if (c.to) parts.push(`To: ${c.to}`)
  if (c.subject) parts.push(`Subject: ${c.subject}`)
  if (c.query) parts.push(`Has: ${c.query}`)
  return parts.join(' | ') || '—'
}

function formatAction(filter) {
  const a = filter.action || {}
  const parts = []
  if (a.addLabelIds?.length) parts.push(`+Label: ${a.addLabelIds.join(', ')}`)
  if (a.removeLabelIds?.includes('UNREAD')) parts.push('Mark read')
  if (a.removeLabelIds?.includes('INBOX')) parts.push('Archive')
  if (a.addLabelIds?.includes('TRASH')) parts.push('Trash')
  return parts.join(', ') || '—'
}

const userLabels = () => filtersStore.labels.filter(l => l.type === 'user')
</script>

<template>
  <div class="md:ml-[240px] min-h-screen pb-24 md:pb-8">
    <div class="pt-24 px-6 md:px-10 max-w-6xl mx-auto">

      <!-- Toast -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div v-if="toast" class="fixed top-20 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {{ toast }}
        </div>
      </Transition>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-on-surface">{{ t('filters.title') }}</h1>
          <p class="text-on-surface-variant text-sm mt-1">Organize your inbox with custom rules and labels</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showLabelModal = true"
            class="px-5 py-2.5 text-sm font-bold text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">new_label</span>
              {{ t('filters.createLabel') }}
            </span>
          </button>
          <button
            @click="showFilterModal = true"
            class="px-5 py-2.5 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">add</span>
              {{ t('filters.create') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Labels Section -->
      <div class="mb-10">
        <h3 class="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">{{ t('filters.labels') }}</h3>
        <div v-if="userLabels().length === 0" class="text-sm text-on-surface-variant">No labels yet</div>
        <div v-else class="flex flex-wrap gap-2">
          <span
            v-for="(label, index) in userLabels()"
            :key="label.id"
            class="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
            :class="[
              index % 4 === 0 ? 'bg-primary/10 text-primary' : '',
              index % 4 === 1 ? 'bg-secondary/10 text-secondary' : '',
              index % 4 === 2 ? 'bg-tertiary/10 text-tertiary' : '',
              index % 4 === 3 ? 'bg-primary/10 text-primary' : '',
            ]"
          >
            {{ label.name }}
          </span>
        </div>
      </div>

      <!-- Filters List -->
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">{{ t('filters.existing') }}</h3>

        <!-- Loading -->
        <div v-if="filtersStore.loading" class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtersStore.filters.length === 0" class="text-center py-16">
          <div class="h-16 w-16 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-on-surface-variant text-3xl">filter_alt_off</span>
          </div>
          <p class="text-on-surface-variant text-sm">{{ t('filters.noFilters') }}</p>
        </div>

        <!-- Filter Cards -->
        <div v-else class="space-y-3">
          <div
            v-for="filter in filtersStore.filters"
            :key="filter.id"
            class="group bg-surface-container-lowest rounded-[12px] p-5 hover:bg-surface-container-low hover:translate-x-1 transition-all cursor-default"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Criteria + Actions -->
              <div class="flex-1 min-w-0">
                <!-- Criteria -->
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <template v-for="(part, i) in formatCriteria(filter).split(' | ')" :key="i">
                    <span v-if="part !== '—'" class="inline-flex items-center gap-1">
                      <span class="text-xs font-bold text-primary px-2 py-0.5 bg-primary/5 rounded">
                        {{ part.split(': ')[0] }}
                      </span>
                      <span class="text-sm font-bold text-on-surface">{{ part.split(': ').slice(1).join(': ') }}</span>
                    </span>
                    <span v-else class="text-sm text-on-surface-variant">{{ part }}</span>
                  </template>
                </div>
                <!-- Actions -->
                <div class="flex items-center gap-4 text-on-surface-variant">
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                  <span class="text-xs">{{ formatAction(filter) }}</span>
                </div>
              </div>

              <!-- Delete -->
              <button
                @click="handleDeleteFilter(filter.id)"
                class="p-2 rounded-xl opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
              >
                <span class="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <FilterModal v-if="showFilterModal"
        @close="showFilterModal = false"
        @created="showFilterModal = false; showToast(t('filters.created'))" />
      <LabelModal v-if="showLabelModal"
        @close="showLabelModal = false"
        @created="showLabelModal = false; showToast(t('filters.labelCreated'))" />
    </div>
  </div>
</template>
