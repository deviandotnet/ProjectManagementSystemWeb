export const routes = Object.freeze({
  root: '/',
  login: '/login',
  register: '/register',
  account: '/account',
  dashboard: '/dashboard',
  project: '/projects/:projectId',
  projectSettings: '/projects/:projectId/settings',
  adminHolidays: '/admin/holidays',
})

export function projectRoute(projectId) {
  return `/projects/${encodeURIComponent(projectId)}`
}

export function projectSettingsRoute(projectId) {
  return `${projectRoute(projectId)}/settings`
}
