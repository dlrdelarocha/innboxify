export default function handler(req, res) {
  // This endpoint handles Firebase OAuth redirects
  // Firebase expects this endpoint to exist but doesn't actually need content
  // The redirect happens client-side via the SDK

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  // Return a minimal HTML page that just waits for Firebase to close it
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authenticating...</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5;">
      <div style="text-align: center;">
        <h1 style="color: #333; margin: 0 0 10px 0;">Authenticating...</h1>
        <p style="color: #666; margin: 0;">Please wait while we complete your authentication.</p>
      </div>
    </body>
    </html>
  `)
}
