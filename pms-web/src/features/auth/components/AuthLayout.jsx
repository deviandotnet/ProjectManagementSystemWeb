import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined'

const benefits = [
  {
    title: 'Clear ownership',
    description: 'Assign work and keep responsibility visible.',
    icon: Groups2OutlinedIcon,
  },
  {
    title: 'Visible schedules',
    description: 'Turn project plans into shared timelines.',
    icon: CalendarMonthOutlinedIcon,
  },
  {
    title: 'Accountable delivery',
    description: 'Track progress against measurable outcomes.',
    icon: QueryStatsOutlinedIcon,
  },
]

export function AuthLayout({ children }) {
  return (
    <main className="grid min-h-[100dvh] bg-auth-canvas text-auth-ink lg:grid-cols-[minmax(22rem,0.78fr)_minmax(36rem,1.22fr)]">
      <section className="relative overflow-hidden bg-auth-brand px-6 py-7 text-auth-brand-ink sm:px-10 lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-auth-brand-line bg-auth-brand-soft">
              <LayersOutlinedIcon aria-hidden="true" fontSize="medium" />
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              ProManage
            </span>
          </div>

          <div className="mt-10 hidden lg:block">
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.035em]">
              Plan clearly. Deliver with confidence.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-auth-brand-muted">
              Project control for teams that turn plans into measurable
              progress.
            </p>
          </div>
        </div>

        <div className="mt-12 hidden space-y-6 lg:block">
          {benefits.map(({ title, description, icon: Icon }) => (
            <div className="flex max-w-sm gap-4" key={title}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-auth-brand-line bg-auth-brand-soft">
                <Icon aria-hidden="true" fontSize="small" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-auth-brand-muted">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 hidden border-t border-auth-brand-line pt-5 text-xs font-medium tracking-wide text-auth-brand-muted lg:block">
          Built for teams who take delivery seriously.
        </p>
      </section>

      <section className="grid place-items-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-lg">{children}</div>
      </section>
    </main>
  )
}
