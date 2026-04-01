<script setup>
import { useI18n } from 'vue-i18n'
import { useEmailsStore } from '../stores/emails.js'
import { ref, computed, watch } from 'vue'

const { t } = useI18n()
const emails = useEmailsStore()

const props = defineProps({
  senders: { type: Array, required: true }
})

// Pagination
const page = ref(1)
const perPage = 50
const totalPages = computed(() => Math.max(1, Math.ceil(props.senders.length / perPage)))
const paginatedSenders = computed(() => {
  const start = (page.value - 1) * perPage
  return props.senders.slice(start, start + perPage)
})

// Reset to page 1 when senders list changes significantly (filter/search)
watch(() => props.senders.length, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

const actionLoading = ref({})
const toast = ref(null)

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}

async function handleDelete(sender) {
  if (!confirm(t('dashboard.confirmDelete', { count: sender.count, sender: sender.name }))) return
  actionLoading.value[sender.email] = 'delete'
  try {
    await emails.deleteAllFromSender(sender)
    showToast(t('dashboard.deleted', { count: sender.count }))
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    delete actionLoading.value[sender.email]
  }
}

async function handleBlock(sender) {
  if (!confirm(t('dashboard.confirmBlock', { sender: sender.name }))) return
  actionLoading.value[sender.email] = 'block'
  try {
    await emails.blockSender(sender)
    showToast(t('dashboard.blocked'))
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    delete actionLoading.value[sender.email]
  }
}

async function handleUnsub(sender) {
  actionLoading.value[sender.email] = 'unsub'
  try {
    const result = await emails.unsubscribe(sender)
    if (result === 'auto') showToast(t('dashboard.unsubSent'))
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    delete actionLoading.value[sender.email]
  }
}

const avatarColors = [
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
]

function avatarColor(name) {
  if (!name) return avatarColors[0]
  const idx = name.charCodeAt(0) % avatarColors.length
  return avatarColors[idx]
}

function categoryColor(cat) {
  const colors = {
    'Spam': 'bg-red-100 text-red-700',
    'Promociones': 'bg-orange-100 text-orange-700',
    'Personal': 'bg-emerald-100 text-emerald-700',
    'Empresas': 'bg-blue-100 text-blue-700',
    'Newsletters': 'bg-yellow-100 text-yellow-700',
    'Redes Sociales': 'bg-pink-100 text-pink-700',
    'Cursos': 'bg-violet-100 text-violet-700',
    'Otros': 'bg-slate-100 text-slate-600',
  }
  return colors[cat] || 'bg-slate-100 text-slate-600'
}

function senderInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <!-- Toast -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="toast"
        class="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-md border-l-4 px-4 py-3 shadow-xl rounded-lg"
        :class="toast.type === 'error' ? 'border-red-500' : 'border-green-500'"
      >
        <span class="material-symbols-outlined" :class="toast.type === 'error' ? 'text-red-500' : 'text-green-500'">
          {{ toast.type === 'error' ? 'error' : 'check_circle' }}
        </span>
        <span class="text-sm font-semibold text-slate-900">{{ toast.msg }}</span>
        <button @click="toast = null" class="ml-2 text-slate-400 hover:text-slate-600">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- Table header -->
  <div class="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
    <span class="text-xs text-slate-500 font-body">
      {{ t('dashboard.showingSenders', { count: senders.length }) }}
    </span>
    <div v-if="totalPages > 1" class="flex items-center gap-2">
      <span class="text-xs text-slate-400">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, senders.length) }}</span>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-surface-container-high/30">
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label">{{ t('dashboard.table.sender') }}</th>
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label hidden md:table-cell">{{ t('dashboard.table.domain') }}</th>
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label text-center">{{ t('dashboard.table.count') }}</th>
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label">{{ t('dashboard.table.category') }}</th>
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label hidden sm:table-cell">{{ t('dashboard.table.unsubscribe') }}</th>
          <th class="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest font-label text-right">{{ t('dashboard.table.actions') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        <tr
          v-for="sender in paginatedSenders"
          :key="sender.email"
          class="group hover:bg-slate-50/80 transition-colors"
        >
          <!-- Sender -->
          <td class="px-6 py-3">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                :class="[avatarColor(sender.name).bg, avatarColor(sender.name).text]"
              >
                {{ senderInitial(sender.name) }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{{ sender.name }}</span>
                <span class="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {{ sender.emails?.length > 1 ? `${sender.emails.length} addresses` : sender.email }}
                </span>
              </div>
            </div>
          </td>

          <!-- Domain -->
          <td class="px-6 py-3 hidden md:table-cell">
            <span class="text-xs font-medium text-slate-600 px-2 py-1 bg-slate-100 rounded-md">{{ sender.domain }}</span>
          </td>

          <!-- Volume -->
          <td class="px-6 py-3 text-center">
            <span class="text-sm font-body text-slate-700">{{ sender.count }}</span>
          </td>

          <!-- AI Category -->
          <td class="px-6 py-3">
            <span
              v-if="emails.classifications[sender.email]"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              :class="categoryColor(emails.classifications[sender.email])"
            >
              {{ emails.classifications[sender.email] }}
            </span>
            <span v-else class="text-xs text-outline-variant">--</span>
          </td>

          <!-- Unsubscribe -->
          <td class="px-6 py-3 hidden sm:table-cell">
            <span v-if="sender.unsubscribeType === 'mailto'" class="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Auto
            </span>
            <span v-else-if="sender.unsubscribeType === 'https'" class="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Manual
            </span>
            <span v-else class="text-xs text-outline-variant">--</span>
          </td>

          <!-- Actions -->
          <td class="px-6 py-3 text-right">
            <div class="flex items-center justify-end gap-1">
              <button
                v-if="sender.unsubscribeType"
                @click="handleUnsub(sender)"
                :disabled="actionLoading[sender.email]"
                :title="sender.unsubscribeType === 'mailto' ? t('dashboard.actions.unsubAuto') : t('dashboard.actions.unsubManual')"
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-lg">unsubscribe</span>
              </button>
              <button
                @click="handleBlock(sender)"
                :disabled="actionLoading[sender.email]"
                :title="t('dashboard.actions.block')"
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-error transition-colors disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-lg">block</span>
              </button>
              <button
                @click="handleDelete(sender)"
                :disabled="actionLoading[sender.email]"
                :title="t('dashboard.actions.deleteAll')"
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-error transition-colors disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div v-if="totalPages > 1" class="px-6 py-4 flex items-center justify-between bg-white border-t border-slate-100">
    <span class="text-xs text-slate-500 font-body">
      {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, senders.length) }} of {{ senders.length }}
    </span>
    <div class="flex items-center gap-1">
      <button
        @click="page = Math.max(1, page - 1)"
        :disabled="page === 1"
        class="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-30"
      >
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>
      <template v-for="p in totalPages" :key="p">
        <button
          v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
          @click="page = p"
          class="w-8 h-8 rounded text-xs font-medium transition-colors"
          :class="p === page
            ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
            : 'hover:bg-slate-100 text-slate-600'"
        >
          {{ p }}
        </button>
        <span
          v-else-if="p === page - 2 || p === page + 2"
          class="text-slate-400 px-1"
        >...</span>
      </template>
      <button
        @click="page = Math.min(totalPages, page + 1)"
        :disabled="page === totalPages"
        class="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-30"
      >
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  </div>
</template>
