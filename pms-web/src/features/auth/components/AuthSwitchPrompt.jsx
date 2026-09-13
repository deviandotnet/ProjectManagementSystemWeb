import { Link } from 'react-router-dom'

export function AuthSwitchPrompt({ label, linkLabel, to }) {
  return (
    <div className="flex items-center gap-4 pt-1 text-center text-sm text-auth-muted">
      <span aria-hidden="true" className="h-px flex-1 bg-auth-border" />
      <p>
        {label}{' '}
        <Link
          className="font-semibold text-auth-accent underline-offset-4 hover:underline"
          to={to}
        >
          {linkLabel}
        </Link>
      </p>
      <span aria-hidden="true" className="h-px flex-1 bg-auth-border" />
    </div>
  )
}
