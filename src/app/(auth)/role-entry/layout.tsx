import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Choose your role',
  description: 'Select manager, owner, or tenant to continue.',
}

export default function RoleEntryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
