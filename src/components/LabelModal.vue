<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFiltersStore } from '../stores/filters.js'

const { t } = useI18n()
const filtersStore = useFiltersStore()

const emit = defineEmits(['close', 'created'])

const name = ref('')
const saving = ref(false)

async function save() {
  if (!name.value.trim()) return
  saving.value = true
  try {
    await filtersStore.addLabel(name.value.trim())
    emit('created')
  } catch (e) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- Overlay -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div class="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4" @click.self="$emit('close')">
      <!-- Card -->
      <div class="bg-surface-container-lowest rounded-[24px] max-w-sm w-full shadow-2xl border border-surface-container">

        <!-- Header -->
        <div class="px-6 pt-6 pb-0">
          <div class="flex items-center gap-3 mb-5">
            <div class="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">new_label</span>
            </div>
            <h3 class="text-xl font-extrabold text-on-surface">{{ t('filters.createLabel') }}</h3>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 pb-2">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.labelName') }}</label>
          <input
            v-model="name"
            type="text"
            @keyup.enter="save"
            placeholder="e.g. Newsletters"
            class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <!-- Footer -->
        <div class="px-6 py-5 flex items-center justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="save"
            :disabled="saving || !name.trim()"
            class="px-6 py-2.5 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all"
          >
            {{ saving ? t('common.loading') : t('common.save') }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>
