import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProjectGalleryPage } from '../api/projectGalleryService.js'

export const projectGalleryKeys = Object.freeze({
  all: ['project-gallery'],
  page: (pageNumber, pageSize) => [
    'project-gallery',
    'page',
    { pageNumber, pageSize },
  ],
})

export function useProjectGallery(pageNumber, pageSize) {
  return useQuery({
    queryKey: projectGalleryKeys.page(pageNumber, pageSize),
    queryFn: ({ signal }) =>
      getProjectGalleryPage({ pageNumber, pageSize }, signal),
    placeholderData: keepPreviousData,
  })
}
