const CATEGORIES = [
  'Spam', 'Promociones', 'Cursos', 'Personal',
  'Empresas', 'Newsletters', 'Redes Sociales', 'Otros'
]

export async function classifySenders(provider, apiKey, senders) {
  const sendersText = senders.map(s =>
    `- ${s.name} (${s.email}): ${s.subjects.slice(0, 3).join(', ')}`
  ).join('\n')

  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey, senders: sendersText })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Classification failed')
  }

  const data = await response.json()
  return parseCategoryResponse(data.content, senders)
}

function parseCategoryResponse(text, senders) {
  const results = {}
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.+)$/)
    if (match) {
      const email = match[1].trim().toLowerCase()
      const category = match[2].trim()
      if (CATEGORIES.includes(category)) {
        results[email] = category
      }
    }
  }

  for (const sender of senders) {
    if (!results[sender.email]) {
      results[sender.email] = 'Otros'
    }
  }

  return results
}

export async function classifySendersBatch(provider, apiKey, senders, batchSize = 20, onProgress) {
  const allResults = {}
  for (let i = 0; i < senders.length; i += batchSize) {
    const batch = senders.slice(i, i + batchSize)
    const results = await classifySenders(provider, apiKey, batch)
    Object.assign(allResults, results)
    if (onProgress) onProgress(Math.min(i + batchSize, senders.length), senders.length)
  }
  return allResults
}

export { CATEGORIES }
