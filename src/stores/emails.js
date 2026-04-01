import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchAllMessageIds,
  fetchMessagesMetadata,
  groupBySender,
  batchDeleteMessages,
  sendEmail,
  createFilter as gmailCreateFilter
} from '../services/gmail.js'
import { classifySendersBatch } from '../services/classifier.js'
import {
  cacheSenders,
  getCachedSenders,
  cacheClassifications,
  getCachedClassifications
} from '../services/cache.js'
import { useAuthStore } from './auth.js'
import { useSettingsStore } from './settings.js'

export const useEmailsStore = defineStore('emails', () => {
  const senders = ref([])
  const classifications = ref({})
  const loading = ref(false)
  const classifying = ref(false)
  const statusMessage = ref('')
  const error = ref(null)
  const fromCache = ref(false)
  const searchQuery = ref('')
  const categoryFilter = ref('')

  // Background sync state
  const syncing = ref(false)
  const syncProgress = ref(0)
  const syncPhase = ref('')
  const syncDetail = ref('')
  const deletedDuringSync = ref(new Set())

  let worker = null

  const filteredSenders = computed(() => {
    let result = senders.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
      )
    }
    if (categoryFilter.value) {
      result = result.filter(s =>
        classifications.value[s.email] === categoryFilter.value
      )
    }
    return result
  })

  const categories = computed(() => {
    const cats = new Set(Object.values(classifications.value))
    return [...cats].sort()
  })

  function filterDeletedDomains(sendersList) {
    if (deletedDuringSync.value.size === 0) return sendersList
    return sendersList.filter(s => !deletedDuringSync.value.has(s.domain))
  }

  function handleWorkerMessage(e) {
    const msg = e.data

    if (msg.type === 'progress') {
      syncPhase.value = msg.phase
      syncDetail.value = msg.detail
      syncProgress.value = msg.progress
    }

    if (msg.type === 'chunk') {
      senders.value = filterDeletedDomains(msg.senders)
      syncPhase.value = msg.phase
      syncDetail.value = msg.detail
      syncProgress.value = msg.progress
    }

    if (msg.type === 'done') {
      const auth = useAuthStore()
      senders.value = filterDeletedDomains(msg.senders)
      fromCache.value = false
      syncProgress.value = 100
      syncPhase.value = 'done'

      // Cache results
      cacheSenders(auth.user.uid, senders.value)
        .then(() => getCachedClassifications())
        .then(cachedClass => {
          if (Object.keys(cachedClass).length > 0) {
            classifications.value = cachedClass
          }
        })
        .finally(() => {
          setTimeout(() => {
            syncing.value = false
            syncPhase.value = ''
            deletedDuringSync.value.clear()
          }, 1500) // Keep "done" visible briefly
        })

      // Cleanup worker
      if (worker) {
        worker.terminate()
        worker = null
      }
    }

    if (msg.type === 'error') {
      error.value = msg.message
      syncing.value = false
      syncPhase.value = ''
      if (worker) {
        worker.terminate()
        worker = null
      }
    }
  }

  async function fetchEmails(forceRefresh = false) {
    const auth = useAuthStore()
    if (!auth.accessToken) return
    if (syncing.value) return // Prevent concurrent syncs

    error.value = null
    fromCache.value = false

    // Phase 1: Show cached data instantly
    loading.value = true
    if (!forceRefresh) {
      try {
        const cached = await getCachedSenders(auth.user.uid)
        if (cached && cached.length > 0) {
          senders.value = cached
          fromCache.value = true
          const cachedClass = await getCachedClassifications()
          if (Object.keys(cachedClass).length > 0) {
            classifications.value = cachedClass
          }
          loading.value = false
          return // Cache exists, don't auto-sync. User can click Refresh.
        }
      } catch (_) {
        // Cache read failed, continue to fresh fetch
      }
    }
    loading.value = false // Dashboard is now usable

    // Phase 2: Background sync via Web Worker (only on first load or manual refresh)
    syncing.value = true
    syncProgress.value = 0
    syncPhase.value = 'ids'
    syncDetail.value = '0'
    deletedDuringSync.value.clear()

    // Terminate previous worker if any
    if (worker) {
      worker.terminate()
    }

    worker = new Worker('/sync-worker.js')
    worker.onmessage = handleWorkerMessage
    worker.onerror = (err) => {
      error.value = err.message || 'Worker error'
      syncing.value = false
      worker = null
    }

    worker.postMessage({ type: 'sync', token: auth.accessToken })
  }

  async function classifyAllSenders() {
    const settings = useSettingsStore()
    if (!settings.apiKey) return

    classifying.value = true
    error.value = null

    try {
      // First, propagate existing classifications by domain
      const domainClassified = {}
      for (const [email, cat] of Object.entries(classifications.value)) {
        const domain = email.includes('@') ? email.split('@')[1] : email
        if (!domainClassified[domain]) domainClassified[domain] = cat
      }

      const toClassify = []
      const domainResults = {}
      for (const s of senders.value) {
        if (classifications.value[s.email]) continue
        if (domainClassified[s.domain]) {
          domainResults[s.email] = domainClassified[s.domain]
        } else {
          toClassify.push(s)
        }
      }

      if (Object.keys(domainResults).length > 0) {
        classifications.value = { ...classifications.value, ...domainResults }
        await cacheClassifications(domainResults)
      }

      if (toClassify.length === 0) return

      const seenDomains = new Set()
      const uniqueDomainSenders = []
      for (const s of toClassify) {
        if (!seenDomains.has(s.domain)) {
          seenDomains.add(s.domain)
          uniqueDomainSenders.push(s)
        }
      }

      const aiResults = await classifySendersBatch(
        settings.provider,
        settings.apiKey,
        uniqueDomainSenders,
        20,
        (current, total) => {
          statusMessage.value = `classifying:${current}:${total}`
        }
      )

      const finalResults = { ...aiResults }
      const domainMap = {}
      for (const [email, cat] of Object.entries(aiResults)) {
        const domain = email.includes('@') ? email.split('@')[1] : email
        domainMap[domain] = cat
      }
      for (const s of toClassify) {
        if (!finalResults[s.email] && domainMap[s.domain]) {
          finalResults[s.email] = domainMap[s.domain]
        }
      }

      classifications.value = { ...classifications.value, ...finalResults }
      await cacheClassifications(finalResults)
    } catch (e) {
      error.value = e.message
    } finally {
      classifying.value = false
      statusMessage.value = ''
    }
  }

  async function deleteAllFromSender(sender) {
    const auth = useAuthStore()
    await batchDeleteMessages(auth.accessToken, sender.messageIds)
    senders.value = senders.value.filter(s => s.email !== sender.email)
    if (syncing.value) {
      deletedDuringSync.value.add(sender.domain)
    }
  }

  async function blockSender(sender) {
    const auth = useAuthStore()
    // Block by domain to catch all variant addresses
    await gmailCreateFilter(auth.accessToken, { from: `@${sender.domain}` }, { removeLabelIds: ['INBOX'], addLabelIds: ['TRASH'] })
  }

  async function unsubscribe(sender) {
    if (sender.unsubscribeType === 'mailto') {
      const auth = useAuthStore()
      await sendEmail(auth.accessToken, sender.unsubscribeValue, 'Unsubscribe', 'Unsubscribe')
      return 'auto'
    } else if (sender.unsubscribeType === 'https') {
      window.open(sender.unsubscribeValue, '_blank')
      return 'manual'
    }
    return null
  }

  return {
    senders, classifications, loading, classifying, statusMessage, error,
    fromCache, searchQuery, categoryFilter, filteredSenders, categories,
    // Sync state
    syncing, syncProgress, syncPhase, syncDetail,
    // Actions
    fetchEmails, classifyAllSenders, deleteAllFromSender, blockSender, unsubscribe
  }
})
