import { expect, test } from '@playwright/test'

const userId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'
const projectId = 'b4a30c59-2092-40e0-a88f-d734a063fe04'
const categoryId = '9c4c080e-fdc4-47ab-8e5c-82844d091726'
const actionId = '541f1990-68d1-492c-93de-1ce4d73dcc68'
const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')
const accessToken = `${encode({ alg: 'none' })}.${encode({ sub: userId })}.signature`

const project = {
  id: projectId,
  name: 'Website redesign',
  description: 'Rebuild the public experience and design system.',
  startDate: '2026-09-01',
  endDate: '2026-12-15',
  weekStartDay: 1,
  defaultTimelineScale: 1,
  progressMode: 0,
  status: 1,
  createdByUserId: userId,
}
const progress = {
  projectId,
  projectName: project.name,
  progressMode: 0,
  progressModeLabel: 'Count based',
  progressPercent: 40,
  totalActionItems: 5,
  completedActionItems: 2,
  ongoingActionItems: 2,
  delayedActionItems: 1,
  plannedActionItems: 0,
  totalWeight: null,
  completedWeight: null,
}
const member = {
  memberId: '51d31cc8-0431-4994-8f4d-f4cb38132780',
  projectId,
  userId,
  firstName: 'Taylor',
  lastName: 'Kim',
  email: 'taylor@example.com',
  role: 2,
  joinedAt: '2026-09-01T00:00:00Z',
}
const category = {
  id: categoryId,
  projectId,
  name: 'Design phase',
  displayOrder: 10,
  color: '#C96A45',
  createdByUserId: userId,
}
const emptyCategories = [
  {
    ...category,
    id: '296822d8-d57b-42a8-8cfb-cb2ec8f8b0bb',
    name: 'Content',
    displayOrder: 20,
  },
  {
    ...category,
    id: '777c57bd-c3be-4dc4-a1c4-a42647e6dac6',
    name: 'Launch',
    displayOrder: 30,
  },
]
const action = {
  id: actionId,
  actionItemName: 'Responsive wireframes',
  categoryId,
  categoryName: category.name,
  subCategoryId: null,
  subCategoryName: null,
  priority: 2,
  ownerName: 'Taylor Kim',
  sequence: 10,
  plannedSchedule: {
    id: '74fb6ea9-772d-41ed-bff3-44b1bc11c393',
    plannedStartDate: '2026-09-08',
    plannedEndDate: '2026-09-18',
    plannedStartWeek: 'WW37',
    plannedEndWeek: 'WW38',
    durationCalendarDays: 11,
    durationWorkingDays: 9,
  },
  actualExecution: null,
  computedStatus: 4,
  computedStatusLabel: 'Completed on time',
  weight: null,
  remarks: 'Ready for review.',
}
const actionDetail = {
  ...action,
  description: 'Prepare responsive layouts for review.',
  ownerId: userId,
}
const pageEnvelope = (items) => ({
  items,
  pageNumber: 1,
  pageSize: 100,
  totalCount: items.length,
  totalPages: items.length ? 1 : 0,
  hasPreviousPage: false,
  hasNextPage: false,
})

async function mockWorkspace(page, populated) {
  await page.route('http://localhost:5141/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    if (['PUT', 'DELETE'].includes(route.request().method())) {
      await route.fulfill({ status: 204, body: '' })
      return
    }
    let body
    if (path.endsWith('/users/login'))
      body = { accessToken, refreshToken: 'refresh-token' }
    else if (path.endsWith(`/users/${userId}`))
      body = {
        id: userId,
        firstName: 'Taylor',
        lastName: 'Kim',
        email: member.email,
        systemRole: 2,
        isActive: true,
      }
    else if (path.endsWith('/dashboard'))
      body = {
        projects: [
          {
            projectId,
            projectName: project.name,
            status: 'Active',
            progressPercent: progress.progressPercent,
            totalActionItems: progress.totalActionItems,
            completedActionItems: 2,
            ongoingActionItems: 2,
            delayedActionItems: 1,
            plannedActionItems: 0,
            startDate: project.startDate,
            endDate: project.endDate,
            myRole: 'ProjectManager',
          },
        ],
        pageNumber: 1,
        pageSize: Number(url.searchParams.get('pageSize') || 6),
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    else if (path.endsWith(`/projects/${projectId}/progress`))
      body = populated
        ? progress
        : {
            ...progress,
            progressPercent: 0,
            totalActionItems: 0,
            completedActionItems: 0,
            ongoingActionItems: 0,
            delayedActionItems: 0,
            plannedActionItems: 0,
          }
    else if (path.endsWith(`/projects/${projectId}/members`))
      body = pageEnvelope([member])
    else if (path.endsWith(`/projects/${projectId}/categories/action-items`))
      body = {
        categories: populated ? [{ ...category, actionItems: [action] }] : [],
        pageNumber: 1,
        pageSize: 50,
        totalCount: populated ? 1 : 0,
        totalPages: populated ? 1 : 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    else if (path.endsWith(`/projects/${projectId}/categories`))
      body = pageEnvelope(populated ? [category, ...emptyCategories] : [])
    else if (path.endsWith(`/projects/${projectId}/action-items/${actionId}`))
      body = actionDetail
    else if (path.endsWith(`/projects/${projectId}`)) body = project
    else
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{}',
      })
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}

async function signIn(page) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill('taylor@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret1')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('opens a populated project and preserves register state across previews', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockWorkspace(page, true)
  await signIn(page)
  await page.locator('a[href="/projects"]:visible').click()
  await page.getByRole('link', { name: 'Open project' }).click()
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}$`))
  await expect(page.getByRole('heading', { name: project.name })).toBeVisible()
  await expect(
    page.getByText(action.actionItemName, { exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('table').getByText('Completed on time'),
  ).toBeVisible()
  await expect(page.getByRole('table').getByText('Content')).toBeVisible()
  await expect(page.getByRole('table').getByText('Launch')).toBeVisible()
  await expect(
    page.getByRole('table').getByText('0 items', { exact: true }),
  ).toHaveCount(2)
  await page.getByPlaceholder('Search Action Items').fill('wire')
  await page.getByRole('tab', { name: 'Timeline' }).click()
  await expect(page.getByText(/selected-range overlap/i)).toBeVisible()
  await page.getByRole('tab', { name: 'Action Items' }).click()
  await expect(page.getByPlaceholder('Search Action Items')).toHaveValue('wire')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1440)
  await page.screenshot({
    path: testInfo.outputPath('workspace-populated-desktop.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByRole('article').getByText(action.actionItemName, { exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
  await page.screenshot({
    path: testInfo.outputPath('workspace-populated-mobile.png'),
    fullPage: true,
  })
})

test('uses the compact register, date editor, category add row, and row menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockWorkspace(page, true)
  await signIn(page)
  await page.locator('a[href="/projects"]:visible').click()
  await page.getByRole('link', { name: 'Open project' }).click()
  await expect(page.getByRole('heading', { name: project.name })).toBeVisible()

  const table = page.getByRole('table')
  expect(await table.getByRole('columnheader').allTextContents()).toEqual([
    'Action Item',
    'Planned dates',
    'Actual dates',
    'Owner',
    'Priority',
    'Status',
    '',
  ])
  await expect(page.getByText(/SEQ 10/)).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Add Action Item' }),
  ).toHaveCount(3)
  await expect(
    page.getByRole('button', {
      name: `More options for ${action.actionItemName}`,
    }),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: `Edit planned dates for ${action.actionItemName}`,
    })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Edit planned dates' }),
  ).toBeVisible()
  await page.getByLabel('End date').fill('2026-09-20')
  const update = page.waitForRequest(
    (request) =>
      request.method() === 'PUT' &&
      request.url().endsWith(`/action-items/${actionId}`),
  )
  await page.getByRole('button', { name: 'Apply' }).click()
  const request = await update
  expect(request.postDataJSON()).toMatchObject({
    description: actionDetail.description,
    ownerId: userId,
    plannedEndDate: '2026-09-20',
  })

  await page
    .getByRole('button', { name: `More options for ${action.actionItemName}` })
    .click()
  await expect(
    page.getByRole('menuitem', { name: 'View details' }),
  ).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible()
})

test('renders the guided fresh-project state on desktop and mobile', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockWorkspace(page, false)
  await signIn(page)
  await page.locator('a[href="/projects"]:visible').click()
  await page.getByRole('link', { name: 'Open project' }).click()
  await expect(
    page.getByRole('heading', { name: 'Structure your first Action Items' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create first category' }),
  ).toBeEnabled()
  await page.screenshot({
    path: testInfo.outputPath('workspace-fresh-desktop.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
  await expect(
    page.getByRole('heading', { name: 'Structure your first Action Items' }),
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('workspace-fresh-mobile.png'),
    fullPage: true,
  })
})
