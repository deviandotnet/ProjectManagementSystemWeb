import { useAuth } from '../context/authContextDefinition.js'
import {
  DashboardPresentation,
  useDashboard,
} from '../features/dashboard/index.js'

export default function Dashboard() {
  const { logout, user } = useAuth()
  const dashboard = useDashboard()

  return (
    <DashboardPresentation
      data={dashboard.data}
      error={dashboard.error}
      firstName={user?.firstName ?? 'there'}
      isError={dashboard.isError}
      isLoading={dashboard.isLoading}
      onLogout={logout}
      onRetry={dashboard.refetch}
    />
  )
}
