<script setup>
import { useI18n } from 'vue-i18n'
import { useEmailsStore } from '../stores/emails.js'
import { computed } from 'vue'

const { t } = useI18n()
const emails = useEmailsStore()

const label = computed(() => {
  if (emails.syncPhase === 'ids') {
    return t('dashboard.sync.fetchingIds', { count: emails.syncDetail })
  }
  if (emails.syncPhase === 'metadata') {
    return t('dashboard.sync.fetchingMetadata', {
      detail: emails.syncDetail,
      percent: emails.syncProgress
    })
  }
  if (emails.syncPhase === 'done') {
    return t('dashboard.sync.complete')
  }
  return ''
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-500 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="emails.syncing" class="mb-6">
      <!-- Progress bar -->
      <div class="w-full h-1 bg-indigo-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
          :style="{ width: emails.syncProgress + '%' }"
        />
      </div>
      <!-- Progress text -->
      <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-sm text-primary animate-spin">sync</span>
        {{ label }}
      </p>
    </div>
  </Transition>
</template>
