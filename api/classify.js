const PROMPT = `Classify each email sender into exactly ONE of these categories: Spam, Promociones, Cursos, Personal, Empresas, Newsletters, Redes Sociales, Otros.

Reply with ONLY lines in format: email@example.com: Category

Senders:
`

async function callProvider(provider, apiKey, prompt) {
  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw { status: response.status, message: err.error?.message || 'Anthropic API error' }
    }
    const data = await response.json()
    return data.content?.[0]?.text || ''
  }

  if (provider === 'openrouter') {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw { status: response.status, message: err.error?.message || 'OpenRouter API error' }
    }
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  // Default: gemini
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw { status: response.status, message: err.error?.message || 'Gemini API error' }
  }
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { provider, apiKey, senders } = req.body
  if (!apiKey || !senders) {
    return res.status(400).json({ error: 'Missing apiKey or senders' })
  }

  try {
    const content = await callProvider(provider || 'gemini', apiKey, PROMPT + senders)
    return res.status(200).json({ content })
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'API error' })
  }
}
