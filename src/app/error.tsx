'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-app text-primary">
      <h1 className="font-display text-xl font-semibold text-center">Si è verificato un errore</h1>
      <p className="text-secondary text-sm text-center max-w-md break-words">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="text-primary underline underline-offset-4 text-sm font-medium"
      >
        Riprova
      </button>
    </div>
  )
}
