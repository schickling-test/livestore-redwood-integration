export default function TodoPageDebug() {
  console.log('[TodoPageDebug] Rendering on:', typeof window !== 'undefined' ? 'client' : 'server')
  
  return (
    <div>
      <h1>LiveStore SSR Debug</h1>
      <p>Environment: {typeof window !== 'undefined' ? 'Client' : 'Server'}</p>
      <p>Global APIs available:</p>
      <ul>
        <li>window: {typeof window !== 'undefined' ? '✓' : '✗'}</li>
        <li>document: {typeof document !== 'undefined' ? '✓' : '✗'}</li>
        <li>Worker: {typeof Worker !== 'undefined' ? '✓' : '✗'}</li>
        <li>SharedWorker: {typeof SharedWorker !== 'undefined' ? '✓' : '✗'}</li>
        <li>crypto: {typeof crypto !== 'undefined' ? '✓' : '✗'}</li>
      </ul>
    </div>
  )
}