import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Charts } from './components/ChartsPanel'
import { CourseDrawer } from './components/CourseDrawer'
import { CourseTable } from './components/CourseTable'
import { EmptyView, ErrorView, LoadingView } from './components/StateViews'
import { FiltersBar } from './components/FiltersBar'
import { StatsCards } from './components/StatsCards'
import { useDataset } from './hooks/useDataset'
import { useFiltersUrlSync } from './hooks/useFiltersUrlSync'
import { filterCourses, useFiltersStore } from './store/filters'

const TABS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'visualizacion', label: 'Visualización' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  useFiltersUrlSync()
  const { status, dataset, error, reload } = useDataset()
  const [tab, setTab] = useState<TabId>('catalogo')

  const filters = useFiltersStore()
  const reset = useFiltersStore((state) => state.reset)
  const setFilter = useFiltersStore((state) => state.setFilter)

  const courses = dataset?.courses ?? []
  const visibleCourses = useMemo(() => filterCourses(courses, filters), [courses, filters])
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === filters.selectedCourseId) ?? null,
    [courses, filters.selectedCourseId],
  )

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Dashboard de cursos de Udemy</h1>
          <p className="text-sm text-slate-400">
            ETL en Python sobre el export real de la biblioteca · frontend React que consume{' '}
            <code className="text-udemy-accent2">courses.json</code>
          </p>
        </div>
        {dataset && (
          <p className="text-xs text-slate-500">
            Dataset v{dataset.contractVersion} · generado {dataset.generatedAt.slice(0, 10)} desde{' '}
            {dataset.source}
          </p>
        )}
      </header>

      {status === 'loading' && <LoadingView />}
      {status === 'error' && error && <ErrorView error={error} onRetry={reload} />}

      {status === 'ready' && dataset && (
        <>
          <StatsCards summary={dataset.summary} visibleCourses={visibleCourses} />
          <FiltersBar courses={courses} visibleCount={visibleCourses.length} />

          <nav className="flex gap-2">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="relative rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:text-slate-100"
              >
                {tab === item.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-udemy-accent/20 ring-1 ring-udemy-accent/60"
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </nav>

          {visibleCourses.length === 0 ? (
            <EmptyView onReset={reset} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'catalogo' ? (
                  <CourseTable courses={visibleCourses} />
                ) : (
                  <Charts courses={visibleCourses} />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          <CourseDrawer
            course={selectedCourse}
            onClose={() => setFilter('selectedCourseId', null)}
          />
        </>
      )}
    </div>
  )
}
