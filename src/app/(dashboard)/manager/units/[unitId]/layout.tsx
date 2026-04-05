import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unit detail',
  description: 'Unit state, tenancy, cases, and people.',
}

export default function ManagerUnitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
