const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

function headers(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function request(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers(token), ...options.headers }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Gmail API error: ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

export async function listMessageIds(token, pageToken = null, maxResults = 500) {
  const params = new URLSearchParams({ maxResults: String(maxResults) })
  if (pageToken) params.set('pageToken', pageToken)
  return request(token, `/messages?${params}`)
}

export async function getMessage(token, messageId) {
  return request(token, `/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe`)
}

export async function fetchAllMessageIds(token, onProgress) {
  const allIds = []
  let pageToken = null
  let page = 0
  do {
    const data = await listMessageIds(token, pageToken)
    if (data.messages) {
      allIds.push(...data.messages.map(m => m.id))
    }
    pageToken = data.nextPageToken || null
    page++
    if (onProgress) onProgress(allIds.length, page)
  } while (pageToken)
  return allIds
}

export async function fetchMessagesMetadata(token, messageIds, onProgress) {
  const results = []
  const batchSize = 25
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(id => getMessage(token, id).catch(() => null))
    )
    results.push(...batchResults.filter(Boolean))
    if (onProgress) onProgress(results.length, messageIds.length)
  }
  return results
}

export function parseMessageMetadata(message) {
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

  return {
    id: message.id,
    email,
    domain,
    name,
    subject,
    unsubscribeType,
    unsubscribeValue
  }
}

export function groupBySender(messages) {
  const groups = {}
  for (const msg of messages) {
    const parsed = parseMessageMetadata(msg)
    const key = parsed.domain
    if (!groups[key]) {
      groups[key] = {
        email: parsed.domain,
        domain: parsed.domain,
        name: parsed.name,
        count: 0,
        messageIds: [],
        subjects: [],
        emails: new Set(),
        unsubscribeType: null,
        unsubscribeValue: null
      }
    }
    const group = groups[key]
    group.count++
    group.messageIds.push(parsed.id)
    group.emails.add(parsed.email)
    if (group.subjects.length < 5) {
      group.subjects.push(parsed.subject)
    }
    if (!group.unsubscribeType && parsed.unsubscribeType) {
      group.unsubscribeType = parsed.unsubscribeType
      group.unsubscribeValue = parsed.unsubscribeValue
    }
    // Keep the most common/readable name (shortest, non-email name)
    if (parsed.name && parsed.name !== parsed.email && parsed.name.length < group.name.length) {
      group.name = parsed.name
    }
  }
  // Convert email Sets to arrays for serialization
  return Object.values(groups)
    .map(g => ({ ...g, emails: [...g.emails] }))
    .sort((a, b) => b.count - a.count)
}

export async function batchDeleteMessages(token, messageIds) {
  const batchSize = 1000
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize)
    await request(token, '/messages/batchDelete', {
      method: 'POST',
      body: JSON.stringify({ ids: batch })
    })
  }
}

export async function sendEmail(token, to, subject = '', body = '') {
  const raw = btoa(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return request(token, '/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw })
  })
}

export async function listLabels(token) {
  const data = await request(token, '/labels')
  return data.labels || []
}

export async function createLabel(token, name, bgColor = '#4285f4', textColor = '#ffffff') {
  return request(token, '/labels', {
    method: 'POST',
    body: JSON.stringify({
      name,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
      color: { backgroundColor: bgColor, textColor }
    })
  })
}

export async function listFilters(token) {
  const data = await request(token, '/settings/filters')
  return data.filter || []
}

export async function createFilter(token, criteria, action) {
  return request(token, '/settings/filters', {
    method: 'POST',
    body: JSON.stringify({ criteria, action })
  })
}

export async function deleteFilter(token, filterId) {
  return request(token, `/settings/filters/${filterId}`, { method: 'DELETE' })
}
