import type { Metadata } from 'next'
import { OwnerApprovalsPageClient } from './OwnerApprovalsPageClient'

export const metadata: Metadata = {
  title: 'Owner — Approvals',
  description: 'Pending owner decisions on lifecycle cases',
}

export default function OwnerApprovalsPage() {
  return <OwnerApprovalsPageClient />
}
