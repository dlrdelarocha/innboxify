/**
 * Firebase OAuth Handler for Vercel
 *
 * This endpoint intercepts Firebase OAuth redirects from /__/auth/*
 * It returns a minimal HTML page that allows Firebase SDK to complete the flow
 *
 * IMPORTANT:
 * - Do NOT load Firebase SDK again (causes module errors)
 * - Do NOT use import/export statements
 * - Do NOT process OAuth here (Firebase SDK handles it client-side)
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  // Minimal HTML that allows Firebase to complete redirect flow
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Autenticando...</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-width: 400px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        p {
          color: #666;
          font-size: 0.95rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h1>Autenticando...</h1>
        <p>Por favor espera mientras completamos tu autenticación.</p>
      </div>
    </body>
    </html>
  `)
}

