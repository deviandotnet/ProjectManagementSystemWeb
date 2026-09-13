export function AuthFieldRow({ children, htmlFor, label }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:gap-4">
      <label
        className="text-sm font-medium text-auth-muted sm:pt-4"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
