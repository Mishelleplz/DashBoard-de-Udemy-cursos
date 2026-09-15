import { useMemo } from 'react'
import { motion } from 'motion/react'
import { formatDuration, planFinishDate } from '../lib/eta'
import { formatHours } from '../lib/format'
import type { Course } from '../lib/schema'
import { useFiltersStore } from '../store/filters'

export function StudyPlanner({ courses }: { courses: Course[] }) {
  const weeklyHours = useFiltersStore((state) => state.weeklyHours)
  const setFilter = useFiltersStore((state) => state.setFilter)

  const remainingMinutes = useMemo(
    () => courses.reduce((total, course) => total + (course.remainingMinutes ?? 0), 0),
    [courses],
  )

  const plan = planFinishDate(remainingMinutes, weeklyHours)

  return (
    <article className="panel space-y-4 p-4">
      <header>
        <h3 className="text-sm font-semibold text-slate-200">
          ¿Cuándo termino la selección actual?
        </h3>
        <p className="text-xs text-slate-500">
          Fecha calculada con Temporal sobre {formatHours(remainingMinutes)} pendientes.
        </p>
      </header>

      <label className="block">
        <span className="mb-1 flex justify-between text-xs text-slate-400">
          <span>Ritmo de estudio</span>
          <span className="text-slate-200">{weeklyHours} h/semana</span>
        </span>
        <input
          type="range"
          min={1}
          max={40}
          step={1}
          value={weeklyHours}
          onChange={(event) => setFilter('weeklyHours', Number(event.target.value))}
          className="w-full accent-udemy-accent"
        />
      </label>

      {plan ? (
        <motion.div
          key={`${plan.finishLabel}-${plan.weeklyHours}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-2xl font-semibold text-slate-100">{plan.finishLabel}</p>
          <p className="text-xs text-slate-400">
            Faltan {formatDuration(plan.duration)} ({Math.ceil(plan.weeksNeeded)} semanas a este
            ritmo).
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            {plan.milestones.map((milestone) => (
              <li key={milestone.label} className="flex justify-between">
                <span>{milestone.label} del catálogo</span>
                <span className="text-slate-300">{milestone.dateLabel}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : (
        <p className="text-sm text-slate-500">
          No queda contenido pendiente en la selección actual.
        </p>
      )}
    </article>
  )
}
