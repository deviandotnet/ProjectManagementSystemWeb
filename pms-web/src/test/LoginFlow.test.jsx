import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '../app/AppProviders.jsx'
import { createQueryClient } from '../app/queryClient.js'
import { routeDefinitions } from '../routes/router.jsx'
import { server } from './server.js'

const userId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

const accessToken = `${encode({ alg: 'none' })}.${encode({ sub: userId })}.signature`

function renderRoute(initialEntry = '/login') {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: [initialEntry],
  })

  render(
    <AppProviders
      client={createQueryClient()}
      router={router}
      showDevtools={false}
    />,
  )

  return router
}

function useSuccessfulLoginHandlers() {
  server.use(
    http.post('http://localhost:5141/api/users/login', () =>
      HttpResponse.json({ accessToken, refreshToken: 'refresh-token' }),
    ),
    http.get(`http://localhost:5141/api/users/${userId}`, () =>
      HttpResponse.json({
        id: userId,
        firstName: 'Taylor',
        middleName: null,
        lastName: 'Kim',
        email: 'taylor@example.com',
        systemRole: 2,
        isActive: true,
      }),
    ),
    http.get('http://localhost:5141/api/dashboard', () =>
      HttpResponse.json({
        projects: [],
        pageNumber: 1,
        pageSize: 100,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }),
    ),
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5141/api')
})

describe('login flow', () => {
  it('restores a persisted session before showing a protected route', async () => {
    localStorage.setItem('pms.auth.refresh-token', 'previous-refresh-token')
    server.use(
      http.post('http://localhost:5141/api/auth/refresh', () =>
        HttpResponse.json({
          accessToken,
          refreshToken: 'rotated-refresh-token',
        }),
      ),
      http.get(`http://localhost:5141/api/users/${userId}`, () =>
        HttpResponse.json({
          id: userId,
          firstName: 'Taylor',
          middleName: null,
          lastName: 'Kim',
          email: 'taylor@example.com',
          systemRole: 2,
          isActive: true,
        }),
      ),
      http.get('http://localhost:5141/api/dashboard', () =>
        HttpResponse.json({
          projects: [],
          pageNumber: 1,
          pageSize: 100,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        }),
      ),
    )

    renderRoute('/dashboard')

    expect(
      await screen.findByRole('heading', {
        name: 'Welcome to ProManage, Taylor',
      }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('pms.auth.refresh-token')).toBe(
      'rotated-refresh-token',
    )
  })

  it('clears an invalid persisted session and returns to login', async () => {
    localStorage.setItem('pms.auth.refresh-token', 'expired-refresh-token')
    server.use(
      http.post('http://localhost:5141/api/auth/refresh', () =>
        HttpResponse.json(
          { description: 'Refresh token is invalid' },
          { status: 400 },
        ),
      ),
    )

    renderRoute('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Sign in to your workspace' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('pms.auth.refresh-token')).toBeNull()
  })

  it('shows client validation without sending a request', async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Enter your email address.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  })

  it('signs in and navigates to the dashboard', async () => {
    useSuccessfulLoginHandlers()
    const user = userEvent.setup()
    const router = renderRoute()

    await user.type(
      await screen.findByLabelText('Email address'),
      'taylor@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'secret1')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Welcome to ProManage, Taylor',
      }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('shows a neutral message for invalid credentials', async () => {
    server.use(
      http.post('http://localhost:5141/api/users/login', () =>
        HttpResponse.json(
          {
            code: 'User.NotFoundByEmail',
            description: 'User not found',
            type: 2,
          },
          { status: 404 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderRoute()

    await user.type(
      await screen.findByLabelText('Email address'),
      'wrong@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'secret1')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Email or password is incorrect.'),
    ).toBeInTheDocument()
  })

  it('toggles password visibility and navigates to registration', async () => {
    const user = userEvent.setup()
    const router = renderRoute()
    const password = await screen.findByLabelText('Password')

    expect(
      screen.queryByText('Use the email linked to your account.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Enter at least 6 characters.'),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Show password' }),
    ).toHaveLength(1)
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('link', { name: 'Create account' }))
    expect(
      await screen.findByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/register')
  })
})
