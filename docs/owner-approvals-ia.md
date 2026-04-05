# Owner approvals — mapping (Sprint 6 / SPEC)

## Product (SPEC)

Owner home highlights **oversight**: unit status, tenancies, issues, **approvals**, activity. Approvals are decisions the owner must record before a manager proceeds (e.g. repair spend, policy exceptions).

## Data model (implemented)

| SPEC concept | Implementation |
|--------------|------------------|
| Approval request | `case_checklist_items` row with `assignee_role = 'owner'` on a `cases` row for the owner’s unit |
| Pending | Same row with `completed = false` |
| Approve action | Owner updates row to `completed = true` (RLS + trigger: only `completed` may change for non-managers) |
| History | Completed owner-assigned rows; surfaced in `/owner/approvals` “Recent history” |

## Seeded example

Repair cases (`case_type = repair`) include checklist item **“Secure owner approval if needed”** with `assignee_role = owner` (see `20260404250000_case_phases_checklist.sql`).

## Routes (owner)

| Route | Purpose |
|-------|---------|
| `/owner` | Overview, KPIs, previews |
| `/owner/approvals` | Pending + history, **Mark approved** |
| `/owner/units` | Unit index |
| `/owner/units/[unitId]` | Read-only unit + documents + cases list |
| `/owner/cases` | Case index |
| `/owner/cases/[caseId]` | Read-only case + approve owner-assigned checklist rows |

## Optional / not in MVP

- Dedicated `owner_approvals` table — **not** used; checklist is the source of truth.
- In-app toast — **not** implemented; banner on `/owner` when pending count &gt; 0.
- Owner writes timeline events — **not** implemented; manager timeline remains authoritative.
