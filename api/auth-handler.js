/**
 * Firebase OAuth Handler for Vercel
 *
 * This endpoint intercepts Firebase OAuth redirects from /__/auth/*
 * Firebase SDK expects this to be a page that can close itself
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  // Return HTML that Firebase SDK can communicate with
  // This page will signal to Firebase to complete the OAuth flow
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Autenticando...</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h1>Autenticando...</h1>
        <p>Por favor espera...</p>
      </div>
      <script>
        // Signal to Firebase that this page is ready
        // Firebase SDK will detect this and complete the auth flow
        if (window.opener && window.opener !== window) {
          // This is a popup - close it (shouldn't happen with redirect)
          window.close();
        } else {
          // This is a redirect - wait for Firebase SDK to process
          window.addEventListener('load', function() {
            // Give Firebase SDK time to process the redirect
            // Then redirect back to the app
            setTimeout(function() {
              var redirect = new URL(window.location.href).searchParams.get('redirectUrl');
              if (redirect) {
                window.location.href = redirect;
              } else {
                window.location.href = '/';
              }
            }, 100);
          });
        }
      </script>
    </body>
    </html>
  `)
}

