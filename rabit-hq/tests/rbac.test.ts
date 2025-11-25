import { describe, it, expect } from 'vitest'
import { can } from '../lib/rbac'

type Role = 'FOUNDER' | 'FINANCE' | 'TECH' | 'OPERATIONS' | 'INVESTOR'

describe('RBAC.can', () => {
  const user = (role: Role) => ({ id: 'u1', role })

  it('denies when user is null', () => {
    expect(can(null, 'finance:read')).toBe(false)
  })

  it('FOUNDER can do anything', () => {
    expect(can(user('FOUNDER'), 'finance:write')).toBe(true)
    expect(can(user('FOUNDER'), 'phases:write')).toBe(true)
    // Unknown actions default to false even for founder unless handled separately
    expect(can(user('FOUNDER'), 'nonexistent:action')).toBe(false)
  })

  it('FINANCE can read/write finance but not phases:write', () => {
    expect(can(user('FINANCE'), 'finance:read')).toBe(true)
    expect(can(user('FINANCE'), 'finance:write')).toBe(true)
    expect(can(user('FINANCE'), 'phases:write')).toBe(false)
  })

  it('INVESTOR can read investor but not finance:write', () => {
    expect(can(user('INVESTOR'), 'investor:read')).toBe(true)
    expect(can(user('INVESTOR'), 'finance:write')).toBe(false)
  })

  it('TECH and OPERATIONS have scoped permissions', () => {
    expect(can(user('TECH'), 'phases:read')).toBe(true)
    expect(can(user('OPERATIONS'), 'phases:read')).toBe(true)
    expect(can(user('TECH'), 'finance:write')).toBe(false)
  })
})
