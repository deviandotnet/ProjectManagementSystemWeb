import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined'

const benefits = [
  {
    title: 'Clear ownership',
    description: 'Assign, track, and move work forward with confidence.',
    icon: Groups2OutlinedIcon,
  },
  {
    title: 'Visible schedules',
    description: 'Turn plans into progress with real-time insight.',
    icon: CalendarMonthOutlinedIcon,
  },
  {
    title: 'Accountable delivery',
    description: 'Keep commitments tied to measurable outcomes.',
    icon: QueryStatsOutlinedIcon,
  },
]

function ProjectBlueprint() {
  const cells = Array.from({ length: 24 }, (_, index) => index)

  return (
    <div
      aria-hidden="true"
      className="relative mt-10 hidden h-56 max-w-lg overflow-hidden border-y border-auth-brand-line/60 lg:block"
    >
      <div className="grid h-full grid-cols-6 grid-rows-4 opacity-50">
        {cells.map((cell) => (
          <span
            className="border-r border-b border-auth-brand-line/50"
            key={cell}
          />
        ))}
      </div>
      <span className="absolute left-[12%] top-[18%] size-36 rounded-full border border-auth-brand-muted/35" />
      <span className="absolute left-[10%] top-[42%] h-px w-[54%] -rotate-[8deg] bg-auth-brand-muted/50" />
      <span className="absolute bottom-[20%] left-[42%] h-px w-[48%] -rotate-45 bg-auth-brand-muted/50" />
      <span className="absolute left-[9%] top-[41%] size-3 border border-auth-brand-muted bg-auth-brand" />
      <span className="absolute left-[56%] top-[49%] size-3 border border-auth-brand-muted bg-auth-brand" />
      <span className="absolute bottom-[12%] right-[8%] size-3 border border-auth-brand-muted bg-auth-brand" />
      <span className="absolute left-[9%] top-[8%] font-mono text-[0.65rem] tracking-widest text-auth-brand-muted">
        PEOPLE
      </span>
      <span className="absolute right-[8%] top-[8%] font-mono text-[0.65rem] tracking-widest text-auth-brand-muted">
        PLANS
      </span>
      <span className="absolute bottom-[6%] left-[8%] font-mono text-[0.65rem] tracking-widest text-auth-brand-muted">
        PROJECTS
      </span>
      <span className="absolute bottom-[6%] right-[8%] font-mono text-[0.65rem] tracking-widest text-auth-brand-muted">
        DELIVERY
      </span>
    </div>
  )
}

export function AuthLayout({ children }) {
  return (
    <main className="grid min-h-[100dvh] bg-auth-canvas text-auth-ink md:grid-cols-[minmax(20rem,38%)_minmax(0,62%)]">
      <section className="relative overflow-hidden bg-auth-brand px-5 py-5 text-auth-brand-ink sm:px-8 md:flex md:min-h-[100dvh] md:flex-col md:px-10 md:py-9 lg:px-14 lg:py-11">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-auth-brand-line bg-auth-brand-soft">
              <LayersOutlinedIcon aria-hidden="true" fontSize="medium" />
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              Workline
            </span>
          </div>

          <div className="mt-7 hidden md:block">
            <p className="font-mono text-xl tracking-[0.08em] text-auth-brand-ink lg:text-2xl">
              Plan. Build. Deliver.
              <span className="ml-3 inline-block w-10 border-t border-auth-brand-muted align-middle" />
            </p>
            <p className="mt-6 max-w-xs font-mono text-sm leading-6 text-auth-brand-muted lg:text-base lg:leading-7">
              Project control for teams that move things forward.
            </p>
          </div>

          <ProjectBlueprint />
        </div>

        <div className="mt-auto hidden space-y-5 pt-9 md:block">
          {benefits.map(({ title, description, icon: Icon }) => (
            <div className="flex max-w-md items-start gap-4" key={title}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-auth-brand-line bg-auth-brand-soft">
                <Icon aria-hidden="true" fontSize="small" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 max-w-xs font-mono text-xs leading-5 text-auth-brand-muted">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 hidden border-t border-auth-brand-line pt-5 font-mono text-[0.65rem] tracking-widest text-auth-brand-muted md:block">
          TRUSTED BY TEAMS WHO BUILD WHAT&apos;S NEXT.
        </p>
      </section>

      <section className="relative grid place-items-center px-4 py-8 sm:px-8 md:px-10 md:py-10 lg:px-14">
        <p className="absolute right-8 top-6 hidden max-w-48 font-mono text-[0.65rem] leading-4 tracking-wider text-auth-muted xl:block">
          DISCIPLINED PROJECTS
          <br />
          DELIVER REAL OUTCOMES
        </p>
        <div className="w-full max-w-3xl">{children}</div>
      </section>
    </main>
  )
}
