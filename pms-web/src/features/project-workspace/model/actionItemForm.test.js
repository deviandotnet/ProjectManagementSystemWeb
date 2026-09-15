import { describe, expect, it } from 'vitest'
import {
  actionItemToWritePayload,
  quickActionItemPayload,
} from './actionItemForm.js'

const detail = {
  id: 'item',
  categoryId: 'category',
  subCategoryId: null,
  actionItemName: 'Task',
  description: 'Keep me',
  priority: 1,
  ownerName: 'Owner',
  ownerId: 'owner',
  weight: 20,
  sequence: 4,
  remarks: 'Keep remarks',
  plannedSchedule: {
    plannedStartDate: '2026-01-01',
    plannedEndDate: '2026-01-10',
  },
  actualExecution: {
    actualStartDate: '2026-01-02',
    actualEndDate: null,
    actualHours: 2,
    delayReason: null,
  },
}

describe('Action Item payloads', () => {
  it('preserves unknown full-record fields during a date update', () => {
    expect(
      actionItemToWritePayload(detail, { plannedEndDate: '2026-01-12' }),
    ).toMatchObject({
      description: 'Keep me',
      ownerId: 'owner',
      remarks: 'Keep remarks',
      plannedEndDate: '2026-01-12',
    })
  })

  it('pins a quick item to its containing category', () => {
    const payload = quickActionItemPayload(
      {
        actionItemName: ' New task ',
        subCategoryId: '',
        priority: 2,
        ownerId: '',
        weight: '',
        sequence: 0,
        plannedStartDate: '2026-01-01',
        plannedEndDate: '2026-01-02',
        actualStartDate: '',
        actualEndDate: '',
      },
      'category-2',
      { progressMode: 0 },
      [],
    )
    expect(payload).toMatchObject({
      categoryId: 'category-2',
      actionItemName: 'New task',
      description: null,
    })
  })
})
