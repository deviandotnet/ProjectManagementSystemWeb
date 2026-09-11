import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../constants/routes.js'
import { NotFoundRoute, PlaceholderRoute } from './RoutePages.jsx'
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RootRedirect,
} from './RouteAccess.jsx'
import {
  LazyDashboard,
  LazyLoginPage,
  LazyRegister,
} from './RouteLazyPages.jsx'

export const routeDefinitions = [
  {
    path: routes.root,
    element: <RootRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: routes.login, element: <LazyLoginPage /> },
      { path: routes.register, element: <LazyRegister /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: routes.dashboard, element: <LazyDashboard /> },
      {
        path: routes.account,
        element: <PlaceholderRoute path={routes.account} title="Account" />,
      },
      {
        path: routes.project,
        element: (
          <PlaceholderRoute path={routes.project} title="Project workspace" />
        ),
      },
      {
        path: routes.projectSettings,
        element: (
          <PlaceholderRoute
            path={routes.projectSettings}
            title="Project settings"
          />
        ),
      },
      {
        path: routes.adminHolidays,
        element: (
          <PlaceholderRoute path={routes.adminHolidays} title="Holidays" />
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
]

export const applicationRouter = createBrowserRouter(routeDefinitions)
