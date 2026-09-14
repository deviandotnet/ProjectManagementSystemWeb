import { useMutation } from '@tanstack/react-query'
import { createProject } from '../api/projectService.js'

export function useCreateProject() {
  return useMutation({
    mutationFn: (input) => createProject(input),
    retry: 0,
  })
}
