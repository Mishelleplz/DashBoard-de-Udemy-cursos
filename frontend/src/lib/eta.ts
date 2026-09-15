import { Temporal } from 'temporal-polyfill'

export interface StudyPlan {
  remainingMinutes: number
  weeklyHours: number
  weeksNeeded: number
  daysNeeded: number
  finishDate: Temporal.PlainDate
  finishLabel: string
  duration: Temporal.Duration
  milestones: Array<{ label: string; date: Temporal.PlainDate; dateLabel: string }>
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatPlainDate(date: Temporal.PlainDate): string {
  return dateFormatter.format(new Date(date.year, date.month - 1, date.day))
}

/**
 * Calcula cuándo se termina el catálogo pendiente con un ritmo de estudio dado.
 * Usa Temporal para la aritmética de calendario (no minutos * 86400000).
 */
export function planFinishDate(
  remainingMinutes: number,
  weeklyHours: number,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO(),
): StudyPlan | null {
  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || remainingMinutes <= 0) {
    return null
  }

  const weeksNeeded = remainingMinutes / 60 / weeklyHours
  const daysNeeded = Math.ceil(weeksNeeded * 7)
  const finishDate = today.add({ days: daysNeeded })
  const duration = today.until(finishDate, {
    largestUnit: 'year',
    smallestUnit: 'day',
  })

  const milestones = [0.25, 0.5, 0.75].map((fraction) => {
    const date = today.add({ days: Math.ceil(daysNeeded * fraction) })
    return {
      label: `${Math.round(fraction * 100)}%`,
      date,
      dateLabel: formatPlainDate(date),
    }
  })

  return {
    remainingMinutes,
    weeklyHours,
    weeksNeeded,
    daysNeeded,
    finishDate,
    finishLabel: formatPlainDate(finishDate),
    duration,
    milestones,
  }
}

export function formatDuration(duration: Temporal.Duration): string {
  const balanced = duration.round({ largestUnit: 'year', smallestUnit: 'day' })
  const parts: string[] = []
  if (balanced.years) parts.push(`${balanced.years} ${balanced.years === 1 ? 'año' : 'años'}`)
  if (balanced.months) parts.push(`${balanced.months} ${balanced.months === 1 ? 'mes' : 'meses'}`)
  if (balanced.days) parts.push(`${balanced.days} ${balanced.days === 1 ? 'día' : 'días'}`)
  return parts.length ? parts.join(', ') : 'menos de un día'
}
