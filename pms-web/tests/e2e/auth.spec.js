import { expect, test } from '@playwright/test'

const userId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

const accessToken = `${encode({ alg: 'none' })}.${encode({ sub: userId })}.signature`

const emptyDashboard = {
  projects: [],
  pageNumber: 1,
  pageSize: 100,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

function createDashboardProjects(count) {
  return Array.from({ length: count }, (_, index) => ({
    projectId: `b4a30c59-2092-40e0-a88f-${String(index + 1).padStart(12, '0')}`,
    projectName: `Project ${index + 1}`,
    status: 'Active',
    progressPercent: 40,
    totalActionItems: 8,
    completedActionItems: 3,
    ongoingActionItems: 3,
    delayedActionItems: 1,
    plannedActionItems: 1,
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    myRole: 'ProjectManager',
  }))
}

async function mockSuccessfulLogin(page, dashboard = emptyDashboard) {
  await page.route('**/api/users/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ accessToken, refreshToken: 'refresh-token' }),
    })
  })
  await page.route(`**/api/users/${userId}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        firstName: 'Taylor',
        middleName: null,
        lastName: 'Kim',
        email: 'taylor@example.com',
        systemRole: 2,
        isActive: true,
      }),
    })
  })
  await page.route('http://localhost:5141/api/dashboard*', async (route) => {
    const dashboardResponse =
      typeof dashboard === 'function' ? dashboard() : dashboard
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(dashboardResponse),
    })
  })
}

async function signIn(page) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill('taylor@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret1')
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function fillRegistrationForm(page) {
  await page.getByLabel('First name').fill('Taylor')
  await page.getByLabel('Last name').fill('Kim')
  await page.getByLabel('Email address').fill('taylor@example.com')
  await page.getByLabel('Password', { exact: true }).fill('secret1')
  await page.getByLabel('Confirm password').fill('secret1')
}

test('validates, signs in, and opens the dashboard', async ({ page }) => {
  await mockSuccessfulLogin(page)
  await page.goto('/login')

  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
  await expect(page.getByText('Enter your password.')).toBeVisible()

  await page.getByLabel('Email address').fill('taylor@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret1')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: 'Welcome to Workflow, Taylor' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Create your first project' }),
  ).toBeVisible()
  await expect(
    page.evaluate(() => localStorage.getItem('pms.auth.refresh-token')),
  ).resolves.toBe('refresh-token')
})

test('shows invalid credentials without revealing the failed field', async ({
  page,
}) => {
  await page.route('**/api/users/login', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ description: 'User not found' }),
    })
  })
  await page.goto('/login')

  await page.getByLabel('Email address').fill('wrong@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret1')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Email or password is incorrect.')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test('switches to the registration tab and validates its fields', async ({
  page,
}) => {
  await page.goto('/login')

  await expect(
    page.getByText('Use the email linked to your account.'),
  ).toHaveCount(0)
  await expect(page.getByText('Enter at least 6 characters.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show password' })).toHaveCount(
    1,
  )

  await page.getByRole('tab', { name: 'Create account' }).focus()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/register$/)
  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Create account' }),
  ).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Enter your first name.')).toBeVisible()
  await expect(page.getByText('Enter your last name.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
  await expect(page.getByText('Enter a password.')).toBeVisible()
  await expect(page.getByText('Confirm your password.')).toBeVisible()
})

test('registers an account and returns to prefilled sign in', async ({
  page,
}) => {
  let submittedBody
  await page.route('**/api/users', async (route) => {
    submittedBody = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify('7da8200f-6ecf-48df-9f12-1fa49e150f70'),
    })
  })
  await page.goto('/register')
  await fillRegistrationForm(page)

  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText('Account created.')).toBeVisible()
  await expect(page.getByLabel('Email address')).toHaveValue(
    'taylor@example.com',
  )
  expect(submittedBody).toEqual({
    firstName: 'Taylor',
    middleName: null,
    lastName: 'Kim',
    email: 'taylor@example.com',
    password: 'secret1',
  })
})

test('keeps the login form usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/login')

  await expect(
    page.getByRole('heading', { name: 'Sign in to your workspace' }),
  ).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  await page.getByRole('tab', { name: 'Create account' }).click()
  await expect(page.getByLabel('First name')).toBeVisible()
  await expect(page.getByLabel('Last name')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeVisible()
})

test('keeps the tabbed authentication layout usable at tablet width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1000 })
  await page.goto('/register')

  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Create account' }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('group', { name: 'Full name' })).toBeVisible()

  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(pageWidth).toBeLessThanOrEqual(820)
})

test('renders the populated dashboard responsively from API data', async ({
  page,
}) => {
  const dashboard = {
    projects: [
      {
        projectId: 'b4a30c59-2092-40e0-a88f-d734a063fe04',
        projectName: 'Website redesign',
        status: 'Active',
        progressPercent: 42,
        totalActionItems: 7,
        completedActionItems: 2,
        ongoingActionItems: 3,
        delayedActionItems: 1,
        plannedActionItems: 1,
        startDate: '2026-09-01',
        endDate: '2026-12-15',
        myRole: 'ProjectManager',
      },
    ],
    pageNumber: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockSuccessfulLogin(page, dashboard)
  await signIn(page)

  await expect(
    page.getByRole('heading', { name: 'Welcome back, Taylor' }),
  ).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByText('1 delayed')).toBeVisible()

  await page.setViewportSize({ width: 820, height: 1000 })
  const projectArticle = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Website redesign' }),
  })
  await expect(projectArticle).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(pageWidth).toBeLessThanOrEqual(390)
  await expect(projectArticle).toBeVisible()

  await page.setViewportSize({ width: 320, height: 800 })
  const narrowPageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(narrowPageWidth).toBeLessThanOrEqual(320)
})

test('renders the project gallery with backend-supported paging only', async ({
  page,
}) => {
  const project = {
    projectId: 'b4a30c59-2092-40e0-a88f-d734a063fe04',
    projectName: 'Website redesign',
    status: 'Active',
    progressPercent: 42,
    totalActionItems: 7,
    completedActionItems: 2,
    ongoingActionItems: 3,
    delayedActionItems: 1,
    plannedActionItems: 1,
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    myRole: 'ProjectManager',
  }
  const requestedDashboardUrls = []
  await page.on('request', (request) => {
    if (request.url().startsWith('http://localhost:5141/api/dashboard')) {
      requestedDashboardUrls.push(request.url())
    }
  })
  await mockSuccessfulLogin(page, {
    projects: [project],
    pageNumber: 1,
    pageSize: 6,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  await signIn(page)

  await page.locator('a[href="/projects"]:visible').click()

  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Website redesign' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Open project' }),
  ).toHaveAttribute('href', `/projects/${project.projectId}`)
  expect(requestedDashboardUrls).toContain(
    'http://localhost:5141/api/dashboard?pageNumber=1&pageSize=6',
  )
  expect(requestedDashboardUrls.some((url) => url.includes('search='))).toBe(
    false,
  )
  expect(requestedDashboardUrls.some((url) => url.includes('status='))).toBe(
    false,
  )
})

test('renders the projects empty state without project navigation', async ({
  page,
}) => {
  await mockSuccessfulLogin(page)
  await signIn(page)
  await page.locator('a[href="/projects"]:visible').click()

  await expect(
    page.getByRole('heading', { name: 'No projects yet' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Copy your account ID' }),
  ).toBeEnabled()
  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click()
  await expect(
    page.getByRole('dialog', { name: 'Create project' }),
  ).toBeVisible()
})

test('keeps the desktop sidebar viewport-bound while the document scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 })
  const projects = createDashboardProjects(6)
  await mockSuccessfulLogin(page, {
    projects,
    pageNumber: 1,
    pageSize: 6,
    totalCount: projects.length,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  await signIn(page)
  await page.locator('a[href="/projects"]:visible').click()

  const sidebar = page.locator('aside')
  await expect(sidebar).toBeVisible()

  const initialMetrics = await page.evaluate(() => ({
    documentIsPrimaryScroller:
      document.scrollingElement === document.documentElement,
    mainOverflowY: getComputedStyle(document.querySelector('main')).overflowY,
    pageHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))
  const initialSidebarBox = await sidebar.boundingBox()

  expect(initialMetrics.documentIsPrimaryScroller).toBe(true)
  expect(initialMetrics.mainOverflowY).toBe('visible')
  expect(initialMetrics.pageHeight).toBeGreaterThan(
    initialMetrics.viewportHeight,
  )
  expect(Math.round(initialSidebarBox.height)).toBe(
    initialMetrics.viewportHeight,
  )

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await expect
    .poll(async () => Math.abs((await sidebar.boundingBox()).y))
    .toBeLessThanOrEqual(1)

  await page.setViewportSize({ width: 1280, height: 240 })
  const shortViewportMetrics = await sidebar.evaluate((element) => ({
    clientHeight: element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
  }))

  expect(shortViewportMetrics.clientHeight).toBe(240)
  expect(shortViewportMetrics.overflowY).toBe('auto')
  expect(shortViewportMetrics.scrollHeight).toBeGreaterThan(
    shortViewportMetrics.clientHeight,
  )

  await sidebar.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(sidebar.getByRole('button', { name: 'Sign out' })).toBeVisible()

  // A 1280px desktop viewport at 200% browser zoom exposes 640 CSS pixels.
  await page.setViewportSize({ width: 640, height: 600 })
  await expect(sidebar).toBeHidden()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(640)

  await page.setViewportSize({ width: 768, height: 844 })
  await expect(sidebar).toBeVisible()
  await page.setViewportSize({ width: 767, height: 844 })
  await expect(sidebar).toBeHidden()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
})

test('creates a project with the shared date picker and refreshes the dashboard', async ({
  page,
}) => {
  const createdProjectId = 'b4a30c59-2092-40e0-a88f-d734a063fe04'
  let submittedBody
  let projectCreated = false
  const populatedDashboard = {
    ...emptyDashboard,
    projects: [
      {
        projectId: createdProjectId,
        projectName: 'Website redesign',
        status: 'Active',
        progressPercent: 0,
        totalActionItems: 0,
        completedActionItems: 0,
        ongoingActionItems: 0,
        delayedActionItems: 0,
        plannedActionItems: 0,
        startDate: '2026-11-02',
        endDate: '2027-01-29',
        myRole: 'ProjectManager',
      },
    ],
    totalCount: 1,
    totalPages: 1,
  }

  await mockSuccessfulLogin(page, () =>
    projectCreated ? populatedDashboard : emptyDashboard,
  )
  await page.route('**/api/projects', async (route) => {
    submittedBody = route.request().postDataJSON()
    projectCreated = true
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(createdProjectId),
    })
  })
  await signIn(page)

  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Create project' }),
  ).toBeVisible()
  await page.getByLabel('Project name').fill('Website redesign')
  await page.getByLabel('Description').fill('Refresh the public website.')

  await page.getByRole('textbox', { name: 'Start date' }).click()
  await page.locator('.react-datepicker__month-select').selectOption('10')
  await page.locator('.react-datepicker__year-select').selectOption('2026')
  await page
    .locator(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month)',
    )
    .filter({ hasText: /^2$/ })
    .click()

  await page.getByRole('textbox', { name: 'End date' }).click()
  await page.locator('.react-datepicker__year-select').selectOption('2027')
  await page.locator('.react-datepicker__month-select').selectOption('0')
  await page
    .locator(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month)',
    )
    .filter({ hasText: /^29$/ })
    .click()

  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click()

  await expect(page.getByText('Project created.')).toBeVisible()
  await expect(page.getByText('Website redesign').first()).toBeVisible()
  expect(submittedBody).toEqual({
    name: 'Website redesign',
    description: 'Refresh the public website.',
    startDate: '2026-11-02',
    endDate: '2027-01-29',
    weekStartDay: 1,
    defaultTimelineScale: 2,
    progressMode: 1,
  })
})

test('keeps the create project calendar inside a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockSuccessfulLogin(page)
  await signIn(page)

  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click()
  await page.getByRole('textbox', { name: 'Start date' }).click()

  const calendarBounds = await page
    .locator('.workflow-datepicker')
    .boundingBox()
  expect(calendarBounds.x).toBeGreaterThanOrEqual(0)
  expect(calendarBounds.x + calendarBounds.width).toBeLessThanOrEqual(390)
  await expect(
    page.getByRole('button', { name: 'Create project', exact: true }),
  ).toBeVisible()
})
