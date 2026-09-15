import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('../pages/Dashboard.jsx'))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const Projects = lazy(() => import('../pages/Projects.jsx'))
const ProjectWorkspace = lazy(() => import('../pages/ProjectWorkspace.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))

function LazyPage({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

export function LazyDashboard() {
  return (
    <LazyPage>
      <Dashboard />
    </LazyPage>
  )
}

export function LazyLoginPage() {
  return (
    <LazyPage>
      <LoginPage />
    </LazyPage>
  )
}

export function LazyProjects() {
  return (
    <LazyPage>
      <Projects />
    </LazyPage>
  )
}

export function LazyProjectWorkspace() {
  return (
    <LazyPage>
      <ProjectWorkspace />
    </LazyPage>
  )
}

export function LazyRegister() {
  return (
    <LazyPage>
      <Register />
    </LazyPage>
  )
}
