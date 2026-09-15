import { describe, expect, it } from 'vitest'
import {
  canCreateInProject,
  getProjectCapabilities,
  getStatus,
  mergeRegisterCategories,
} from './workspaceModel.js'

describe('workspace model', () => {
  it.each([
    [0, 'Plan', 'plan'],
    [1, 'Ongoing', 'ongoing'],
    [2, 'Delayed', 'danger'],
    [3, 'Completed early', 'success'],
    [4, 'Completed on time', 'success'],
    [5, 'Completed late', 'warning'],
  ])(
    'maps server status %i to %s with its expected tone',
    (value, label, tone) => {
      expect(getStatus(value)).toMatchObject({ label, tone })
    },
  )
  it('keeps viewers read-only and allows system administrators', () => {
    const user = { id: 'user-1', systemRole: 1 }
    expect(
      canCreateInProject(user, [{ userId: 'user-1', role: 5 }]).allowed,
    ).toBe(false)
    expect(canCreateInProject({ ...user, systemRole: 2 }, []).allowed).toBe(
      true,
    )
  })
  it('separates edit and delete capabilities', () => {
    const user = { id: 'user-1', systemRole: 1 }
    const project = { createdByUserId: 'another-user' }
    expect(
      getProjectCapabilities(user, [{ userId: 'user-1', role: 4 }], project),
    ).toEqual({
      canEdit: true,
      canDelete: false,
    })
    expect(
      getProjectCapabilities(user, [{ userId: 'user-1', role: 3 }], project)
        .canDelete,
    ).toBe(true)
  })

  it('adds empty catalog categories to an unfiltered grouped register', () => {
    const groupedCategory = {
      id: 'category-1',
      name: 'Delivery',
      displayOrder: 20,
      actionItems: [{ id: 'item-1' }],
    }
    const result = mergeRegisterCategories(
      {
        categories: [groupedCategory],
        totalCount: 1,
      },
      [
        { id: 'category-1', name: 'Delivery', displayOrder: 20 },
        { id: 'category-2', name: 'Discovery', displayOrder: 10 },
        { id: 'category-3', name: 'Launch', displayOrder: 30 },
      ],
    )

    expect(result.categories).toEqual([
      expect.objectContaining({
        id: 'category-2',
        actionItems: [],
      }),
      groupedCategory,
      expect.objectContaining({
        id: 'category-3',
        actionItems: [],
      }),
    ])
    expect(result.totalCount).toBe(1)
  })
})
