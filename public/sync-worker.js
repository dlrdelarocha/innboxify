/**
 * Web Worker for background email sync.
 * Uses Gmail Batch API to minimize HTTP requests (100 messages per request).
 */

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'
const BATCH_URL = 'https://gmail.googleapis.com/batch/gmail/v1'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function gmailRequest(token, path) {
  const res = await fetch(`${GMAIL_BASE}${path}`, { headers: authHeaders(token) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Gmail API error: ${res.status}`)
  }
  return res.json()
}

/**
 * Gmail Batch API: send up to 100 individual requests in a single HTTP call.
 * Returns an array of parsed JSON responses (null for failed ones).
 */
async function gmailBatchGet(token, paths) {
  const boundary = 'batch_boundary_' + Date.now()

  // Build multipart body
  let body = ''
  for (const path of paths) {
    body += `--${boundary}\r\n`
    body += 'Content-Type: application/http\r\n\r\n'
    body += `GET /gmail/v1/users/me${path} HTTP/1.1\r\n\r\n`
  }
  body += `--${boundary}--\r\n`

  const res = await fetch(BATCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/mixed; boundary=${boundary}`
    },
    body
  })

  if (!res.ok) {
    throw new Error(`Batch API error: ${res.status}`)
  }

  const responseText = await res.text()

  // Parse multipart response
  const responseBoundary = res.headers.get('content-type').match(/boundary=(.+)/)?.[1]
  if (!responseBoundary) return paths.map(() => null)

  const parts = responseText.split('--' + responseBoundary).filter(p => p.trim() && p.trim() !== '--')

  return parts.map(part => {
    try {
      // Each part has HTTP headers then a blank line then the JSON body
      const jsonStart = part.indexOf('{')
      if (jsonStart === -1) return null
      const jsonEnd = part.lastIndexOf('}')
      if (jsonEnd === -1) return null
      return JSON.parse(part.substring(jsonStart, jsonEnd + 1))
    } catch {
      return null
    }
  })
}

function parseMessageMetadata(message) {
  const getHeader = (name) => {
    const h = message.payload?.headers?.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    )
    return h?.value || ''
  }

  const from = getHeader('From')
  const subject = getHeader('Subject')
  const unsubscribe = getHeader('List-Unsubscribe')

  const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s<]+@[^\s>]+)/)
  const email = emailMatch ? emailMatch[1].toLowerCase() : from.toLowerCase()
  const domain = email.includes('@') ? email.split('@')[1] : email
  const name = from.replace(/<[^>]+>/, '').trim().replace(/^"(.*)"$/, '$1') || email

  let unsubscribeType = null
  let unsubscribeValue = null
  if (unsubscribe) {
    const mailtoMatch = unsubscribe.match(/<mailto:([^>]+)>/)
    const httpsMatch = unsubscribe.match(/<(https?:[^>]+)>/)
    if (mailtoMatch) {
      unsubscribeType = 'mailto'
      unsubscribeValue = mailtoMatch[1]
    } else if (httpsMatch) {
      unsubscribeType = 'https'
      unsubscribeValue = httpsMatch[1]
    }
  }

  return { id: message.id, email, domain, name, subject, unsubscribeType, unsubscribeValue }
}

function mergeSenderChunk(existingSenders, newMessages) {
  const byDomain = {}
  const merged = existingSenders.map(s => ({
    ...s,
    messageIds: [...s.messageIds],
    emails: [...s.emails],
    subjects: [...s.subjects]
  }))
  merged.forEach(s => { byDomain[s.domain] = s })

  for (const msg of newMessages) {
    const parsed = parseMessageMetadata(msg)
    const key = parsed.domain
    if (byDomain[key]) {
      const group = byDomain[key]
      group.count++
      group.messageIds.push(parsed.id)
      if (!group.emails.includes(parsed.email)) group.emails.push(parsed.email)
      if (group.subjects.length < 5) group.subjects.push(parsed.subject)
      if (!group.unsubscribeType && parsed.unsubscribeType) {
        group.unsubscribeType = parsed.unsubscribeType
        group.unsubscribeValue = parsed.unsubscribeValue
      }
      if (parsed.name && parsed.name !== parsed.email && parsed.name.length < group.name.length) {
        group.name = parsed.name
      }
    } else {
      const newEntry = {
        email: parsed.domain,
        domain: parsed.domain,
        name: parsed.name,
        count: 1,
        messageIds: [parsed.id],
        subjects: [parsed.subject],
        emails: [parsed.email],
        unsubscribeType: parsed.unsubscribeType,
        unsubscribeValue: parsed.unsubscribeValue
      }
      merged.push(newEntry)
      byDomain[key] = newEntry
    }
  }

  return merged.sort((a, b) => b.count - a.count)
}

// --- Main sync logic ---

async function syncEmails(token) {
  try {
    // Phase 1: Fetch all message IDs
    self.postMessage({ type: 'progress', phase: 'ids', detail: '0', progress: 0 })

    const allIds = []
    let pageToken = null
    do {
      const params = new URLSearchParams({ maxResults: '500' })
      if (pageToken) params.set('pageToken', pageToken)
      const data = await gmailRequest(token, `/messages?${params}`)
      if (data.messages) {
        allIds.push(...data.messages.map(m => m.id))
      }
      pageToken = data.nextPageToken || null
      self.postMessage({
        type: 'progress',
        phase: 'ids',
        detail: String(allIds.length),
        progress: 0
      })
    } while (pageToken)

    if (allIds.length === 0) {
      self.postMessage({ type: 'done', senders: [] })
      return
    }

    // Phase 2: Fetch metadata using Batch API (100 per request)
    const batchSize = 100
    let senders = []
    let processed = 0
    const uiUpdateEvery = 200
    let lastUiUpdate = 0

    for (let i = 0; i < allIds.length; i += batchSize) {
      const batch = allIds.slice(i, i + batchSize)
      const paths = batch.map(id =>
        `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe`
      )

      const results = await gmailBatchGet(token, paths)
      const validResults = results.filter(r => r && r.payload)

      senders = mergeSenderChunk(senders, validResults)

      processed = Math.min(i + batchSize, allIds.length)
      const progress = Math.round((processed / allIds.length) * 100)
      const isLast = i + batchSize >= allIds.length

      // Throttle UI updates
      if (processed - lastUiUpdate >= uiUpdateEvery || isLast) {
        lastUiUpdate = processed
        self.postMessage({
          type: 'chunk',
          senders,
          progress,
          phase: 'metadata',
          detail: `${processed.toLocaleString()} / ${allIds.length.toLocaleString()}`
        })
      }
    }

    self.postMessage({ type: 'done', senders })

  } catch (err) {
    self.postMessage({ type: 'error', message: err.message })
  }
}

// Listen for messages from main thread
self.onmessage = (e) => {
  if (e.data.type === 'sync') {
    syncEmails(e.data.token)
  }
}
