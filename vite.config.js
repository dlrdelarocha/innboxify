import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

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

function apiProxyPlugin() {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/classify', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk
        const { provider, apiKey, senders } = JSON.parse(body)

        if (!apiKey || !senders) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing apiKey or senders' }))
          return
        }

        try {
          const content = await callProvider(provider || 'gemini', apiKey, PROMPT + senders)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content }))
        } catch (error) {
          res.statusCode = error.status || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message || 'API error' }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), apiProxyPlugin()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
