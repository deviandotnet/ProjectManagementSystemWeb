import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { dashboardKeys } from '../../dashboard/index.js'
import { projectGalleryKeys } from '../../projects/index.js'
import {
  createActionItem,
  createCategory,
  createSubCategory,
  deleteActionItem,
  getActionItem,
  getAllCategories,
  getAllProjectMembers,
  getAllSubCategories,
  getGroupedActionItems,
  getProject,
  getProjectProgress,
  updateActionItem,
} from '../api/projectWorkspaceService.js'

export const projectWorkspaceKeys = {
  all: ['project-workspace'],
  project: (id) => ['project-workspace', id, 'project'],
  progress: (id) => ['project-workspace', id, 'progress'],
  members: (id) => ['project-workspace', id, 'members'],
  categories: (id) => ['project-workspace', id, 'categories'],
  subCategories: (id) => ['project-workspace', 'category', id, 'subcategories'],
  grouped: (id, filters) => ['project-workspace', id, 'action-items', filters],
  actionItem: (projectId, id) => [
    'project-workspace',
    projectId,
    'action-item',
    id,
  ],
}

export function useProjectWorkspace(projectId, filters) {
  const enabled = Boolean(projectId)
  return {
    project: useQuery({
      queryKey: projectWorkspaceKeys.project(projectId),
      queryFn: ({ signal }) => getProject(projectId, signal),
      enabled,
    }),
    progress: useQuery({
      queryKey: projectWorkspaceKeys.progress(projectId),
      queryFn: ({ signal }) => getProjectProgress(projectId, signal),
      enabled,
    }),
    members: useQuery({
      queryKey: projectWorkspaceKeys.members(projectId),
      queryFn: ({ signal }) => getAllProjectMembers(projectId, signal),
      enabled,
    }),
    categories: useQuery({
      queryKey: projectWorkspaceKeys.categories(projectId),
      queryFn: ({ signal }) => getAllCategories(projectId, signal),
      enabled,
    }),
    grouped: useQuery({
      queryKey: projectWorkspaceKeys.grouped(projectId, filters),
      queryFn: ({ signal }) =>
        getGroupedActionItems(projectId, filters, signal),
      enabled,
      placeholderData: keepPreviousData,
    }),
  }
}

export function useSubCategories(categoryId) {
  return useQuery({
    queryKey: projectWorkspaceKeys.subCategories(categoryId),
    queryFn: ({ signal }) => getAllSubCategories(categoryId, signal),
    enabled: Boolean(categoryId),
  })
}

export function useActionItem(projectId, actionItemId) {
  return useQuery({
    queryKey: projectWorkspaceKeys.actionItem(projectId, actionItemId),
    queryFn: ({ signal }) => getActionItem(projectId, actionItemId, signal),
    enabled: Boolean(projectId && actionItemId),
  })
}

export function useWorkspaceMutations(projectId) {
  const client = useQueryClient()
  const refresh = async ({ categories = false, categoryId } = {}) => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: projectWorkspaceKeys.grouped(projectId, {}),
        exact: false,
      }),
      client.invalidateQueries({
        queryKey: projectWorkspaceKeys.progress(projectId),
      }),
      client.invalidateQueries({ queryKey: dashboardKeys.all }),
      client.invalidateQueries({ queryKey: projectGalleryKeys.all }),
      categories
        ? client.invalidateQueries({
            queryKey: projectWorkspaceKeys.categories(projectId),
          })
        : Promise.resolve(),
      categoryId
        ? client.invalidateQueries({
            queryKey: projectWorkspaceKeys.subCategories(categoryId),
          })
        : Promise.resolve(),
    ])
  }
  return {
    createCategory: useMutation({
      mutationFn: (body) => createCategory(projectId, body),
      onSuccess: () => refresh({ categories: true }),
    }),
    createSubCategory: useMutation({
      mutationFn: ({ categoryId, body }) => createSubCategory(categoryId, body),
      onSuccess: (_, variables) =>
        refresh({ categoryId: variables.categoryId }),
    }),
    createActionItem: useMutation({
      mutationFn: (body) => createActionItem(projectId, body),
      onSuccess: () => refresh(),
    }),
    updateActionItem: useMutation({
      mutationFn: ({ actionItemId, body, signal }) =>
        updateActionItem(projectId, actionItemId, body, signal),
      onSuccess: async (_, variables) => {
        await client.invalidateQueries({
          queryKey: projectWorkspaceKeys.actionItem(
            projectId,
            variables.actionItemId,
          ),
        })
        await refresh()
      },
    }),
    deleteActionItem: useMutation({
      mutationFn: ({ actionItemId, signal }) =>
        deleteActionItem(projectId, actionItemId, signal),
      onSuccess: async (_, variables) => {
        client.removeQueries({
          queryKey: projectWorkspaceKeys.actionItem(
            projectId,
            variables.actionItemId,
          ),
        })
        await refresh()
      },
    }),
  }
}
