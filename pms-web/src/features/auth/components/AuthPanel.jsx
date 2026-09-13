import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, useLocation } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'

const tabItems = [
  { label: 'Sign in', path: routes.login, icon: LoginOutlinedIcon },
  {
    label: 'Create account',
    path: routes.register,
    icon: PersonOutlineOutlinedIcon,
  },
]

export function AuthPanel({ children }) {
  const location = useLocation()
  const activeTab =
    location.pathname === routes.register ? routes.register : routes.login
  const registrationComplete =
    activeTab === routes.login && location.state?.registrationComplete === true

  return (
    <section className="overflow-hidden rounded-2xl border border-auth-border bg-auth-surface shadow-[0_1.5rem_4rem_rgba(8,47,45,0.10)]">
      {registrationComplete ? (
        <div className="px-5 pt-5 sm:px-8 sm:pt-7">
          <Alert aria-live="polite" severity="success">
            <strong>Account created.</strong> Sign in to continue.
          </Alert>
        </div>
      ) : null}

      <nav aria-label="Authentication">
        <Tabs
          aria-label="Sign in or create an account"
          centered
          value={activeTab}
          variant="fullWidth"
        >
          {tabItems.map(({ label, path, icon: Icon }) => (
            <Tab
              aria-current={activeTab === path ? 'page' : undefined}
              component={Link}
              icon={<Icon aria-hidden="true" fontSize="small" />}
              iconPosition="start"
              key={path}
              label={label}
              to={path}
              value={path}
            />
          ))}
        </Tabs>
      </nav>

      <div className="border-t border-auth-border px-5 py-7 sm:px-8 sm:py-8 lg:px-9">
        {children}
      </div>
    </section>
  )
}
