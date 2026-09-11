import { describe, expect, it } from 'vitest'
import { cn } from './cn.js'

describe('cn', () => {
  it('combines conditional classes and resolves Tailwind conflicts', () => {
    const isHidden = false

    expect(cn('px-2', isHidden && 'hidden', ['px-4', 'font-medium'])).toBe(
      'px-4 font-medium',
    )
  })
})
