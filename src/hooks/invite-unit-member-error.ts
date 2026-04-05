export class InviteUnitMemberError extends Error {
  readonly hint?: string

  constructor(message: string, hint?: string) {
    super(message)
    this.name = 'InviteUnitMemberError'
    this.hint = hint
  }
}
