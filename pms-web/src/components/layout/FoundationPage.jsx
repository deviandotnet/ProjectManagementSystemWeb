import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'

export function FoundationPage({ title, description }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-muted p-6 text-ink">
      <section className="w-full max-w-2xl rounded-xl border border-border bg-surface p-8">
        <ConstructionOutlinedIcon aria-hidden="true" color="primary" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">
          Project Management System
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-prose text-base leading-7 text-ink-muted">
          {description}
        </p>
      </section>
    </main>
  )
}
