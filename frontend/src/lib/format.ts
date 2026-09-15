const numberFormatter = new Intl.NumberFormat('es-ES')

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numberFormatter.format(Math.round(value))
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—'
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${rest}m`
  return `${numberFormatter.format(hours)}h ${rest}m`
}

export function formatHours(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—'
  return `${numberFormatter.format(Math.round(minutes / 60))} h`
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  unavailable: 'No disponible',
  practice_exam: 'Examen de práctica',
}

export const BUCKET_LABELS: Record<string, string> = {
  completado: 'Completado',
  'en-progreso': 'En progreso',
  'sin-empezar': 'Sin empezar',
}
