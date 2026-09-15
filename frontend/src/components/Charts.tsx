import { useMemo } from 'react'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { BUCKET_LABELS } from '../lib/format'
import type { Course } from '../lib/schema'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)
ChartJS.defaults.color = '#94a3b8'
ChartJS.defaults.borderColor = '#1f2a44'

const ACCENT = '#a435f0'
const BUCKET_COLORS: Record<string, string> = {
  completado: '#22c55e',
  'en-progreso': '#22d3ee',
  'sin-empezar': '#475569',
}

export function TechnologiesChart({ courses }: { courses: Course[] }) {
  const { labels, values } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const course of courses) {
      for (const tech of course.technologies) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
    return { labels: top.map(([tech]) => tech), values: top.map(([, count]) => count) }
  }, [courses])

  return (
    <article className="panel p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Top 12 tecnologías y temas</h3>
      <div className="h-80">
        <Bar
          data={{
            labels,
            datasets: [{ label: 'Cursos', data: values, backgroundColor: ACCENT, borderRadius: 4 }],
          }}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#1f2a44' } }, y: { grid: { display: false } } },
          }}
        />
      </div>
    </article>
  )
}

export function ProgressChart({ courses }: { courses: Course[] }) {
  const buckets = useMemo(() => {
    const counts: Record<string, number> = { completado: 0, 'en-progreso': 0, 'sin-empezar': 0 }
    for (const course of courses) counts[course.progressBucket] += 1
    return counts
  }, [courses])

  const labels = Object.keys(buckets)

  return (
    <article className="panel p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Estado de avance</h3>
      <div className="h-80">
        <Doughnut
          data={{
            labels: labels.map((key) => BUCKET_LABELS[key]),
            datasets: [
              {
                data: labels.map((key) => buckets[key]),
                backgroundColor: labels.map((key) => BUCKET_COLORS[key]),
                borderColor: '#121828',
                borderWidth: 2,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      </div>
    </article>
  )
}

export function HoursByCategoryChart({ courses }: { courses: Course[] }) {
  const { labels, values } = useMemo(() => {
    const hours = new Map<string, number>()
    for (const course of courses) {
      const current = hours.get(course.category) ?? 0
      hours.set(course.category, current + (course.durationMinutes ?? 0) / 60)
    }
    const top = [...hours.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    return {
      labels: top.map(([category]) => category),
      values: top.map(([, value]) => Math.round(value)),
    }
  }, [courses])

  return (
    <article className="panel p-4 lg:col-span-2">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Horas de contenido por categoría</h3>
      <div className="h-72">
        <Bar
          data={{
            labels,
            datasets: [
              { label: 'Horas', data: values, backgroundColor: '#22d3ee', borderRadius: 4 },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: '#1f2a44' } }, x: { grid: { display: false } } },
          }}
        />
      </div>
    </article>
  )
}
