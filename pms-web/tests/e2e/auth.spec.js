import { expect, test } from '@playwright/test'

const userId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

const accessToken = `${encode({ alg: 'none' })}.${encode({ sub: userId })}.signature`

async function mockSuccessfulLogin(page) {
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
  await expect(page.getByText('dashboard')).toBeVisible()
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

test('opens the registration route', async ({ page }) => {
  await page.goto('/login')

  await expect(
    page.getByText('Use the email linked to your account.'),
  ).toHaveCount(0)
  await expect(page.getByText('Enter at least 6 characters.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show password' })).toHaveCount(
    1,
  )

  await page.getByRole('link', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/register$/)
  await expect(page.getByText('register')).toBeVisible()
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
})
