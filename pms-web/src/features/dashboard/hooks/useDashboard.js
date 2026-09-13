import { useQuery } from '@tanstack/react-query'
import {
  DASHBOARD_PAGE_SIZE,
  getDashboardSnapshot,
} from '../api/dashboardService.js'

export const dashboardKeys = Object.freeze({
  all: ['dashboard'],
  snapshot: () => ['dashboard', 'snapshot', { pageSize: DASHBOARD_PAGE_SIZE }],
})

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.snapshot(),
    queryFn: ({ signal }) => getDashboardSnapshot(signal),
  })
}
