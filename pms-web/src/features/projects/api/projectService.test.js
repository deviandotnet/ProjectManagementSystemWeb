import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient.js'
import { ApiError } from '../../../services/apiError.js'
import { createProject, parseCreateProjectResponse } from './projectService.js'

vi.mock('../../../services/apiClient.js', () => ({
  apiClient: { post: vi.fn() },
}))

const projectId = '7da8200f-6ecf-48df-9f12-1fa49e150f70'
const input = {
  name: 'Website redesign',
  description: null,
  startDate: '2026-09-14',
  endDate: '2026-10-14',
  weekStartDay: 1,
  defaultTimelineScale: 2,
  progressMode: 1,
}

beforeEach(() => {
  apiClient.post.mockReset()
})

describe('project service', () => {
  it('parses a UUID response and rejects malformed data', () => {
    expect(parseCreateProjectResponse(projectId)).toBe(projectId)
    expect(() => parseCreateProjectResponse({ id: projectId })).toThrowError(
      ApiError,
    )
  })

  it('posts the exact payload and forwards the abort signal', async () => {
    const controller = new AbortController()
    apiClient.post.mockResolvedValue({ data: projectId })

    await expect(createProject(input, controller.signal)).resolves.toBe(
      projectId,
    )
    expect(apiClient.post).toHaveBeenCalledWith('/projects', input, {
      signal: controller.signal,
    })
  })

  it('normalizes unreachable server failures', async () => {
    apiClient.post.mockRejectedValue(new Error('offline'))

    await expect(createProject(input)).rejects.toMatchObject({
      kind: 'network',
    })
  })

  it.each([
    [409, 'duplicate-project'],
    [429, 'rate-limit'],
  ])('maps an HTTP %s project failure', async (status, kind) => {
    apiClient.post.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {},
        headers: { 'retry-after': '30' },
        status,
      },
    })

    await expect(createProject(input)).rejects.toMatchObject({ kind, status })
  })
})
