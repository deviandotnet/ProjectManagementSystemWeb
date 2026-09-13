import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '../app/AppProviders.jsx'
import { createQueryClient } from '../app/queryClient.js'
import { routeDefinitions } from '../routes/router.jsx'
import { server } from './server.js'

const accountId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'

function renderRegistration() {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/register'],
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

async function completeRegistrationForm(user) {
  await user.type(await screen.findByLabelText('First name'), 'Taylor')
  await user.type(screen.getByLabelText('Last name'), 'Kim')
  await user.type(screen.getByLabelText('Email address'), 'taylor@example.com')
  await user.type(screen.getByLabelText('Password'), 'secret1')
  await user.type(screen.getByLabelText('Confirm password'), 'secret1')
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5141/api')
})

describe('registration flow', () => {
  it('exposes route-backed authentication tabs', async () => {
    const user = userEvent.setup()
    const router = renderRegistration()

    expect(
      await screen.findByRole('tab', { name: 'Create account' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Sign in' })).toHaveAttribute(
      'aria-selected',
      'false',
    )

    await user.click(screen.getByRole('tab', { name: 'Sign in' }))
    expect(router.state.location.pathname).toBe('/login')
  })

  it('validates registration before sending a request', async () => {
    const requestSpy = vi.fn()
    server.use(
      http.post('http://localhost:5141/api/users', () => {
        requestSpy()
        return HttpResponse.json(accountId, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderRegistration()

    await user.click(
      await screen.findByRole('button', { name: 'Create account' }),
    )

    expect(
      await screen.findByText('Enter your first name.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Enter your last name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a password.')).toBeInTheDocument()
    expect(screen.getByText('Confirm your password.')).toBeInTheDocument()
    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('sends the backend contract and returns to a prefilled sign-in form', async () => {
    let requestBody
    server.use(
      http.post('http://localhost:5141/api/users', async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json(accountId, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const router = renderRegistration()
    await completeRegistrationForm(user)

    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(requestBody).toBeDefined())
    expect(await screen.findByText('Account created.')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'taylor@example.com',
    )
    expect(router.state.location.pathname).toBe('/login')
    expect(requestBody).toEqual({
      firstName: 'Taylor',
      middleName: null,
      lastName: 'Kim',
      email: 'taylor@example.com',
      password: 'secret1',
    })
  })

  it('prevents duplicate registration submissions', async () => {
    let releaseRequest
    let requestCount = 0
    const pendingRequest = new Promise((resolve) => {
      releaseRequest = resolve
    })
    server.use(
      http.post('http://localhost:5141/api/users', async () => {
        requestCount += 1
        await pendingRequest
        return HttpResponse.json(accountId, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderRegistration()
    await completeRegistrationForm(user)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.click(submitButton)
    await waitFor(() => expect(requestCount).toBe(1))
    expect(submitButton).toBeDisabled()
    submitButton.click()
    expect(requestCount).toBe(1)

    releaseRequest()
    expect(await screen.findByText('Account created.')).toBeInTheDocument()
  })

  it('shows duplicate-email and rate-limit failures', async () => {
    let attempt = 0
    server.use(
      http.post('http://localhost:5141/api/users', () => {
        attempt += 1
        return attempt === 1
          ? HttpResponse.json(
              { description: 'The email is already registered.' },
              { status: 409 },
            )
          : HttpResponse.json(
              { title: 'Too Many Requests' },
              { status: 429, headers: { 'Retry-After': '30' } },
            )
      }),
    )
    const user = userEvent.setup()
    renderRegistration()
    await completeRegistrationForm(user)

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(
      await screen.findByText(
        'An account with this email already exists. Sign in instead.',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(
      await screen.findByText(
        'Too many account creation attempts. Wait a moment and try again.',
      ),
    ).toBeInTheDocument()
  })

  it('shows a recoverable network failure', async () => {
    server.use(
      http.post('http://localhost:5141/api/users', () => HttpResponse.error()),
    )
    const user = userEvent.setup()
    renderRegistration()
    await completeRegistrationForm(user)

    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText(
        'Unable to reach the server. Check your connection and try again.',
      ),
    ).toBeInTheDocument()
  })
})
