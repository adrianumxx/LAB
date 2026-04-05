import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case detail',
  description: 'Lifecycle case, checklist, documents, and timeline.',
}

export default function ManagerCaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
