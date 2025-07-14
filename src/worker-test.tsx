export default {
  async fetch(request: Request) {
    console.log('[Worker Test] Received request:', request.url)
    
    const url = new URL(request.url)
    
    if (url.pathname === '/') {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Worker is responding!</h1>
  <p>Path: ${url.pathname}</p>
  <p>Time: ${new Date().toISOString()}</p>
</body>
</html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    return new Response('Not found', { status: 404 })
  }
}