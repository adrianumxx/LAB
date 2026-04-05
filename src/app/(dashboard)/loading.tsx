export default function DashboardLoading() {
  return (
    <div
      className="py-10 space-y-4 max-w-3xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="h-8 w-48 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      <div className="h-4 w-full max-w-xl rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 pt-4">
        <div className="h-32 rounded-lg border border-border bg-surface animate-pulse" />
        <div className="h-32 rounded-lg border border-border bg-surface animate-pulse" />
      </div>
    </div>
  )
}
