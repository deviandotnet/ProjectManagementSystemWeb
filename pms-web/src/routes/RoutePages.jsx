import { useRouteError } from 'react-router-dom'
import { FoundationPage } from '../components/layout/FoundationPage.jsx'
import { routes } from '../constants/routes.js'

const pageDescriptions = {
  [routes.login]:
    'Authentication wiring will be implemented with the login feature.',
  [routes.register]:
    'Account registration will be implemented with the authentication feature.',
  [routes.account]: 'The signed-in account profile will be available here.',
  [routes.dashboard]:
    'Project summaries and progress indicators will be available here.',
  [routes.project]:
    'Action Items and Timeline views will share this project workspace.',
  [routes.projectSettings]:
    'Authorized project configuration will be available here.',
  [routes.adminHolidays]: 'System administrators will manage holidays here.',
}

export function PlaceholderRoute({ title, path }) {
  return <FoundationPage description={pageDescriptions[path]} title={title} />
}

export function NotFoundRoute() {
  const error = useRouteError()

  return (
    <FoundationPage
      description={error?.statusText ?? 'The requested page does not exist.'}
      title="Page not found"
    />
  )
}
