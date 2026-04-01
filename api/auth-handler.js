export default function handler(req, res) {
  // This endpoint handles Firebase OAuth redirects
  // It serves the necessary files for the OAuth flow to complete

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Firebase Authentication</title>
      <script src="https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js"></script>
      <script src="https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js"></script>
    </head>
    <body>
      <p>Processing authentication...</p>
      <script>
        // Firebase will automatically handle the OAuth flow
        // This page serves as the redirect target
      </script>
    </body>
    </html>
  `)
}
