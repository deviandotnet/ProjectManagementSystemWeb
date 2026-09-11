import { screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { AppProviders } from '../app/AppProviders.jsx'
import { createQueryClient } from '../app/queryClient.js'
import { routeDefinitions } from '../routes/router.jsx'

function renderRoute(initialEntry) {
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
}

describe('application foundation', () => {
  it('renders through the provider stack and redirects anonymous users to login', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', { name: 'Sign in to your workspace' }),
    ).toBeInTheDocument()
  })

  it('renders an unknown route fallback', async () => {
    renderRoute('/not-a-route')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
