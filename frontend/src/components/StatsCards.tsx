import { motion } from 'motion/react'
import { formatHours, formatNumber } from '../lib/format'
import type { Course, Summary } from '../lib/schema'

interface Props {
  summary: Summary
  visibleCourses: Course[]
}

export function StatsCards({ summary, visibleCourses }: Props) {
  const visibleMinutes = visibleCourses.reduce((total, c) => total + (c.durationMinutes ?? 0), 0)
  const cards = [
    {
      label: 'Cursos en la biblioteca',
      value: formatNumber(summary.courseCount),
      hint: `${formatNumber(visibleCourses.length)} visibles con los filtros`,
    },
    {
      label: 'Horas de contenido',
      value: formatHours(summary.totalMinutes),
      hint: `${formatHours(visibleMinutes)} en la selección actual`,
    },
    {
      label: 'Cursos empezados',
      value: formatNumber(summary.inProgressCount + summary.completedCount),
      hint: `${formatNumber(summary.completedCount)} completados al 100%`,
    },
    {
      label: 'Horas pendientes',
      value: formatHours(summary.remainingMinutes),
      hint: `${formatHours(summary.watchedMinutes)} ya vistas`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.article
          key={card.label}
          className="panel p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{card.value}</p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
        </motion.article>
      ))}
    </div>
  )
}
