<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFiltersStore } from '../stores/filters.js'

const { t } = useI18n()
const filtersStore = useFiltersStore()

const emit = defineEmits(['close', 'created'])
const props = defineProps({
  prefillFrom: { type: String, default: '' },
  prefillDomain: { type: String, default: '' }
})

const from = ref(props.prefillFrom || (props.prefillDomain ? `*@${props.prefillDomain}` : ''))
const to = ref('')
const subject = ref('')
const hasWords = ref('')
const doesntHave = ref('')

const actionType = ref('addLabel')
const selectedLabel = ref('')
const saving = ref(false)

onMounted(() => {
  filtersStore.fetchLabels()
})

const userLabels = () => filtersStore.labels.filter(l => l.type === 'user')

async function save() {
  saving.value = true
  try {
    const criteria = {}
    if (from.value) criteria.from = from.value
    if (to.value) criteria.to = to.value
    if (subject.value) criteria.subject = subject.value
    if (hasWords.value) criteria.query = hasWords.value
    if (doesntHave.value) criteria.negatedQuery = doesntHave.value

    const action = {}
    if (actionType.value === 'addLabel' && selectedLabel.value) {
      action.addLabelIds = [selectedLabel.value]
    } else if (actionType.value === 'markRead') {
      action.removeLabelIds = ['UNREAD']
    } else if (actionType.value === 'archive') {
      action.removeLabelIds = ['INBOX']
    } else if (actionType.value === 'trash') {
      action.addLabelIds = ['TRASH']
      action.removeLabelIds = ['INBOX']
    }

    await filtersStore.addFilter(criteria, action)
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
    <div class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" @click.self="$emit('close')">
      <!-- Card -->
      <div class="bg-surface-container-lowest rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        <!-- Header -->
        <div class="px-8 py-6 border-b border-surface-container">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">filter_alt</span>
              </div>
              <h3 class="text-xl font-extrabold text-on-surface">{{ t('filters.create') }}</h3>
            </div>
            <button @click="$emit('close')" class="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="p-8 space-y-6">
          <!-- Criteria Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.from') }}</label>
              <input v-model="from" type="text" placeholder="sender@example.com"
                class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.to') }}</label>
              <input v-model="to" type="text" placeholder="recipient@example.com"
                class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.subject') }}</label>
              <input v-model="subject" type="text" placeholder="Subject contains..."
                class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.hasWords') }}</label>
              <input v-model="hasWords" type="text" placeholder="Keywords..."
                class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.doesntHave') }}</label>
              <input v-model="doesntHave" type="text" placeholder="Exclude words..."
                class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <!-- Action Selection -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">{{ t('filters.form.action') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                @click="actionType = 'addLabel'"
                class="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
                :class="actionType === 'addLabel'
                  ? 'bg-primary/5 text-primary border-2 border-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant border-2 border-transparent hover:bg-surface-container'"
              >
                <span class="material-symbols-outlined text-xl">label</span>
                <span class="text-xs font-bold">{{ t('filters.form.addLabel') }}</span>
              </button>
              <button
                type="button"
                @click="actionType = 'markRead'"
                class="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
                :class="actionType === 'markRead'
                  ? 'bg-primary/5 text-primary border-2 border-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant border-2 border-transparent hover:bg-surface-container'"
              >
                <span class="material-symbols-outlined text-xl">mark_email_read</span>
                <span class="text-xs font-bold">{{ t('filters.form.markRead') }}</span>
              </button>
              <button
                type="button"
                @click="actionType = 'archive'"
                class="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
                :class="actionType === 'archive'
                  ? 'bg-primary/5 text-primary border-2 border-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant border-2 border-transparent hover:bg-surface-container'"
              >
                <span class="material-symbols-outlined text-xl">archive</span>
                <span class="text-xs font-bold">{{ t('filters.form.archive') }}</span>
              </button>
              <button
                type="button"
                @click="actionType = 'trash'"
                class="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all"
                :class="actionType === 'trash'
                  ? 'bg-primary/5 text-primary border-2 border-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant border-2 border-transparent hover:bg-surface-container'"
              >
                <span class="material-symbols-outlined text-xl">delete</span>
                <span class="text-xs font-bold">{{ t('filters.form.trash') }}</span>
              </button>
            </div>
          </div>

          <!-- Label Selector (shown when addLabel is selected) -->
          <div v-if="actionType === 'addLabel'">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">{{ t('filters.form.selectLabel') }}</label>
            <select v-model="selectedLabel"
              class="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              <option value="" disabled>{{ t('filters.form.selectLabel') }}</option>
              <option v-for="label in userLabels()" :key="label.id" :value="label.id">{{ label.name }}</option>
            </select>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-surface-container-low/50 px-8 py-6 rounded-b-[24px] flex items-center justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {{ t('filters.form.cancel') }}
          </button>
          <button
            @click="save"
            :disabled="saving"
            class="px-6 py-2.5 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all"
          >
            {{ saving ? t('common.loading') : t('filters.form.save') }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>
