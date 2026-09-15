import { useMemo } from 'react'
import { BUCKET_LABELS, STATUS_LABELS, formatNumber } from '../lib/format'
import type { Course } from '../lib/schema'
import { activeFilterCount, useFiltersStore } from '../store/filters'

interface Props {
  courses: Course[]
  visibleCount: number
}

export function FiltersBar({ courses, visibleCount }: Props) {
  const filters = useFiltersStore()
  const setFilter = useFiltersStore((state) => state.setFilter)
  const reset = useFiltersStore((state) => state.reset)

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category))].sort((a, b) => a.localeCompare(b)),
    [courses],
  )

  const technologies = useMemo(() => {
    const counts = new Map<string, number>()
    for (const course of courses) {
      for (const tech of course.technologies) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([tech]) => tech)
  }, [courses])

  const active = activeFilterCount(filters)

  return (
    <section className="panel space-y-3 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="xl:col-span-2">
          <span className="mb-1 block text-xs text-slate-400">Buscar curso, instructor o tema</span>
          <input
            className="input"
            type="search"
            placeholder="React, Python, Alvaro Chirou…"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs text-slate-400">Estado</span>
          <select
            className="input"
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
          >
            <option value="all">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-slate-400">Avance</span>
          <select
            className="input"
            value={filters.bucket}
            onChange={(event) => setFilter('bucket', event.target.value)}
          >
            <option value="all">Todos</option>
            {Object.entries(BUCKET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-slate-400">Categoría</span>
          <select
            className="input"
            value={filters.category}
            onChange={(event) => setFilter('category', event.target.value)}
          >
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-slate-400">Tecnología</span>
          <select
            className="input"
            value={filters.technology}
            onChange={(event) => setFilter('technology', event.target.value)}
          >
            <option value="all">Todas</option>
            {technologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-udemy-accent"
            checked={filters.onlyWithCurriculum}
            onChange={(event) => setFilter('onlyWithCurriculum', event.target.checked)}
          />
          Solo con temario
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          {formatNumber(visibleCount)} de {formatNumber(courses.length)} cursos
          {active > 0 && ` · ${active} filtro${active > 1 ? 's' : ''} activo${active > 1 ? 's' : ''}`}
          {' · los filtros viven en la URL, puedes compartirla'}
        </span>
        <button
          type="button"
          onClick={reset}
          disabled={active === 0}
          className="rounded-lg border border-udemy-border px-3 py-1 transition hover:border-udemy-accent disabled:opacity-40"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}
