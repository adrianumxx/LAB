export default function RootLoading() {
  return (
    <div
      className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-10 w-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      <p className="text-sm text-secondary">Loading…</p>
    </div>
  )
}
