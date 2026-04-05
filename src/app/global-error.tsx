'use client'

/**
 * Cattura errori nel root layout. Deve definire <html> e <body> (App Router).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#0c0f14',
          color: '#f4f4f1',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Errore nell&apos;app</h1>
        <p style={{ marginTop: 12, opacity: 0.9, maxWidth: 520, lineHeight: 1.5 }}>
          {error.message || 'Errore sconosciuto'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            backgroundColor: '#5eead4',
            color: '#042f2e',
          }}
        >
          Riprova
        </button>
      </body>
    </html>
  )
}
