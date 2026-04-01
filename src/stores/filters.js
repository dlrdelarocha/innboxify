import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listFilters,
  createFilter,
  deleteFilter,
  listLabels,
  createLabel
} from '../services/gmail.js'
import { useAuthStore } from './auth.js'

export const useFiltersStore = defineStore('filters', () => {
  const filters = ref([])
  const labels = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchFilters() {
    const auth = useAuthStore()
    if (!auth.accessToken) return
    loading.value = true
    error.value = null
    try {
      filters.value = await listFilters(auth.accessToken)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchLabels() {
    const auth = useAuthStore()
    if (!auth.accessToken) return
    try {
      labels.value = await listLabels(auth.accessToken)
    } catch (e) {
      error.value = e.message
    }
  }

  async function addFilter(criteria, action) {
    const auth = useAuthStore()
    await createFilter(auth.accessToken, criteria, action)
    await fetchFilters()
  }

  async function removeFilter(filterId) {
    const auth = useAuthStore()
    await deleteFilter(auth.accessToken, filterId)
    filters.value = filters.value.filter(f => f.id !== filterId)
  }

  async function addLabel(name) {
    const auth = useAuthStore()
    const label = await createLabel(auth.accessToken, name)
    labels.value.push(label)
    return label
  }

  return { filters, labels, loading, error, fetchFilters, fetchLabels, addFilter, removeFilter, addLabel }
})
