import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/queryClient.js'
import { CreateProjectDialog } from './CreateProjectDialog.jsx'

function renderDialog(props = {}) {
  const onClose = vi.fn()
  const onCreated = vi.fn()

  render(
    <QueryClientProvider client={createQueryClient()}>
      <CreateProjectDialog
        onClose={onClose}
        onCreated={onCreated}
        open
        {...props}
      />
    </QueryClientProvider>,
  )

  return { onClose, onCreated }
}

describe('CreateProjectDialog', () => {
  it('renders the reference fields and backend defaults', () => {
    renderDialog()

    expect(
      screen.getByRole('heading', { name: 'Create project' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Create project' }),
    ).toHaveAccessibleDescription(
      'Set the project schedule and working defaults.',
    )
    expect(
      screen.getByRole('textbox', { name: /Project name/ }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Start date/ })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: /End date/ })).toHaveValue('')
    expect(
      screen.getByRole('combobox', { name: 'Week starts on' }),
    ).toHaveTextContent('Monday')
    expect(
      screen.getByRole('combobox', { name: 'Default timeline scale' }),
    ).toHaveTextContent('Weekly')
    expect(
      screen.getByRole('combobox', { name: 'Progress mode' }),
    ).toHaveTextContent('Count based')
  })

  it('blocks invalid submission and supports cancellation', async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Create project' }))

    expect(await screen.findByText('Enter a project name.')).toBeInTheDocument()
    expect(screen.getByText('Select the start date.')).toBeInTheDocument()
    expect(screen.getByText('Select the end date.')).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
